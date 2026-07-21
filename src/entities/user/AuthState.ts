import type { User } from './User';

type LoadingState = {
  readonly _tag: 'loading';
};

type AuthenticatedState = {
  readonly _tag: 'authenticated';
  readonly user: User;
};

type UnauthenticatedState = {
  readonly _tag: 'unauthenticated';
};

type SessionExpiredState = {
  readonly _tag: 'sessionExpired';
};

export type AuthState =
  | LoadingState
  | AuthenticatedState
  | UnauthenticatedState
  | SessionExpiredState;

export const AuthState = {
  loading: (): LoadingState => ({ _tag: 'loading' }),
  authenticated: (user: User): AuthenticatedState => ({ _tag: 'authenticated', user }),
  unauthenticated: (): UnauthenticatedState => ({ _tag: 'unauthenticated' }),
  sessionExpired: (): SessionExpiredState => ({ _tag: 'sessionExpired' }),
} as const;
