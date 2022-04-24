export class RequiresLoginException extends Error {
  public title: string;

  constructor(message: string) {
    super();

    this.name = 'RequiresLoginException';
    this.title = 'Login required';
    this.message = message;
  }
}
