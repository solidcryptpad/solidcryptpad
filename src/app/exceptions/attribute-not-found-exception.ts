import { BaseException } from './base-exception';

export class AttributeNotFoundException extends BaseException {
  constructor(message: string, ...param: any[]) {
    super('AttributeNotFoundException', message, 'No such attribute', param);
  }
}
