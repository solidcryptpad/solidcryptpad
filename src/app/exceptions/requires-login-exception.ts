import { BaseException } from './base-exception';
import { ErrorOptions } from './error_options';

export class RequiresLoginException extends BaseException {
  constructor(message: string, options?: ErrorOptions) {
    super('RequiresLoginException', message, 'Login required', options);
  }
}
