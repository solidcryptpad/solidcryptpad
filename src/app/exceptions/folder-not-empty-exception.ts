import { BaseException } from './base-exception';
import { ErrorOptions } from './error-options';

export class FolderNotEmptyException extends BaseException {
  constructor(message: string, options?: ErrorOptions) {
    super('FolderNotEmptyException', message, 'Folder not empty', options);
  }
}
