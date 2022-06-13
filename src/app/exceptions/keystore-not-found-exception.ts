import { BaseException } from './base-exception';
import { ErrorOptions } from './error-options';

export class KeystoreNotFoundException extends BaseException {
  constructor(message: string, options?: ErrorOptions) {
    super(
      'KeystoreNotFoundException',
      message,
      'Cannot find encryption keystore',
      options
    );
  }
}
