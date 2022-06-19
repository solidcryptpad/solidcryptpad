import { BaseException } from './base-exception';
import { ErrorOptions } from './error-options';

export class InvalidSharingLinkException extends BaseException {
  constructor(message: string, options?: ErrorOptions) {
    super(
      'InvalidSharingLinkException',
      message,
      'Invalid sharing link',
      options
    );
  }
}
