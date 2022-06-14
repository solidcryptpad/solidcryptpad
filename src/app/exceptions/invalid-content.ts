import { BaseException } from './base-exception';
import { ErrorOptions } from './error-options';

export class InvalidContentException extends BaseException {
  constructor(message: string, options?: ErrorOptions) {
    super('InvalidContentException', message, 'Invalid content', options);
  }
}
