import { Socket } from '@effect/platform';
import { Effect, Either, Queue, Ref, Schedule, Schema } from 'effect';
import { AskitWebSocketUrl } from '@/shared/api';
import { Toast } from '@/shared/toasts';
import type { ClientMessage } from './ClientMessage';
import { type ServerMessage, ServerMessageSchema } from './ServerMessage';

/**
 * Called for every decoded server message. The hook supplies this to fold the
 * message into the game state and raise any user-facing toasts.
 */
type MessageHandler = (message: ServerMessage) => Effect.Effect<void>;

// Parses the JSON wire string and validates it against the message union in one
// step; a frame that matches no known shape decodes to a Left and is ignored.
const decodeFrame = Schema.parseJson(ServerMessageSchema).pipe(Schema.decodeUnknownEither);

const CONNECTION_ISSUE_TOAST_THRESHOLD = 3;

// Reconnect backoff after a connection failure: exponential from 300ms, capped
// at 5s (the union takes the smaller delay once the exponential grows past it),
// with jitter to spread many clients' retries.
const socketConnectionRetry = Schedule.exponential('300 millis', 2).pipe(
  Schedule.union(Schedule.spaced('5 seconds')),
  Schedule.jittered
);

/**
 * Decodes one inbound frame and hands the message to `onMessage`. Frames that
 * match no known shape are logged and skipped so a stray frame never tears the
 * connection down. `runRaw` delivers text frames as strings, which the JSON
 * schema consumes directly.
 */
function handleFrame(onMessage: MessageHandler) {
  return (data: string | Uint8Array) =>
    Effect.gen(function* () {
      const decoded = decodeFrame(data);
      if (Either.isLeft(decoded)) {
        yield* Effect.logDebug('Ignoring unrecognized game frame.', decoded.left.message);
        return;
      }

      yield* onMessage(decoded.right);
    });
}

/**
 * Opens one connection to `url`, drains the outbound mailbox into the socket for
 * the lifetime of the connection, and runs until the socket closes (success) or
 * errors (failure). `onOpen` clears the failure counter once the socket is live.
 */
function connectOnce(
  url: string,
  outbound: Queue.Dequeue<ClientMessage>,
  onMessage: MessageHandler,
  failedAttempts: Ref.Ref<number>
) {
  return Effect.gen(function* () {
    const socket = yield* Socket.makeWebSocket(url);

    yield* Effect.scoped(
      Effect.gen(function* () {
        const write = yield* socket.writer;

        // Pump: take each queued client message and write it to the live socket.
        // A message enqueued while disconnected simply waits for the next
        // connection to drain it rather than being lost.
        yield* Effect.forkScoped(
          Effect.forever(
            Queue.take(outbound).pipe(
              Effect.flatMap((message) => write(JSON.stringify(message)).pipe(Effect.ignore))
            )
          )
        );

        yield* socket.runRaw(handleFrame(onMessage), {
          onOpen: Ref.set(failedAttempts, 0),
        });
      })
    );
  });
}

/**
 * Long-running connection loop for `url`: retries connection failures with
 * backoff (raising a toast after repeated failures) and re-opens after a clean
 * close, so the game recovers from the server's `room_state` snapshot. Never
 * completes under normal operation.
 */
function listen(url: string, outbound: Queue.Dequeue<ClientMessage>, onMessage: MessageHandler) {
  return Effect.gen(function* () {
    const failedAttempts = yield* Ref.make(0);

    yield* connectOnce(url, outbound, onMessage, failedAttempts).pipe(
      Effect.tapError(() =>
        Effect.gen(function* () {
          const attempts = yield* Ref.updateAndGet(failedAttempts, (n) => n + 1);
          if (attempts === CONNECTION_ISSUE_TOAST_THRESHOLD) {
            yield* Effect.sync(() =>
              Toast.danger({
                title: 'Connection issue',
                description: 'Having trouble connecting. Retrying...',
              })
            );
          }
        })
      ),
      Effect.retry(socketConnectionRetry),
      // A clean close completes `connectOnce` normally; re-open after a short pause.
      Effect.repeat(Schedule.spaced('1 second')),
      Effect.asVoid
    );
  }).pipe(Effect.provide(Socket.layerWebSocketConstructorGlobal));
}

export const makeGameSocket = Effect.fn('makeGameSocket')(function* (
  roomCode: string,
  outbound: Queue.Dequeue<ClientMessage>,
  onMessage: MessageHandler
) {
  const webSocketUrl = yield* AskitWebSocketUrl;
  return yield* listen(`${webSocketUrl}/ws/game/${roomCode}`, outbound, onMessage);
});

export const makeHostSocket = Effect.fn('makeHostSocket')(function* (
  roomCode: string,
  outbound: Queue.Dequeue<ClientMessage>,
  onMessage: MessageHandler
) {
  const webSocketUrl = yield* AskitWebSocketUrl;
  const url = `${webSocketUrl}/ws/game/${roomCode}/host`;
  return yield* listen(url, outbound, onMessage);
});
