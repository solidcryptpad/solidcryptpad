import { BaseException, DisplayType } from './base-exception';

export class AttributeNotFoundException extends BaseException {
  constructor(message: string) {
    super(
      'AttributeNotFoundException',
      message,
      'No such attribute',
      DisplayType.ERROR
    );
  }
}
