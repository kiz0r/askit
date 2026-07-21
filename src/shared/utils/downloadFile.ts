import { Data, Effect, Schema } from 'effect';

/**
 *  @internal Error that occurs when downloading a file fails
 */
class FileDownloadError extends Data.TaggedError('FileDownloadError')<{
  readonly cause: unknown;
}> {}

/**
 * @internal Function to trigger the download of a file by creating a temporary anchor element and virtually clicking it.
 */
const triggerDownload = (blob: Blob, filename: string) =>
  Effect.gen(function* () {
    const url = yield* Effect.acquireRelease(
      Effect.try({
        try: () => URL.createObjectURL(blob),
        catch: (cause) => new FileDownloadError({ cause }),
      }),
      (url) => Effect.sync(() => URL.revokeObjectURL(url))
    );

    const anchor = yield* Effect.acquireRelease(
      Effect.try({
        try: () => {
          const anchorElement = document.createElement('a');
          document.body.appendChild(anchorElement);
          return anchorElement;
        },
        catch: (cause) => new FileDownloadError({ cause }),
      }),
      (anchor) => Effect.sync(anchor.remove)
    );

    yield* Effect.try({
      try: () => {
        anchor.href = url;
        anchor.download = filename;
        anchor.click();
      },
      catch: (cause) => new FileDownloadError({ cause }),
    });
  }).pipe(Effect.scoped);

const encodeJson = Schema.parseJson(Schema.Unknown, { space: 2 }).pipe(Schema.encode);

/**
 * Function to download a file as JSON.
 */
export const downloadJson = (filename: string, data: unknown) =>
  Effect.gen(function* () {
    const json = yield* encodeJson(data);
    const blob = new Blob([json], { type: 'application/json' });
    yield* triggerDownload(blob, filename);
  });

const CSV_SPECIAL_CHARACTERS = /[",\r\n]/;

const escapeCell = (value: string): string =>
  CSV_SPECIAL_CHARACTERS.test(value) ? `"${value.replace(/"/g, '""')}"` : value;

const makeCsv = (headers: readonly string[], rows: readonly (readonly string[])[]): string =>
  [headers, ...rows].map((row) => row.map(escapeCell).join(',')).join('\r\n');

/**
 * Function to download a file as CSV.
 */
export const downloadCsv = (
  filename: string,
  headers: readonly string[],
  rows: readonly (readonly string[])[]
) =>
  Effect.gen(function* () {
    const blob = new Blob([makeCsv(headers, rows)], { type: 'text/csv;charset=utf-8;' });
    yield* triggerDownload(blob, filename);
  });
