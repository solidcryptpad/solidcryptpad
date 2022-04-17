export class PermissionException extends Error {
  public title: string;

  constructor(message: string) {
    super();

    this.name = 'PermissionException';
    this.title = 'Permission denied';
    this.message = message;
  }
}
