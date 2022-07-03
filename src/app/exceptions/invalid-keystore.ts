import { BaseException } from './base-exception';
import { ErrorOptions } from './error-options';

export class InvalidKeystoreException extends BaseException {
  constructor(message: string, options?: ErrorOptions) {
    super(
      'InvalidKeystoreException',
      message,
      'The keystore is invalid',
      options
    );
  }
}
