import { BaseException } from './base-exception';

export class InvalidUrlException extends BaseException {
  constructor(message: string, ...param: any[]) {
    super('InvalidUrlException', message, 'Invalid Url', ...param);
  }
}
