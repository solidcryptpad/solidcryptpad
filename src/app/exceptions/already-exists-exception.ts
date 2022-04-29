import { BaseException } from './base-exception';

export class AlreadyExistsException extends BaseException {
  constructor(message: string, ...param: any[]) {
    super('AlreadyExistsException', message, 'File already exists', ...param);
  }
}
