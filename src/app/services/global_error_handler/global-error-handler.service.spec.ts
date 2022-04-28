import { TestBed } from '@angular/core/testing';
import {
  BaseException,
} from 'src/app/exceptions/base-exception';
import { NotFoundException } from 'src/app/exceptions/not-found-exception';
import { NotificationService } from '../notification/notification.service';

import { GlobalErrorHandlerService } from './global-error-handler.service';

describe('GlobalErrorHandlerService', () => {
  let service: GlobalErrorHandlerService;
  let notificationSpy: jasmine.SpyObj<NotificationService>;

  beforeEach(() => {
    const notificationServiceSpy = jasmine.createSpyObj('NotificationService', [
      'error',
    ]);
    TestBed.configureTestingModule({
      providers: [
        GlobalErrorHandlerService,
        { provide: NotificationService, useValue: notificationServiceSpy },
      ],
    });
    service = TestBed.inject(GlobalErrorHandlerService);
    notificationSpy = TestBed.inject(
      NotificationService
    ) as jasmine.SpyObj<NotificationService>;
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should call notificationService on BaseException', () => {
    service.handleError(new BaseException('exception', 'message', 'title'));

    expect(notificationSpy.error).toHaveBeenCalled();
  });

  it('should call notificationService on derived class correctly', () => {
    const error = new NotFoundException('message');
    service.handleError(error);

    expect(notificationSpy.error).toHaveBeenCalledOnceWith({
      title: error.title,
      message: error.message,
    });
  });

  it('should call notificationService on unknown exception', () => {
    service.handleError(new Error('message'));

    expect(notificationSpy.error).toHaveBeenCalledOnceWith({
      title: 'Unknown Error',
      message: jasmine.any(String),
    });
  });
});