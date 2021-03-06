import { BaseException } from './base-exception';
import { ErrorOptions } from './error-options';

export class NotFoundException extends BaseException {
  constructor(message: string, options?: ErrorOptions) {
    super('NotFoundException', message, 'File not found', options);
  }
}
