import { BaseException } from './base-exception';
import { ErrorOptions } from './error-options';

export class WrongDecriptionKeyException extends BaseException {
  constructor(message: string, options?: ErrorOptions) {
    super('WrongDecriptionKey', message, 'Wrong Decription Key', options);
  }
}
