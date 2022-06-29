import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TextEditorComponent } from './text-editor.component';
import { RouterTestingModule } from '@angular/router/testing';
import { MatDialogModule } from '@angular/material/dialog';
import { ProfileService } from 'src/app/services/profile/profile.service';
import { SolidFileHandlerService } from 'src/app/services/file-handler/solid-file-handler.service';
import { SolidAuthenticationService } from '../../services/authentication/solid-authentication.service';
import { NotificationService } from 'src/app/services/notification/notification.service';
import { KeyService } from 'src/app/services/encryption/key/key.service';

describe('TextEditorComponent', () => {
  let component: TextEditorComponent;
  let fixture: ComponentFixture<TextEditorComponent>;
  let profileServiceSpy: jasmine.SpyObj<ProfileService>;
  let fileServiceSpy: jasmine.SpyObj<SolidFileHandlerService>;
  let notificationServiceSpy: jasmine.SpyObj<NotificationService>;
  let keyServiceSpy: jasmine.SpyObj<KeyService>;

  beforeEach(async () => {
    const authenticationSpy = jasmine.createSpyObj(
      'SolidAuthenticationService',
      ['getWebId']
    );
    const profileServiceSpyObj = jasmine.createSpyObj('ProfileServiceSpy', [
      'getPodUrls',
    ]);
    const fileServiceSpyObj = jasmine.createSpyObj(
      'SolidFileHandlerServiceSpy',
      ['writeAndEncryptFile', 'readAndDecryptFile']
    );
    const notificationSpy = jasmine.createSpyObj('NotificationService', [
      'success',
      'error',
    ]);
    const keySpy = jasmine.createSpyObj('KeyService', ['getKey']);

    await TestBed.configureTestingModule({
      imports: [RouterTestingModule, MatDialogModule],
      declarations: [TextEditorComponent],
      providers: [
        {
          provide: ProfileService,
          useValue: profileServiceSpyObj,
        },
        {
          provide: SolidFileHandlerService,
          useValue: fileServiceSpyObj,
        },
        {
          provide: SolidAuthenticationService,
          useValue: authenticationSpy,
        },
        { provide: NotificationService, useValue: notificationSpy },
        { provide: KeyService, useValue: keySpy },
      ],
    }).compileComponents();

    profileServiceSpy = TestBed.inject(
      ProfileService
    ) as jasmine.SpyObj<ProfileService>;
    // eslint-disable-next-line unused-imports/no-unused-vars
    fileServiceSpy = TestBed.inject(
      SolidFileHandlerService
    ) as jasmine.SpyObj<SolidFileHandlerService>;
    // eslint-disable-next-line unused-imports/no-unused-vars
    notificationServiceSpy = TestBed.inject(
      NotificationService
    ) as jasmine.SpyObj<NotificationService>;
    keyServiceSpy = TestBed.inject(KeyService) as jasmine.SpyObj<KeyService>;
  });

  beforeEach(() => {
    profileServiceSpy.getPodUrls.and.resolveTo(['https://example.org/pod/']);

    fixture = TestBed.createComponent(TextEditorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('getRoomPassword uses key from keystore', async () => {
    keyServiceSpy.getKey.and.resolveTo('the key');
    component.fileUrl = 'https://example.org/some/file.txt';

    const key = await component.getRoomPassword();

    expect(key).toBe('the key');
    expect(keyServiceSpy.getKey).toHaveBeenCalledWith(
      'https://example.org/some/file.txt'
    );
  });
});
