import { BaseException, DisplayType } from './base-exception';

export class InvalidUrlException extends BaseException {
  constructor(message: string) {
    super('InvalidUrlException', message, 'Invalid Url', DisplayType.ERROR);
  }
}
