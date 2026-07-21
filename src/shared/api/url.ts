import { Config } from 'effect';

export const AskitServerUrl = Config.string('PUBLIC_ASKIT_SERVER_URL').pipe(
  Config.validate({
    message: 'Expected a string at least 1 character long',
    validation: (value) => value.length >= 1,
  }),
  Config.validate({
    message: 'Expected a string that does not end with a slash',
    validation: (value) => value.endsWith('/') === false,
  })
);

export const AskitWebSocketUrl = Config.string('PUBLIC_ASKIT_WEBSOCKET_URL').pipe(
  Config.validate({
    message: 'Expected a string at least 1 character long',
    validation: (value) => value.length >= 1,
  }),
  Config.validate({
    message: 'Expected a string that does not end with a slash',
    validation: (value) => value.endsWith('/') === false,
  })
);
