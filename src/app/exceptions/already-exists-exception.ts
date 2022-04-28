import { BaseException, DisplayType } from './base-exception';

export class AlreadyExistsException extends BaseException {
  constructor(message: string) {
    super(
      'AlreadyExistsException',
      message,
      'File already exists',
      DisplayType.ERROR
    );
  }
}
