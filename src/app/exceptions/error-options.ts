import { BaseException } from './base-exception';
import { UnknownException } from './unknown-exception';

/**
 * @param context context of the error
 * @returns function that throws errors with specified context
 * @example
 * fetch(url).catch(throwWithContext('could not fetch document'))
 */
export const throwWithContext = (context: string) => (error: Error) => {
  if (error instanceof BaseException) {
    error.title = context;
  } else {
    error = new UnknownException(context, { cause: error });
  }
  throw error;
};

export interface ErrorOptions {
  cause?: Error;
}
