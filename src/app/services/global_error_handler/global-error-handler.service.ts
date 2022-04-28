import { ErrorHandler, Injectable, Injector } from '@angular/core';
import { DisplayType, BaseException } from 'src/app/exceptions/base-exception';
import { NotificationService } from '../notification/notification.service';

@Injectable({
  providedIn: 'root',
})
/**
 * Catches all uncaught errors
 * if the error extends baseexception then it will be displayed based on the given rule
 * if it does not a generic error message is printed
 */
export class GlobalErrorHandlerService implements ErrorHandler {
  notificationService: NotificationService | undefined = undefined;

  constructor(private injector: Injector) {}

  handleError(error: any): void {
    if (this.notificationService === undefined) {
      this.notificationService =
        this.injector.get<NotificationService>(NotificationService);
    }

    error = error.rejection;

    if (error instanceof BaseException) {
      switch (error.type) {
        case DisplayType.ERROR:
          this.notificationService.error({
            title: error.title,
            message: error.message,
          });
          break;
        case DisplayType.INFO:
          this.notificationService.info({
            title: error.title,
            message: error.message,
          });
          break;
        case DisplayType.WARNING:
          this.notificationService.warning({
            title: error.title,
            message: error.message,
          });
          break;
        default:
          console.error(error.name);
          console.error(error.title);
          console.error(error.message);
          console.error(error.stack);
          break;
      }
    } else {
      // print generic message and log in console
      this.notificationService.error({
        title: 'Unknown Error',
        message: 'an unknown error occured',
      });

      console.error(error.name);
      console.error(error.message);
      console.error(error.stack);
    }
  }
}
