import type { GameStatus } from '@/entities/game';

type RoomStatus = 'waiting' | 'in_progress' | 'question' | 'revealing' | 'finished';

/**
 * Maps a server room status to the client-side game status. `in_progress` keeps
 * whatever state the client is already in (question or revealing), and the
 * remaining statuses already match a `GameStatus` and pass through.
 */
export function roomStatusToGameStatus(status: RoomStatus, prevStatus: GameStatus): GameStatus {
  switch (status) {
    case 'waiting':
      return 'lobby';

    case 'in_progress':
      return prevStatus;

    case 'revealing':
      return 'question';

    case 'finished':
      return 'finished';

    case 'question':
      return 'question';

    default: {
      // Unreachable code. This will never happen due to a strict contract between the frontend and backend
      const _exhaustiveCheck: never = status;
      throw new Error(`Unexpected room status received: ${_exhaustiveCheck}.`);
    }
  }
}
