import { TestBed } from '@angular/core/testing';
import { ToastrService } from 'ngx-toastr';

import { NotificationService } from './notification.service';

describe('NotificationService', () => {
  let service: NotificationService;
  let toastrSpy: jasmine.SpyObj<ToastrService>;
  const sampleNotification = {
    title: 'sample title',
    message: 'sample message',
  };

  beforeEach(() => {
    const toastrServiceSpy = jasmine.createSpyObj('ToastrService', [
      'info',
      'success',
      'warning',
      'error',
    ]);
    TestBed.configureTestingModule({
      providers: [
        NotificationService,
        { provide: ToastrService, useValue: toastrServiceSpy },
      ],
    });
    service = TestBed.inject(NotificationService);
    toastrSpy = TestBed.inject(ToastrService) as jasmine.SpyObj<ToastrService>;
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should call toastr info on info', () => {
    service.info(sampleNotification);
    expect(toastrSpy.info).toHaveBeenCalledWith(
      sampleNotification.message,
      sampleNotification.title,
      jasmine.anything()
    );
  });

  it('should call toastr success on success', () => {
    service.success(sampleNotification);
    expect(toastrSpy.success).toHaveBeenCalledWith(
      sampleNotification.message,
      sampleNotification.title,
      jasmine.anything()
    );
  });

  it('should call toastr warning on warning', () => {
    service.warning(sampleNotification);
    expect(toastrSpy.warning).toHaveBeenCalledWith(
      sampleNotification.message,
      sampleNotification.title,
      jasmine.anything()
    );
  });

  it('should call toastr error on error', () => {
    service.error(sampleNotification);
    expect(toastrSpy.error).toHaveBeenCalledWith(
      sampleNotification.message,
      sampleNotification.title,
      jasmine.anything()
    );
  });
});
