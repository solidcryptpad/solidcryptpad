export class BaseException extends Error {
  override name: string;
  override message: string;
  title: string;

  constructor(name: string, message: string, title = '') {
    super();

    this.name = name;
    this.message = message;
    this.title = title;
  }
}

export const setErrorContext = (context: string) => (error: BaseException) => {
  error.title = context;
  throw error;
};
