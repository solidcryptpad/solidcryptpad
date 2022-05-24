import { BaseException } from './base-exception';
import { ErrorOptions } from './error-options';

export class WrongMasterPasswordException extends BaseException {
  constructor(message: string, options?: ErrorOptions) {
    super(
      'WrongMasterPasswordException',
      message,
      'Wrong master password',
      options
    );
  }
}
