import { BaseException } from './base-exception';

export class UnknownException extends BaseException {
  constructor(message: string, title = 'Unknown Exception') {
    super('UnknownException', message, title);
  }
}
