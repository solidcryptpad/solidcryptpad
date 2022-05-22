import { BaseException } from './base-exception';
import { ErrorOptions } from './error-options';

export class KeyNotFoundException extends BaseException {
  constructor(message: string, options?: ErrorOptions) {
    super('KeyNotFoundException', message, 'Decryption key not found', options);
  }
}
