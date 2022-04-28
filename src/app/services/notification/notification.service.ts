import { Injectable } from '@angular/core';
import { ToastrService } from 'ngx-toastr';

type Notification = {
  title: string;
  message: string;
};

@Injectable({
  providedIn: 'root',
})
export class NotificationService {
  constructor(private toastr: ToastrService) {}

  info(notification: Notification) {
    this.toastr.info(notification.message, notification.title, {
      onActivateTick: true,
    });
  }

  success(notification: Notification) {
    this.toastr.success(notification.message, notification.title, {
      onActivateTick: true,
    });
  }

  warning(notification: Notification) {
    this.toastr.warning(notification.message, notification.title, {
      disableTimeOut: true,
      onActivateTick: true,
    });
  }

  error(notification: Notification) {
    this.toastr.error(notification.message, notification.title, {
      disableTimeOut: true,
      onActivateTick: true,
    });
  }
}
