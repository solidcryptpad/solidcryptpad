import { BaseException } from './base-exception';
import { ErrorOptions } from './error_options';

export class AttributeNotFoundException extends BaseException {
  constructor(message: string, options?: ErrorOptions) {
    super('AttributeNotFoundException', message, 'No such attribute', options);
  }
}
