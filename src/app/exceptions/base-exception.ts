import { ErrorOptions } from './error-options';

export class BaseException extends Error {
  override name: string;
  override message: string;
  cause?: Error;
  title: string;

  constructor(
    name: string,
    message: string,
    title = '',
    options?: ErrorOptions
  ) {
    super();

    if (options) {
      this.cause = options.cause;
    }

    this.name = name;
    this.message = message;
    this.title = title;
  }
}
