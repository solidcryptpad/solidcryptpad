import { BaseException } from './base-exception';

export class RequiresLoginException extends BaseException {
  constructor(message: string) {
    super('RequiresLoginException', message, 'Login required');
  }
}
