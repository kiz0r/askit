import { Config } from 'effect';

/**
 * Validation rule type for API urls.
 * @internal
 */
type ValidationRule = {
  readonly message: string;
  readonly validation: (s: string) => boolean;
};

/**
 * Validation rules for API urls.
 * @internal
 */
const apiUrlValidationRules: readonly ValidationRule[] = [
  {
    message: 'Expected a string at least 1 character long',
    validation: (s) => s.length >= 1,
  },
  {
    message: 'Expected a string that does not end with a slash',
    validation: (s) => s.endsWith('/') === false,
  },
];

export const AskitServerUrl = Config.string('PUBLIC_ASKIT_SERVER_URL').pipe((config) =>
  apiUrlValidationRules.reduce(
    (self, rule) =>
      Config.validate(self, {
        message: rule.message,
        validation: rule.validation,
      }),
    config
  )
);
