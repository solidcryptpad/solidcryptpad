import { ErrorHandler, Inject, Injectable, Injector } from '@angular/core';
import { BaseException } from 'src/app/exceptions/base-exception';
import { NotificationService } from '../notification/notification.service';

@Injectable({
  providedIn: 'root',
})
/**
 * Catches all uncaught errors
 * if the error extends baseexception then it will be displayed
 * if it does not a generic error message is printed
 */
export class GlobalErrorHandlerService extends ErrorHandler {
  notificationService: NotificationService | undefined = undefined;

  constructor(@Inject(Injector) private injector: Injector) {
    super();
  }

  override handleError(error: any): void {
    console.error(error);

    if (this.notificationService === undefined) {
      this.notificationService = this.injector.get(NotificationService);
    }

    if ('rejection' in error) {
      error = error.rejection;
    }

    if (error instanceof BaseException) {
      this.notificationService.error({
        title: error.title,
        message: error.message,
      });
    } else {
      // print generic message and log in console
      this.notificationService.error({
        title: 'Unknown Error',
        message: 'an unknown error occured',
      });
    }
  }
}
