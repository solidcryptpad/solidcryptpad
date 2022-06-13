import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { SolidAuthenticationService } from 'src/app/services/authentication/solid-authentication.service';
import { NotificationService } from 'src/app/services/notification/notification.service';

import { ChangePasswordComponent } from './change-password.component';
import { MasterPasswordService } from 'src/app/services/encryption/master-password/master-password.service';
import { EncryptionService } from 'src/app/services/encryption/encryption/encryption.service';
import { KeystoreService } from 'src/app/services/encryption/keystore/keystore.service';

describe('ChangePasswordComponent', () => {
  let component: ChangePasswordComponent;
  let fixture: ComponentFixture<ChangePasswordComponent>;
  let dialogRefSpy: jasmine.SpyObj<MatDialogRef<ChangePasswordComponent>>;
  let notificationRefSpy: jasmine.SpyObj<NotificationService>;
  let masterPasswordRefSpy: jasmine.SpyObj<MasterPasswordService>;
  let encryptionRefSpy: jasmine.SpyObj<EncryptionService>;
  let keystoreRefSpy: jasmine.SpyObj<KeystoreService>;

  beforeEach(async () => {
    const dialogHandlerRef = jasmine.createSpyObj('MatDialog', [
      'open',
      'afterClosed',
    ]);
    const notificationRef = jasmine.createSpyObj('NotificationSpy', [
      'error',
      'info',
      'warning',
      'success',
    ]);
    const authenticationRef = jasmine.createSpyObj('SolidAuthenticationSpy', [
      'logout',
    ]);
    const masterPasswordRef = jasmine.createSpyObj('MasterPasswordService', [
      'getMasterPassword',
      'setMasterPassword',
    ]);
    const encryptionRef = jasmine.createSpyObj('EncryptionService', [
      'SHA256Salted',
    ]);
    const dialogRef = jasmine.createSpyObj(MatDialogRef, ['close']);
    const keyStoreRef = jasmine.createSpyObj('KeystoreService', [
      'saveKeystores',
      'loadKeystores',
    ]);
    await TestBed.configureTestingModule({
      declarations: [ChangePasswordComponent],
      providers: [
        { provide: MatDialogRef, useValue: dialogRef },
        {
          provide: MatDialog,
          useValue: dialogHandlerRef,
        },
        {
          provide: NotificationService,
          useValue: notificationRef,
        },
        {
          provide: SolidAuthenticationService,
          useValue: authenticationRef,
        },
        {
          provide: MasterPasswordService,
          useValue: masterPasswordRef,
        },
        {
          provide: EncryptionService,
          useValue: encryptionRef,
        },
        {
          provide: KeystoreService,
          useValue: keyStoreRef,
        },
      ],
    }).compileComponents();

    dialogRefSpy = TestBed.inject(MatDialogRef) as jasmine.SpyObj<
      MatDialogRef<ChangePasswordComponent>
    >;

    notificationRefSpy = TestBed.inject(
      NotificationService
    ) as jasmine.SpyObj<NotificationService>;

    masterPasswordRefSpy = TestBed.inject(
      MasterPasswordService
    ) as jasmine.SpyObj<MasterPasswordService>;

    encryptionRefSpy = TestBed.inject(
      EncryptionService
    ) as jasmine.SpyObj<EncryptionService>;

    keystoreRefSpy = TestBed.inject(
      KeystoreService
    ) as jasmine.SpyObj<KeystoreService>;
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ChangePasswordComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('close should call close', () => {
    component.close();

    expect(dialogRefSpy.close).toHaveBeenCalled();
  });

  it('changePassword on different passwords should call notificationservice with correct arguments', async () => {
    component.old_password = 'test';
    component.new_password = 'something';
    component.repeated_password = 'something2';

    masterPasswordRefSpy.getMasterPassword.and.resolveTo('test_hash');
    encryptionRefSpy.SHA256Salted.and.returnValue('test_hash');

    await component.changePassword();

    expect(notificationRefSpy.error).toHaveBeenCalledOnceWith({
      title: 'Password',
      message: 'new password not repeated correctly',
    });
  });

  it('changePassword on wrong password should call notificationservice with correct arguments', async () => {
    component.old_password = 'test';
    component.new_password = 'something';
    component.repeated_password = 'something';

    masterPasswordRefSpy.getMasterPassword.and.resolveTo('test_hash');
    encryptionRefSpy.SHA256Salted.and.returnValue('other_test_hash');

    await component.changePassword();

    expect(notificationRefSpy.error).toHaveBeenCalledOnceWith({
      title: 'Password error',
      message: 'old password does not match',
    });
  });

  it('correct password closes window', async () => {
    component.old_password = 'test';
    component.new_password = 'something';
    component.repeated_password = 'something';

    masterPasswordRefSpy.getMasterPassword.and.resolveTo('test_hash');
    encryptionRefSpy.SHA256Salted.and.returnValue('test_hash');

    await component.changePassword();

    expect(notificationRefSpy.success).toHaveBeenCalled();
    expect(dialogRefSpy.close).toHaveBeenCalled();
  });

  it('changePassword calls saveKeystores and setMasterPassword', async () => {
    component.old_password = 'test';
    component.new_password = 'something';
    component.repeated_password = 'something';

    masterPasswordRefSpy.getMasterPassword.and.resolveTo('test_hash');
    encryptionRefSpy.SHA256Salted.and.returnValue('test_hash');

    await component.changePassword();

    expect(masterPasswordRefSpy.setMasterPassword).toHaveBeenCalled();
    expect(keystoreRefSpy.saveKeystores).toHaveBeenCalled();
  });
});
