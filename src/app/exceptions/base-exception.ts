export enum DisplayType {
  INFO,
  ERROR,
  HIDE,
  WARNING,
}

export class BaseException extends Error {
  override name: string;
  override message: string;
  title: string;
  type: DisplayType;

  constructor(
    name: string,
    message: string,
    title = '',
    type: DisplayType = DisplayType.ERROR
  ) {
    super();

    this.name = name;
    this.message = message;
    this.title = title;
    this.type = type;
  }
}
