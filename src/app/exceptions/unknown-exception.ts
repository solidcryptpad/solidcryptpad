import { BaseException, DisplayType } from './base-exception';

export class UnknownException extends BaseException {
  constructor(message: string) {
    super('UnknownException', message, 'Unknown Exception', DisplayType.ERROR);
  }
}
