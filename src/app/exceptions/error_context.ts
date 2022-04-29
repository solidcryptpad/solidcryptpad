import { BaseException } from './base-exception';
import { UnknownException } from './unknown-exception';

export const setErrorContext = (context: string) => (error: Error) => {
  if (error instanceof BaseException) {
    error.title = context;
  } else {
    error = new UnknownException(context, { cause: error });
  }
  throw error;
};
