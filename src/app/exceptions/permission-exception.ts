import { BaseException } from './base-exception';
import { ErrorOptions } from './error-options';

export class PermissionException extends BaseException {
  constructor(message: string, options?: ErrorOptions) {
    super('PermissionException', message, 'Permission denied', options);
  }
}
