import { ErrorHandler, Injectable, Injector } from '@angular/core';
import { DisplayType, BaseException } from 'src/app/exceptions/base-exception';
import { NotificationService } from '../notification/notification.service';

@Injectable({
  providedIn: 'root',
})
export class GlobalErrorHandlerService implements ErrorHandler {
  notificationService: NotificationService | undefined = undefined;

  constructor(private injector: Injector) {}

  handleError(error: any): void {
    if (this.notificationService === undefined) {
      this.notificationService =
        this.injector.get<NotificationService>(NotificationService);
    }

    /**
     * currently this part seems to not work
     * it does not recognise it as a baseexception
     * maybe because it is thrown from a promise
     */
    if (error instanceof BaseException) {
      switch (error.type) {
        case DisplayType.ERROR:
          this.notificationService.error({
            title: error.title,
            message: error.message,
          });
          return;
        case DisplayType.INFO:
          this.notificationService.info({
            title: error.title,
            message: error.message,
          });
          return;
        case DisplayType.WARNING:
          this.notificationService.warning({
            title: error.title,
            message: error.message,
          });
          return;
        default:
          console.error(error.name);
          console.error(error.title);
          console.error(error.message);
          console.error(error.stack);
          return;
      }
    } else {
      /**
       * this also currently does not display the error correctly
       */
      this.notificationService.error({
        title: 'Unknown Error',
        message: 'an unknown error occured',
      });
      console.error(error.name);
      console.error(error.message);
      console.error(error.stack);
      return;
    }
  }
}
