export class BaseException extends Error {
  override name: string;
  override message: string;
  title: string;

  constructor(name: string, message: string, title = '', ...param: any[]) {
    super(...param);

    this.name = name;
    this.message = message;
    this.title = title;
  }
}
