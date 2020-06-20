/* eslint-disable no-unused-expressions */
/* eslint-disable no-continue */
/* eslint-disable no-restricted-syntax */
export function validate(valueValidators: any, callback: (msg: string) => void) {
  for (const valueValidator of valueValidators) {
    if (valueValidator.length !== 2) {
      continue;
    }
    const [value, validators] = valueValidator;
    for (const validator of validators) {
      const errorMessage = validator(value);
      if (errorMessage) {
        callback && callback(errorMessage);
        return false;
      }
    }
  }

  return true;
}

export const required = (error: string) => (value: string) => (value && value.length > 0 ? null : error);

export const publicKey = (error: string) => (value: string) =>
  value && value.match('^[0-9a-fA-F]{66}$') ? null : error;

export const lessOrEqual = (value1: unknown, error: string) => (value: unknown) => (value1 >= value ? null : error);

export const equalValues = (value1: unknown, error: string) => (value: unknown) => (value1 === value ? null : error);
