import { BaseException } from './base-exception';

export class UnknownException extends BaseException {
  constructor(message: string, ...param: any[]) {
    super('UnknownException', message, 'Unknown Exception', ...param);
  }
}
