export class AlreadyExistsException extends Error {
  public title: string;

  constructor(message: string) {
    super();

    this.name = 'AlreadyExistsException';
    this.title = 'File already exists';
    this.message = message;
  }
}
