import { Fetch, Response } from 'fx-fetch';
import { describe, expect, it } from 'vitest';
import { isHttpErrorRecoverable } from './isHttpErrorRecoverable';

/**
 * The retry policy decides which failures the user waits through and which are
 * reported at once. Getting it wrong is silent: a wrongly retried request just
 * feels slow, and a wrongly abandoned one just looks broken.
 */
const notOk = (status: number) =>
  new Response.NotOkError({
    response: Response.unsafeMake(new globalThis.Response(null, { status })),
    reason: status >= 500 ? 'server-error' : 'client-error',
  });

describe('isHttpErrorRecoverable', () => {
  it.each([429, 502, 503, 504])('retries %i', (status) => {
    expect(isHttpErrorRecoverable(notOk(status))).toBe(true);
  });

  it('does not retry a plain 500', () => {
    // A 500 is usually a deterministic server bug: the same request would
    // trigger it again, so the user is told immediately instead of waiting.
    expect(isHttpErrorRecoverable(notOk(500))).toBe(false);
  });

  it.each([400, 404, 422])('does not retry %i', (status) => {
    expect(isHttpErrorRecoverable(notOk(status))).toBe(false);
  });

  it('retries a network failure', () => {
    const error = new Fetch.FetchError({ message: 'offline', cause: new TypeError('offline') });
    expect(isHttpErrorRecoverable(error)).toBe(true);
  });

  it('does not retry a request the caller aborted', () => {
    const error = new Fetch.AbortError({ message: 'aborted', cause: new Error('aborted') });
    expect(isHttpErrorRecoverable(error)).toBe(false);
  });
});
