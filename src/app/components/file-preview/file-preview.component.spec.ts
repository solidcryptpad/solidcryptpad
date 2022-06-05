import {
  ComponentFixture,
  TestBed,
} from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { SolidFileHandlerService } from 'src/app/services/file-handler/solid-file-handler.service';

import { FilePreviewComponent } from './file-preview.component';
import { ActivatedRoute, Router, Routes } from '@angular/router';
import { of } from 'rxjs';

describe('FilePreviewComponent', () => {
  let component: FilePreviewComponent;
  let fixture: ComponentFixture<FilePreviewComponent>;
  let router: Router;
  let fileHandlerServiceSpy: jasmine.SpyObj<SolidFileHandlerService>;

  beforeEach(async () => {
    const routes = [{ path: 'editor', component: {} }] as Routes;
    const fileHandlerSpy = jasmine.createSpyObj('SolidFileHandlerSpy', [
      'readAndDecryptFile',
    ]);
    await TestBed.configureTestingModule({
      declarations: [FilePreviewComponent],
      imports: [RouterTestingModule.withRoutes(routes)],
      providers: [
        FilePreviewComponent,
        {
          provide: SolidFileHandlerService,
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

    fileHandlerServiceSpy = TestBed.inject(
      SolidFileHandlerService
    ) as jasmine.SpyObj<SolidFileHandlerService>;

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
    fileHandlerServiceSpy.readAndDecryptFile.and.returnValue(
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
    fileHandlerServiceSpy.readAndDecryptFile.and.returnValue(
      Promise.resolve(new Blob(['text blabal'], { type: 'text/plain' }))
    );
    component.loadDecryptedFile();
    expect(fileHandlerServiceSpy.readAndDecryptFile).toHaveBeenCalledWith(
      component.fileUrl
    );
  });

  /*
    it('loadDecryptedFile loads text file and call getTextFileContent', fakeAsync(() => {
      fileHandlerServiceSpy.readAndDecryptFile.and.returnValue(Promise.resolve(
        new Blob(["text blabal"], {type: 'text/plain'})
      ));
      spyOn(component, 'getTextFileContent');
      component.loadDecryptedFile()
      //fixture.detectChanges();
      expect(component.fileType).toBe("text/plain")
      expect(component.getTextFileContent).toHaveBeenlled();

    }));
  /*

    it('loadDecryptedFile loads image and call getImageUrlFromBlob', () => {
      fileHandlerServiceSpy.readAndDecryptFile.and.returnValue(Promise.resolve(
        new Blob(["text blabal"], {type: 'image/png'})
      ));
      spyOn(component, 'getImageUrlFromBlob');
      component.loadDecryptedFile()
      expect(component.fileType).toBe("image/png")
      expect(component.getImageUrlFromBlob).toHaveBeenCalled();
    });

    it('getTextFileContent set textFileContent ', () => {
      const content = "text blabal";
      const blob = new Blob([content], {type: 'text/plain'});
      component.getTextFileContent(blob)
      expect(component.textFileContent).toBe(content)
    });

    it('loadDecryptedFile loads file and set errorMsg', () => {
      const contentType = 'ggg/plain'
      fileHandlerServiceSpy.readAndDecryptFile.and.returnValue(
        Promise.resolve(
          new Blob(["text blabal albgh"], {type: contentType})
        )
      );
      component.loadDecryptedFile();
      console.log(component.errorMsg)
      expect(component.errorMsg).toBe('No Preview for ContentType: ' + contentType);
    });
    //*/
});
