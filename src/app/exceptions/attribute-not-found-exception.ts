export class AttributeNotFoundException extends Error {
  public title: string;

  constructor(message: string) {
    super();

    this.name = 'AttributeNotFoundException';
    this.title = 'No such attribute';
    this.message = message;
  }
}
