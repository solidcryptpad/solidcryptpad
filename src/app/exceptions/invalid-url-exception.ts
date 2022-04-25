export class InvalidUrlException extends Error {
  public title: string;

  constructor(message: string) {
    super();

    this.name = 'InvalidUrlException';
    this.title = 'Url not valid';
    this.message = message;
  }
}
