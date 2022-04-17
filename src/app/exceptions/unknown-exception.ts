export class UnknownException extends Error {
  public title: string;

  constructor(message: string) {
    super();

    this.name = 'UnknownException';
    this.title = 'Unknown Exception';
    this.message = message;
  }
}
