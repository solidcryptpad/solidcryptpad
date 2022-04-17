export class InvalidUrlException extends Error {
  public title: string;

  constructor(message: string) {
    super();

    this.name = 'InvalidUrlException';
    this.title = 'url not valid';
    this.message = message;
  }
}
