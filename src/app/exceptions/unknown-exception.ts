import { BaseException } from './base-exception';

export class UnknownException extends BaseException {
  constructor(message: string) {
    super('UnknownException', message, 'Unknown Exception');
  }
}
