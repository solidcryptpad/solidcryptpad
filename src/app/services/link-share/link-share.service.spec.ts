import { TestBed } from '@angular/core/testing';

import { LinkShareService } from './link-share.service';
import { MatDialogModule } from '@angular/material/dialog';
import { KeystoreService } from '../encryption/keystore/keystore.service';
import { EncryptionService } from '../encryption/encryption/encryption.service';
import { SolidFileHandlerService } from '../file-handler/solid-file-handler.service';
import { SolidPermissionService } from '../solid-permission/solid-permission.service';
import { KeyService } from '../encryption/key/key.service';
import { SolidGroupService } from '../solid-group/solid-group.service';
import { SharedByMeService } from '../shared-by-me/shared-by-me.service';

describe('LinkShareService', () => {
  let service: LinkShareService;
  let keystoreServiceSpy: jasmine.SpyObj<KeystoreService>;
  let encryptionServiceSpy: jasmine.SpyObj<EncryptionService>;
  let fileServiceSpy: jasmine.SpyObj<SolidFileHandlerService>;
  let permissionServiceSpy: jasmine.SpyObj<SolidPermissionService>;
  let keyServiceSpy: jasmine.SpyObj<KeyService>;
  let groupServiceSpy: jasmine.SpyObj<SolidGroupService>;
  let sharedByMeServiceSpy: jasmine.SpyObj<SharedByMeService>;

  // copied from the class
  const toLink = (data: Record<string, string>) => {
    const urlParams = new URLSearchParams(data);
    return `${window.location.origin}/share?${urlParams.toString()}`;
  };

  const permissions = {
    read: true,
    append: false,
    write: false,
    control: false,
  } as const;

  beforeEach(() => {
    const keystoreSpy = jasmine.createSpyObj('KeystoreService', [
      'getKey',
      'findAllKeystores',
    ]);
    const encryptionSpy = jasmine.createSpyObj('EncryptionService', [
      'generateNewKey',
    ]);
    const fileSpy = jasmine.createSpyObj('FileService', [
      'resourceExists',
      'deleteFile',
    ]);
    const permissionSpy = jasmine.createSpyObj('PermissionService', [
      'setGroupPermissions',
      'setPublicPermissions',
      'setGroupPermissionsForContainedResources',
    ]);

    const keySpy = jasmine.createSpyObj('KeyService', [
      'getKey',
      'getOrCreateSharedFolderKeystore',
    ]);
    const groupSpy = jasmine.createSpyObj('GroupService', [
      'createNewRandomGroup',
    ]);
    const sharedByMeSpy = jasmine.createSpyObj('SharedByMeService', [
      'addLink',
      'removeLink',
    ]);

    TestBed.configureTestingModule({
      imports: [MatDialogModule],
      providers: [
        { provide: KeystoreService, useValue: keystoreSpy },
        { provide: EncryptionService, useValue: encryptionSpy },
        { provide: SolidFileHandlerService, useValue: fileSpy },
        { provide: SolidPermissionService, useValue: permissionSpy },
        { provide: KeyService, useValue: keySpy },
        { provide: SolidGroupService, useValue: groupSpy },
        { provide: SharedByMeService, useValue: sharedByMeSpy },
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
    permissionServiceSpy = TestBed.inject(
      SolidPermissionService
    ) as jasmine.SpyObj<SolidPermissionService>;

    groupServiceSpy = TestBed.inject(
      SolidGroupService
    ) as jasmine.SpyObj<SolidGroupService>;

    sharedByMeServiceSpy = TestBed.inject(
      SharedByMeService
    ) as jasmine.SpyObj<SharedByMeService>;

    keyServiceSpy = TestBed.inject(KeyService) as jasmine.SpyObj<KeyService>;
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('createFileSharingLink creates file sharing link', async () => {
    const fileName = 'file.txt';
    const fileUrl = `example.com/${fileName}`;
    keyServiceSpy.getKey.and.resolveTo('the key');
    groupServiceSpy.createNewRandomGroup.and.resolveTo('the group');
    permissionServiceSpy.setPublicPermissions.and.resolveTo();

    await service.createFileSharingLink(fileUrl, permissions);

    const params = {
      file: fileUrl,
      key: btoa('the key'),
      group: 'the group',
    };

    const link = toLink(params);

    expect(sharedByMeServiceSpy.addLink).toHaveBeenCalledWith('file.txt', link);
    expect(await service.createFileSharingLink(fileUrl, permissions)).toEqual(
      link
    );
  });

  it('createFolderSharingLink creates folder sharing link', async () => {
    const folderName = 'myFolder';
    const folderUrl = `example.com/${folderName}/`;

    groupServiceSpy.createNewRandomGroup.and.resolveTo('the group');

    keyServiceSpy.getOrCreateSharedFolderKeystore.and.resolveTo({
      keystoreUrl: 'keystore.url',
      encryptionKey: 'key',
    });

    await service.createFolderSharingLink(folderUrl, permissions);

    const link = toLink({
      folder: folderUrl,
      group: 'the group',
      keystore: 'keystore.url',
      keystoreEncryptionKey: 'key',
    });

    expect(sharedByMeServiceSpy.addLink).toHaveBeenCalledWith(folderName, link);
    expect(
      await service.createFolderSharingLink(folderUrl, permissions)
    ).toEqual(link);
  });

  it('deactivateLink deletes corresponding group file', () => {
    const link =
      'http://solidcryptpad.cool/share?file=example.com%2Ffile.txt&key=dGhlIGtleQ%3D%3D&group=the+group';
    service.deactivateLink(link);

    expect(fileServiceSpy.deleteFile).toHaveBeenCalledWith('the group');
  });
});
