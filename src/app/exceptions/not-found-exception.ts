import { BaseException, DisplayType } from './base-exception';

export class NotFoundException extends BaseException {
  constructor(message: string) {
    super('NotFoundException', message, 'File not found', DisplayType.ERROR);
  }
}
