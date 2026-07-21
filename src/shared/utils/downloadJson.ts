import { Effect, Schema } from 'effect';

const encodeJson = Schema.parseJson(Schema.Unknown, { space: 2 }).pipe(Schema.encode);

export const downloadJson = (filename: string, data: unknown) =>
  Effect.gen(function* () {
    const json = yield* encodeJson(data);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = filename;
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
    URL.revokeObjectURL(url);
  });
