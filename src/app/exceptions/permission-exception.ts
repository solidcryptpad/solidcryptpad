import { BaseException } from './base-exception';

export class PermissionException extends BaseException {
  constructor(message: string) {
    super('PermissionException', message, 'Permission denied');
  }
}
