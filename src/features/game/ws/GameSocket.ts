import { Data, Effect, Either, Queue, Schedule, Schema, Stream } from 'effect';
import { AskitWebSocketUrl } from '@/shared/api';
import { Toast } from '@/shared/toasts';
import type { ClientMessage } from './ClientMessage';
import { type ServerMessage, ServerMessageSchema } from './ServerMessage';

type SendFn = (msg: ClientMessage) => void;

class WsConnectError extends Data.TaggedError('WsConnectError')<{ readonly reason: string }> {}

const eitherMessageDecoder = Schema.decodeUnknownEither(ServerMessageSchema);

const parseIncomingMessage = (raw: unknown): ServerMessage | null => {
  const result = eitherMessageDecoder(raw);
  if (!Either.isRight(result)) {
    return null;
  }

  return result.right;
};

/**
 * Opens one WebSocket connection to `url`.
 *
 * Returns a Stream<ServerMessage> that ends when the socket closes (clean end, no error).
 * Fails with WsConnectError if the socket can't connect.
 *
 * `sendRef.fn` is updated to the live `ws.send` on open and reset to no-op on close.
 */
const openOnce = (
  url: string,
  sendRef: {
    /* mutable */ fn: SendFn;
  }
): Effect.Effect<Stream.Stream<ServerMessage>, WsConnectError> =>
  Effect.gen(function* () {
    const queue = yield* Queue.unbounded<ServerMessage>();

    let onClose: () => void;
    const closedPromise = new Promise<void>((resolve) => {
      onClose = resolve;
    });

    yield* Effect.async<void, WsConnectError>((resume) => {
      const webSocket = new WebSocket(url);

      webSocket.onopen = () => {
        sendRef.fn = (msg) => webSocket.send(JSON.stringify(msg));
        resume(Effect.void);
      };

      webSocket.onerror = () =>
        resume(Effect.fail(new WsConnectError({ reason: 'connection_failed' })));

      webSocket.onmessage = (event: MessageEvent) => {
        let raw: unknown;
        try {
          raw = JSON.parse(String(event.data));
        } catch {
          return;
        }
        const msg = parseIncomingMessage(raw);
        if (msg !== null) {
          Queue.unsafeOffer(queue, msg);
        }
      };

      webSocket.onclose = () => {
        sendRef.fn = () => {};
        onClose();
      };

      return Effect.sync(() => webSocket.close());
    });

    const stream = Stream.fromQueue(queue).pipe(
      Stream.interruptWhen(Effect.promise(() => closedPromise))
    );

    return stream;
  });

const socketConnectionRetry = Schedule.exponential('300 millis', 2).pipe(
  Schedule.andThen(Schedule.spaced('5 seconds')),
  Schedule.jittered
);

/**
 * Core reconnecting socket factory. URL-agnostic.
 *
 * Strategy:
 *   - Connection failure (onerror) → exponential retry capped at 5 s intervals
 *   - Clean disconnect (onclose) → `Stream.repeat` reconnects after 1 s
 */
const CONNECTION_ISSUE_TOAST_THRESHOLD = 3;

const makeSocket = (url: string) =>
  Effect.gen(function* () {
    const sendRef: { readonly fn: SendFn } = { fn: () => {} };
    let failedAttempts = 0;

    const stream = openOnce(url, sendRef).pipe(
      Effect.tapError(() =>
        Effect.sync(() => {
          failedAttempts += 1;
          if (failedAttempts === CONNECTION_ISSUE_TOAST_THRESHOLD) {
            Toast.danger({
              title: 'Connection issue',
              description: 'Having trouble connecting. Retrying...',
            });
          }
        })
      ),
      Effect.retry(socketConnectionRetry),
      Effect.tap(() =>
        Effect.sync(() => {
          failedAttempts = 0;
        })
      ),
      Stream.fromEffect,
      Stream.flatten(),
      Stream.retry(Schedule.spaced('1 second')),
      Stream.repeat(Schedule.spaced('1 second'))
    );

    const send: SendFn = (msg) => sendRef.fn(msg);

    return {
      stream,
      send,
    } as const;
  });

export const makeGameSocket = Effect.fn('makeGameSocket')(function* (roomCode: string) {
  const webSocketUrl = yield* AskitWebSocketUrl;
  const url = `${webSocketUrl}/ws/game/${roomCode}`;

  return yield* makeSocket(url);
});

export const makeHostSocket = Effect.fn('makeHostSocket')(function* (roomCode: string) {
  const webSocketUrl = yield* AskitWebSocketUrl;
  const url = `${webSocketUrl}/ws/game/${roomCode}/host`;

  return yield* makeSocket(url);
});
