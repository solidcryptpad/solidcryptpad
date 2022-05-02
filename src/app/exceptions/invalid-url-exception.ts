import { BaseException } from './base-exception';
import { ErrorOptions } from './error-options';

export class InvalidUrlException extends BaseException {
  constructor(message: string, options?: ErrorOptions) {
    super('InvalidUrlException', message, 'Invalid Url', options);
  }
}
