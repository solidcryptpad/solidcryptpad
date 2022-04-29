import { BaseException } from './base-exception';

export class RequiresLoginException extends BaseException {
  constructor(message: string, ...param: any[]) {
    super('RequiresLoginException', message, 'Login required', ...param);
  }
}
