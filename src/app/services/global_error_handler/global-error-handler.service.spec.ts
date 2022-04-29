import { TestBed } from '@angular/core/testing';
import { BaseException } from 'src/app/exceptions/base-exception';
import { setErrorContext } from 'src/app/exceptions/error_options';
import { NotFoundException } from 'src/app/exceptions/not-found-exception';
import { UnknownException } from 'src/app/exceptions/unknown-exception';
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

    spyOn(console, 'error');
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

  it('should call notificationService on rejected exception', () => {
    // at least currently, angular wraps rejected errors as { rejection: error }
    // see https://github.com/angular/angular/issues/27840
    const error = new NotFoundException('message');
    service.handleError({
      rejection: error,
    });

    expect(notificationSpy.error).toHaveBeenCalledWith({
      title: error.title,
      message: error.message,
    });
  });

  it('should call console.error on unknown exception', () => {
    service.handleError(new Error('message'));

    expect(console.error).toHaveBeenCalled();
  });

  it('should call console.error on base exception', () => {
    service.handleError(new NotFoundException('message'));

    expect(console.error).toHaveBeenCalled();
  });

  it('should change the title on call for setErrorContext', () => {
    const context = 'new context';

    expect(() =>
      setErrorContext(context)(
        new BaseException('TestException', 'message', 'some title')
      )
    ).toThrow(new BaseException('TestException', 'message', context));
  });

  it('should throw unknownexception with correct arguments on call for setErrorContext on unknown error', () => {
    const context = 'new context';
    const error = new Error('some message');

    expect(() => setErrorContext(context)(error)).toThrow(
      new UnknownException(context, { cause: error })
    );
  });
});
