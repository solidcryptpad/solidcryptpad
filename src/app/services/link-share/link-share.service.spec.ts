import { TestBed } from '@angular/core/testing';

import { LinkShareService } from './link-share.service';
import { MatDialogModule } from '@angular/material/dialog';
import { KeystoreService } from '../encryption/keystore/keystore.service';
import { EncryptionService } from '../encryption/encryption/encryption.service';
import { SolidFileHandlerService } from '../file-handler/solid-file-handler.service';
import { ProfileService } from '../profile/profile.service';
import { SolidPermissionService } from '../solid-permission/solid-permission.service';

describe('LinkShareService', () => {
  let service: LinkShareService;
  let keystoreServiceSpy: jasmine.SpyObj<KeystoreService>;
  let encryptionServiceSpy: jasmine.SpyObj<EncryptionService>;
  let fileServiceSpy: jasmine.SpyObj<SolidFileHandlerService>;
  let profileServiceSpy: jasmine.SpyObj<ProfileService>;
  let permissionServiceSpy: jasmine.SpyObj<SolidPermissionService>;

  beforeEach(() => {
    const keystoreSpy = jasmine.createSpyObj('KeystoreService', ['getKey']);
    const encryptionSpy = jasmine.createSpyObj('EncryptionService', [
      'generateNewKey',
    ]);
    const fileSpy = jasmine.createSpyObj('FileService', ['resourceExists']);
    const profileSpy = jasmine.createSpyObj('ProfileService', ['getPodUrls']);
    const permissionSpy = jasmine.createSpyObj('PermissionService', [
      'setGroupPermissions',
    ]);

    TestBed.configureTestingModule({
      imports: [MatDialogModule],
      providers: [
        { provide: KeystoreService, useValue: keystoreSpy },
        { provide: EncryptionService, useValue: encryptionSpy },
        { provide: SolidFileHandlerService, useValue: fileSpy },
        { provide: ProfileService, useValue: profileSpy },
        { provide: SolidPermissionService, useValue: permissionSpy },
      ],
    });

    service = TestBed.inject(LinkShareService);
    // eslint-disable-next-line unused-imports/no-unused-vars
    keystoreServiceSpy = TestBed.inject(
      KeystoreService
    ) as jasmine.SpyObj<KeystoreService>;
    // eslint-disable-next-line unused-imports/no-unused-vars
    encryptionServiceSpy = TestBed.inject(
      EncryptionService
    ) as jasmine.SpyObj<EncryptionService>;
    // eslint-disable-next-line unused-imports/no-unused-vars
    fileServiceSpy = TestBed.inject(
      SolidFileHandlerService
    ) as jasmine.SpyObj<SolidFileHandlerService>;
    // eslint-disable-next-line unused-imports/no-unused-vars
    profileServiceSpy = TestBed.inject(
      ProfileService
    ) as jasmine.SpyObj<ProfileService>;
    // eslint-disable-next-line unused-imports/no-unused-vars
    permissionServiceSpy = TestBed.inject(
      SolidPermissionService
    ) as jasmine.SpyObj<SolidPermissionService>;
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
