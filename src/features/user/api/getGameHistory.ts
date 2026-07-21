import { Effect, Schema } from 'effect';
import { Fetch, Request } from 'fx-fetch';
import { withAuthError } from '@/entities/user';
import { AskitServerUrl, handleContractErrors } from '@/shared/api';

export const GameHistoryItem = Schema.Struct({
  sessionId: Schema.String,
  roomCode: Schema.String,
  quizId: Schema.String,
  quizTitle: Schema.String,
  role: Schema.Literal('host', 'player'),
  score: Schema.NullOr(Schema.Number),
  rank: Schema.NullOr(Schema.Number),
  totalPlayers: Schema.Number,
  startedAt: Schema.NullOr(Schema.DateTimeUtc),
  endedAt: Schema.NullOr(Schema.DateTimeUtc),
  status: Schema.String,
});

export type GameHistoryItem = Schema.Schema.Type<typeof GameHistoryItem>;

const GameHistoryResponse = Schema.Struct({
  items: Schema.Array(GameHistoryItem),
  total: Schema.Number,
});

type Params = {
  readonly limit: number;
  readonly offset: number;
  readonly role: 'host' | 'player' | 'all';
};

export const getGameHistory = Effect.fn('getGameHistory')(
  function* (params: Params) {
    const baseUrl = yield* AskitServerUrl;
    const limit = params.limit;
    const offset = params.offset;
    const roleParam = params.role === 'all' ? '' : `&role=${params.role}`;

    const url = `${baseUrl}/api/v1/user/game-history?limit=${limit}&offset=${offset}${roleParam}`;

    const request = Request.unsafeMake({
      url,
      method: 'GET',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
    });

    return yield* Fetch.fetchJsonWithSchema(request, GameHistoryResponse);
  },
  withAuthError,
  handleContractErrors
);
