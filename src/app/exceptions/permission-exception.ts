import { BaseException } from './base-exception';

export class PermissionException extends BaseException {
  constructor(message: string, ...param: any[]) {
    super('PermissionException', message, 'Permission denied', ...param);
  }
}
