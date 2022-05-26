import { BaseException } from './base-exception';
import { ErrorOptions } from './error-options';

export class NotACryptpadUrlException extends BaseException {
  constructor(message: string, options?: ErrorOptions) {
    super(
      'NotACryptpadUrlException',
      message,
      'Url has to include solidcryptpad',
      options
    );
  }
}
