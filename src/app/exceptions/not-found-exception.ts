export class NotFoundException extends Error {
  public title: string;

  constructor(message: string) {
    super();

    this.name = 'NotFoundException';
    this.title = 'File not found';
    this.message = message;
  }
}
