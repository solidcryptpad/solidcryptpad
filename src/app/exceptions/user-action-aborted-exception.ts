import { BaseException } from './base-exception';
import { ErrorOptions } from './error-options';

export class UserActionAbortedException extends BaseException {
  constructor(message: string, options?: ErrorOptions) {
    super(
      'UserActionAbortedException',
      message,
      'User Action Aborted',
      options
    );
  }
}
