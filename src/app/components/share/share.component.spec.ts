import { ComponentFixture, fakeAsync, TestBed } from '@angular/core/testing';

import { ShareComponent } from './share.component';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';
import { RouterTestingModule } from '@angular/router/testing';
import { SolidAuthenticationService } from '../../services/authentication/solid-authentication.service';
import {
  MAT_DIALOG_DATA,
  MatDialogModule,
  MatDialogRef,
} from '@angular/material/dialog';
import { MatIcon } from '@angular/material/icon';
import { KeystoreService } from '../../services/encryption/keystore/keystore.service';
import { SolidFileHandlerService } from '../../services/file-handler/solid-file-handler.service';
import { SharedFileKeystore } from '../../services/encryption/keystore/shared-file-keystore.class';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { SecureRemoteStorage } from '../../services/encryption/keystore/keystore.interface';

fdescribe('ShareComponent', () => {
  let component: ShareComponent;
  let fixture: ComponentFixture<ShareComponent>;
  let fileService: jasmine.SpyObj<SolidFileHandlerService>;
  let keystoreService: jasmine.SpyObj<KeystoreService>;
  let storage: jasmine.SpyObj<SecureRemoteStorage>;

  beforeEach(async () => {
    storage = jasmine.createSpyObj('SecureRemoteStorage', [
      'loadSecure',
      'saveSecure',
    ]);
    const authenticationSpy = jasmine.createSpyObj('SolidAuthenticationSpy', [
      'getWebId',
    ]);

    const keystoreServiceSpy = jasmine.createSpyObj('KeystoreServiceSpy', [
      'getSharedFilesKeystore',
      'addKey',
      'addKeystore',
    ]);

    const fileServiceSpy = jasmine.createSpyObj('FileServiceSpy', [
      'addCurrentUserToGroup',
    ]);

    const keystoreSpy = jasmine.createSpyObj('KeystoreSpy', ['addKey']);

    await TestBed.configureTestingModule({
      imports: [RouterTestingModule, MatDialogModule, MatProgressBarModule],
      declarations: [ShareComponent, MatIcon],
      providers: [
        { provide: MatDialogRef, useValue: {} },
        { provide: MAT_DIALOG_DATA, useValue: {} },
        { provide: SolidAuthenticationService, useValue: authenticationSpy },
        {
          provide: ActivatedRoute,
          useValue: {
            queryParams: of({
              file: 'example.txt',
              group: 'group1',
              key: 'key',
            }),
          },
        },
        { provide: SolidFileHandlerService, useValue: fileServiceSpy },
        { provide: KeystoreService, useValue: keystoreServiceSpy },
        { provide: SharedFileKeystore, useValue: keystoreSpy },
      ],
    });

    fileService = TestBed.inject(
      SolidFileHandlerService
    ) as jasmine.SpyObj<SolidFileHandlerService>;

    keystoreService = TestBed.inject(
      KeystoreService
    ) as jasmine.SpyObj<KeystoreService>;
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ShareComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('link without necessary parameters throws error', fakeAsync(() => {
    const pp = of({
      url: 'meSoCorrupted',
    });

    component.parseParamsAndCallProcessingMethod(pp);

    expect(component.error).toBe(true);
  }));

  it('link with folder parameter gets processed', () => {
    expect(fileService.addCurrentUserToGroup).toHaveBeenCalled();
    expect(component.error).toBe(false);
  });

  it('link with file parameter gets processed', () => {
    const ks = new SharedFileKeystore(storage, 'lele');
    keystoreService.getSharedFilesKeystore.and.resolveTo(ks);

    expect(fileService.addCurrentUserToGroup).toHaveBeenCalled();
    expect(component.error).toBe(false);
    return expectAsync(keystoreService.getSharedFilesKeystore()).toBeResolvedTo(
      ks
    );
  });
});
