import {
  ComponentFixture,
  fakeAsync,
  TestBed,
  tick,
} from '@angular/core/testing';
import {
  MatDialogModule,
  MatDialogRef,
  MAT_DIALOG_DATA,
} from '@angular/material/dialog';
import { By } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { MockDragAndDropDirective } from 'src/app/directives/drag-and-drop/drag-and-drop.directive.mock';
import { FileEncryptionService } from 'src/app/services/encryption/file-encryption/file-encryption.service';
import { SolidFileHandlerService } from 'src/app/services/file-handler/solid-file-handler.service';

import { FileUploadComponent } from './file-upload.component';

describe('FileUploadComponent', () => {
  let component: FileUploadComponent;
  let fixture: ComponentFixture<FileUploadComponent>;
  let dragAndDropMock: MockDragAndDropDirective;
  let fileServiceSpy: jasmine.SpyObj<SolidFileHandlerService>;
  let fileEncryptionServiceSpy: jasmine.SpyObj<FileEncryptionService>;
  let dialogRefSpy: jasmine.SpyObj<MatDialogRef<FileUploadComponent>>;

  const toFileList = (files: File[]): FileList => {
    const dataTransfer = new DataTransfer();
    files.forEach((file) => dataTransfer.items.add(file));
    return dataTransfer.files;
  };

  beforeEach(async () => {
    const fileServiceSpy = jasmine.createSpyObj(SolidFileHandlerService, [
      'guessContentType',
    ]);
    const fileEncryptionSpy = jasmine.createSpyObj(['writeAndEncryptFile']);
    const dialogRef = jasmine.createSpyObj(MatDialogRef, ['close']);
    await TestBed.configureTestingModule({
      imports: [MatDialogModule, NoopAnimationsModule],
      providers: [
        { provide: MAT_DIALOG_DATA, useValue: {} },
        { provide: MatDialogRef, useValue: dialogRef },
        { provide: SolidFileHandlerService, useValue: fileServiceSpy },
        { provide: FileEncryptionService, useValue: fileEncryptionSpy },
      ],
      declarations: [FileUploadComponent, MockDragAndDropDirective],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FileUploadComponent);
    component = fixture.componentInstance;

    const nodes = fixture.debugElement.queryAllNodes(
      By.directive(MockDragAndDropDirective)
    );
    dragAndDropMock = nodes[0].injector.get(MockDragAndDropDirective);
    dialogRefSpy = TestBed.inject(MatDialogRef) as jasmine.SpyObj<
      MatDialogRef<FileUploadComponent>
    >;
    fileServiceSpy = TestBed.inject(
      SolidFileHandlerService
    ) as jasmine.SpyObj<SolidFileHandlerService>;
    fileEncryptionServiceSpy = TestBed.inject(
      FileEncryptionService
    ) as jasmine.SpyObj<FileEncryptionService>;

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('uploadFiles calls uploadFile with each file', fakeAsync(() => {
    const uploadFileSpy = spyOn(component, 'uploadFile');
    uploadFileSpy.and.resolveTo();
    component.files = [
      new File([], 'foo'),
      new File([], 'bar'),
      new File([], 'fooBar'),
    ];

    component.uploadFiles();
    tick();

    expect(uploadFileSpy).toHaveBeenCalledWith(component.files[0]);
    expect(uploadFileSpy).toHaveBeenCalledWith(component.files[1]);
    expect(uploadFileSpy).toHaveBeenCalledWith(component.files[2]);
  }));

  it('uploadFiles rejects if one file upload fails', async () => {
    const uploadFileSpy = spyOn(component, 'uploadFile');
    uploadFileSpy.and.returnValues(Promise.resolve(), Promise.reject());
    component.files = [
      new File([], 'foo'),
      new File([], 'bar'),
      new File([], 'fooBar'),
    ];

    const promise = component.uploadFiles();

    await expectAsync(promise).toBeRejected();
  });

  it('uploadFiles closes the dialog on success', fakeAsync(() => {
    spyOn(component, 'uploadFile').and.resolveTo();
    component.files = [
      new File([], 'foo'),
      new File([], 'bar'),
      new File([], 'fooBar'),
    ];

    component.uploadFiles();
    tick();

    expect(dialogRefSpy.close).toHaveBeenCalled();
  }));

  it('uploadFiles does not close dialog on failure', async () => {
    spyOn(component, 'uploadFile').and.rejectWith();
    component.files = [
      new File([], 'foo'),
      new File([], 'bar'),
      new File([], 'fooBar'),
    ];

    await expectAsync(component.uploadFiles()).toBeRejected();

    expect(dialogRefSpy.close).not.toHaveBeenCalled();
  });

  it('uploadFile stores file with folder url and file name', () => {
    const file = new File([], 'name.md');
    const folderUrl = 'https://example.org/some/folder/';
    component['data'] = { folder: { url: folderUrl } };
    fileServiceSpy.guessContentType.and.returnValue('text/markdown');
    fileEncryptionServiceSpy.writeAndEncryptFile.and.resolveTo();

    component.uploadFile(file);

    const expectedFileUrl = folderUrl + file.name;
    expect(fileEncryptionServiceSpy.writeAndEncryptFile).toHaveBeenCalledWith(
      file.slice(0, file.size, 'text/markdown'),
      expectedFileUrl
    );
  });

  it('stores files when files are dropped', () => {
    const files = [new File([], 'foo.txt'), new File([], 'bar.png')];

    dragAndDropMock.mockFileDrop(toFileList(files));

    expect(component.files).toEqual(files);
  });

  it('overwrites previous files when new files are dropped', () => {
    const oldFiles = [new File([], 'foo.txt'), new File([], 'bar.png')];
    const newFiles = [new File([], 'new.txt')];
    component.files = [...oldFiles];

    dragAndDropMock.mockFileDrop(toFileList(newFiles));

    expect(component.files).toEqual(newFiles);
  });

  it('overwrites previous files when new files are loaded via handleChange', () => {
    const oldFiles = [new File([], 'foo.txt'), new File([], 'bar.png')];
    const newFiles = [new File([], 'new.txt')];
    component.files = [...oldFiles];

    const fakeEvent: Event = {
      currentTarget: {
        files: toFileList(newFiles),
      },
    } as any;
    component.handleChange(fakeEvent);

    expect(component.files).toEqual(newFiles);
  });

  it('removes file when deleting with index', () => {
    const files = [new File([], 'foo.txt'), new File([], 'bar.png')];
    component.files = [...files];

    component.deleteFile(0);

    expect(component.files).toEqual([files[1]]);
  });

  it('formatBytes returns "0 Bytes" for 0 bytes', () => {
    expect(component.formatBytes(0)).toBe('0 Bytes');
  });

  it('formatBytes returns "1 KB" for 1024 bytes', () => {
    expect(component.formatBytes(1024)).toBe('1 KB');
  });

  it('formatBytes returns no more than two digits after comma', () => {
    expect(component.formatBytes(1588)).toBe('1.55 KB');
  });
});
