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

/**
 * An expired session is not a state of its own: the listener that catches a
 * SessionExpiredError resets this to unauthenticated and redirects, so there is
 * nothing for a fourth case to render.
 */
export type AuthState = LoadingState | AuthenticatedState | UnauthenticatedState;

export const AuthState = {
  loading: (): LoadingState => ({ _tag: 'loading' }),
  authenticated: (user: User): AuthenticatedState => ({ _tag: 'authenticated', user }),
  unauthenticated: (): UnauthenticatedState => ({ _tag: 'unauthenticated' }),
} as const;
