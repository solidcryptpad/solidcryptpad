import { BaseException } from './base-exception';
import { ErrorOptions } from './error-options';

export class NotImplementedException extends BaseException {
  constructor(message: string, options?: ErrorOptions) {
    super(
      'NotImplementedException',
      message,
      'This feature  has not been implemented yet',
      options
    );
  }
}
