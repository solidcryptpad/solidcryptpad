import { BaseException } from './base-exception';
import { ErrorOptions } from './error-options';

export class EncryptionException extends BaseException {
  constructor(message: string, options?: ErrorOptions) {
    super('EncryptionException', message, 'Encryption Exception', options);
  }
}
