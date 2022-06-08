import { BaseException } from './base-exception';
import { ErrorOptions } from './error-options';

export class SolidPodException extends BaseException {
  constructor(message: string, options?: ErrorOptions) {
    super('SolidPodException', message, 'Server returned 500', options);
  }
}
