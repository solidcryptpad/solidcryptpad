import { BaseException, DisplayType } from './base-exception';

export class PermissionException extends BaseException {
  constructor(message: string) {
    super(
      'PermissionException',
      message,
      'Permission denied',
      DisplayType.ERROR
    );
  }
}
