import { BaseException } from './base-exception';

export class NotFoundException extends BaseException {
  constructor(message: string, ...param: any[]) {
    super('NotFoundException', message, 'File not found', ...param);
  }
}
