import { BaseException } from './base-exception';
import { ErrorOptions } from './error-options';

export class UnknownException extends BaseException {
  constructor(message: string, options?: ErrorOptions) {
    super('UnknownException', message, 'Unknown Exception', options);
  }
}
