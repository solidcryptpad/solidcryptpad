import { BaseException } from './base-exception';
import { ErrorOptions } from './error-options';

export class AlreadyExistsException extends BaseException {
  constructor(message: string, options?: ErrorOptions) {
    super('AlreadyExistsException', message, 'File already exists', options);
  }
}
