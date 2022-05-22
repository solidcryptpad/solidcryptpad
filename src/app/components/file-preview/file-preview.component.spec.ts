import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { SolidFileHandlerService } from 'src/app/services/file-handler/solid-file-handler.service';

import { FilePreviewComponent } from './file-preview.component';

describe('FilePreviewComponent', () => {
  let component: FilePreviewComponent;
  let fixture: ComponentFixture<FilePreviewComponent>;
  let fileServiceSpy: jasmine.SpyObj<SolidFileHandlerService>;

  beforeEach(async () => {
    const fileSpy = jasmine.createSpyObj(SolidFileHandlerService, [
      'readAndDecryptFile',
    ]);
    await TestBed.configureTestingModule({
      declarations: [FilePreviewComponent],
      imports: [RouterTestingModule.withRoutes([])],
      providers: [
        {
          provide: SolidFileHandlerService,
          useValue: fileSpy,
        },
      ],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FilePreviewComponent);
    component = fixture.componentInstance;
    // not calling fixture.detectChanges() here because it triggers ngOnInit
    // use it explicitly in the tests after appropriate mocking

    // eslint-disable-next-line unused-imports/no-unused-vars
    fileServiceSpy = TestBed.inject(
      SolidFileHandlerService
    ) as jasmine.SpyObj<SolidFileHandlerService>;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
