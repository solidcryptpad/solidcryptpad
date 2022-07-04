import {
  ComponentFixture,
  fakeAsync,
  TestBed,
  tick,
} from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';

import { FilePreviewComponent } from './file-preview.component';
import { ActivatedRoute, Router, Routes } from '@angular/router';
import { of } from 'rxjs';
import { FileEncryptionService } from 'src/app/services/encryption/file-encryption/file-encryption.service';
import { SolidAuthenticationService } from '../../services/authentication/solid-authentication.service';
import { MatIcon } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';

describe('FilePreviewComponent', () => {
  let component: FilePreviewComponent;
  let fixture: ComponentFixture<FilePreviewComponent>;
  let router: Router;
  let fileEncryptionServiceSpy: jasmine.SpyObj<FileEncryptionService>;

  beforeEach(async () => {
    const authenticationSpy = jasmine.createSpyObj(
      'SolidAuthenticationService',
      ['getWebId']
    );
    const routes = [{ path: 'editor', component: {} }] as Routes;
    const fileHandlerSpy = jasmine.createSpyObj('FileEncryptionService', [
      'readAndDecryptFile',
    ]);
    await TestBed.configureTestingModule({
      declarations: [FilePreviewComponent, MatIcon],
      imports: [RouterTestingModule.withRoutes(routes), MatProgressBarModule],
      providers: [
        FilePreviewComponent,
        { provide: SolidAuthenticationService, useValue: authenticationSpy },
        {
          provide: FileEncryptionService,
          useValue: fileHandlerSpy,
        },
        {
          provide: ActivatedRoute,
          useValue: {
            queryParams: of({
              url: 'example.url.com/solidcryptpad/tt.txt',
            }),
          },
        },
      ],
    }).compileComponents();

    fileEncryptionServiceSpy = TestBed.inject(
      FileEncryptionService
    ) as jasmine.SpyObj<FileEncryptionService>;

    // eslint-disable-next-line unused-imports/no-unused-vars
    router = TestBed.inject(Router);
  });

  beforeEach(() => {
    // onInit calls this with the url param specified above, which is a text file
    fixture = TestBed.createComponent(FilePreviewComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('ngOnInit calls setupFilenameFromParams', () => {
    fileEncryptionServiceSpy.readAndDecryptFile.and.returnValue(
      Promise.resolve(new Blob(['text blabal'], { type: 'image/png' }))
    );
    spyOn(component, 'setupFilenameFromParams');
    fixture.detectChanges();
    expect(component.setupFilenameFromParams).toHaveBeenCalled();
  });

  it('ngOnInit calls loadDecryptedFile', () => {
    spyOn(component, 'loadDecryptedFile');
    fixture.detectChanges();
    expect(component.loadDecryptedFile).toHaveBeenCalled();
  });

  it('setupFilenameFromParams save correct filename', () => {
    component.setupFilenameFromParams();
    expect(component.fileUrl).toBe('example.url.com/solidcryptpad/tt.txt');
  });

  it('setupFilenameFromParams write debug mesage in Console if no  filename is given', () => {
    spyOn(console, 'debug');
    TestBed.get(ActivatedRoute).queryParams = of({ url: '' });
    component.setupFilenameFromParams();
    expect(component.fileUrl).toBe('');
    expect(console.debug).toHaveBeenCalledWith('no filename given');
  });

  it('loadDecryptedFile loads test file and call readAndDecryptFile from FileHandler', () => {
    fileEncryptionServiceSpy.readAndDecryptFile.and.returnValue(
      Promise.resolve(new Blob(['text blabal'], { type: 'text/plain' }))
    );
    component.loadDecryptedFile();
    expect(fileEncryptionServiceSpy.readAndDecryptFile).toHaveBeenCalledWith(
      component.fileUrl
    );
  });

  it('loadDecryptedFile loads text file and call getTextFileContent', fakeAsync(() => {
    fileEncryptionServiceSpy.readAndDecryptFile.and.returnValue(
      Promise.resolve(new Blob(['text blabal'], { type: 'text/plain' }))
    );
    spyOn(component, 'getTextFileContent');
    component.loadDecryptedFile();
    tick();

    expect(component.fileType).toBe('text/plain');
    expect(component.getTextFileContent).toHaveBeenCalled();
  }));

  it('loadDecryptedFile loads image and call getImageUrlFromBlob', fakeAsync(() => {
    fileEncryptionServiceSpy.readAndDecryptFile.and.returnValue(
      Promise.resolve(new Blob(['text blabal'], { type: 'image/png' }))
    );
    spyOn(component, 'getImageUrlFromBlob');
    component.loadDecryptedFile();
    tick();

    expect(component.fileType).toBe('image/png');
    expect(component.getImageUrlFromBlob).toHaveBeenCalled();
  }));

  it('getTextFileContent set textFileContent ', async () => {
    const content = 'text blabal';
    const blob = new Blob([content], { type: 'text/plain' });
    await component.getTextFileContent(blob);

    expect(component.textFileContent).toContain(content);
  });

  it('loadDecryptedFile loads file and set errorMsg', fakeAsync(() => {
    const contentType = 'ggg/plain';
    fileEncryptionServiceSpy.readAndDecryptFile.and.returnValue(
      Promise.resolve(new Blob(['text blabal albgh'], { type: contentType }))
    );
    component.loadDecryptedFile();
    tick();

    expect(component.errorMsg).toBe(
      'No Preview for ContentType: ' + contentType
    );
  }));
});
