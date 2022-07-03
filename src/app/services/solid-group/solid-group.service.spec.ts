import { TestBed } from '@angular/core/testing';
import { DirectoryStructureService } from '../directory-structure/directory-structure.service';
import { EncryptionService } from '../encryption/encryption/encryption.service';
import { SolidFileHandlerService } from '../file-handler/solid-file-handler.service';
import { SolidGroupService } from './solid-group.service';

describe('SolidGroupService', () => {
  let service: SolidGroupService;
  let encryptionServiceSpy: jasmine.SpyObj<EncryptionService>;
  let fileServiceSpy: jasmine.SpyObj<SolidFileHandlerService>;
  let directoryServiceSpy: jasmine.SpyObj<DirectoryStructureService>;

  const sampleGroupFileUrl = 'https://example.org/groups/group.ttl';

  beforeEach(() => {
    const encryptionSpy = jasmine.createSpyObj('EncryptionService', [
      'generateNewKey',
    ]);
    const fileSpy = jasmine.createSpyObj('FileService', ['writeFile']);
    const directorySpy = jasmine.createSpyObj('DirectoryStructureService', [
      'getGroupsDirectory',
    ]);
    TestBed.configureTestingModule({
      providers: [
        { provide: EncryptionService, useValue: encryptionSpy },
        { provide: SolidFileHandlerService, useValue: fileSpy },
        { provide: DirectoryStructureService, useValue: directorySpy },
      ],
    });
    service = TestBed.inject(SolidGroupService);
    encryptionServiceSpy = TestBed.inject(
      EncryptionService
    ) as jasmine.SpyObj<EncryptionService>;
    fileServiceSpy = TestBed.inject(
      SolidFileHandlerService
    ) as jasmine.SpyObj<SolidFileHandlerService>;
    directoryServiceSpy = TestBed.inject(
      DirectoryStructureService
    ) as jasmine.SpyObj<DirectoryStructureService>;
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('createNewRandomGroup creates a random group and returns its url', async () => {
    spyOn(service, 'generateSecretGroupFileUrl').and.resolveTo(
      sampleGroupFileUrl
    );
    const createGroupFileSpy = spyOn(service, 'createGroupFile');
    createGroupFileSpy.and.resolveTo();

    const groupUrl = await service.createNewRandomGroup();

    expect(groupUrl).toContain(sampleGroupFileUrl);
    expect(createGroupFileSpy).toHaveBeenCalledWith(sampleGroupFileUrl);
  });

  it('createGroupFile creates an empty turtle file', async () => {
    fileServiceSpy.writeFile.and.resolveTo();

    await service.createGroupFile(sampleGroupFileUrl);

    expect(fileServiceSpy.writeFile).toHaveBeenCalledWith(
      new Blob([], { type: 'text/turtle' }),
      sampleGroupFileUrl
    );
  });

  it('generateSecretGroupFileUrl uses a random key for the url', async () => {
    encryptionServiceSpy.generateNewKey.and.returnValue('random key');
    directoryServiceSpy.getGroupsDirectory.and.resolveTo(
      'https://example.org/groups/'
    );

    const secretGroupFileUrl = await service.generateSecretGroupFileUrl();

    expect(secretGroupFileUrl).toContain('random key');
  });
});
