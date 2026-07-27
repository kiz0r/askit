import type { GameStatus } from '@/entities/game';

/** Mirrors `GameSessionStatus` on the server. */
type RoomStatus = 'waiting' | 'starting' | 'question' | 'revealing' | 'finished';

/**
 * Maps a server room status to the client-side game status. `revealing` folds
 * into `question`, since the reveal is rendered on the question screen; the
 * remaining statuses map one to one.
 */
export function roomStatusToGameStatus(status: RoomStatus): GameStatus {
  switch (status) {
    case 'waiting':
      return 'lobby';

    case 'starting':
      return 'starting';

    case 'question':
    case 'revealing':
      return 'question';

    case 'finished':
      return 'finished';

    default: {
      // Unreachable code. This will never happen due to a strict contract between the frontend and backend
      const _exhaustiveCheck: never = status;
      throw new Error(`Unexpected room status received: ${_exhaustiveCheck}.`);
    }
  }
}
