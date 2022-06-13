import { ComponentFixture, TestBed } from '@angular/core/testing';
import {
  MatDialog,
  MatDialogRef,
} from '@angular/material/dialog';
import { SolidAuthenticationService } from 'src/app/services/authentication/solid-authentication.service';
import { NotificationService } from 'src/app/services/notification/notification.service';

import { ChangePasswordComponent } from './change-password.component';

describe('ChangePasswordComponent', () => {
  let component: ChangePasswordComponent;
  let fixture: ComponentFixture<ChangePasswordComponent>;

  beforeEach(async () => {
    const dialogHandlerSpy = jasmine.createSpyObj('MatDialog', [
      'open',
      'afterClosed',
    ]);
    const notificationSpy = jasmine.createSpyObj('NotificationSpy', [
      'error',
      'info',
      'warning',
      'success',
    ]);
    const authenticationSpy = jasmine.createSpyObj('SolidAuthenticationSpy', [
      'logout',
    ]);
    await TestBed.configureTestingModule({
      declarations: [ChangePasswordComponent],
      providers: [
        // eslint-disable-next-line
        { provide: MatDialogRef, useValue: { close: () => {} } },
        {
          provide: MatDialog,
          useValue: dialogHandlerSpy,
        },
        {
          provide: NotificationService,
          useValue: notificationSpy,
        },
        {
          provide: SolidAuthenticationService,
          useValue: authenticationSpy,
        },
      ],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ChangePasswordComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
