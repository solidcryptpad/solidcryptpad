import { ComponentFixture, TestBed } from '@angular/core/testing';
import {
  MatDialogModule,
  MatDialogRef,
  MAT_DIALOG_DATA,
} from '@angular/material/dialog';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { SolidFileHandlerService } from 'src/app/services/file-handler/solid-file-handler.service';

import { FileUploadComponent } from './file-upload.component';

describe('FileUploadComponent', () => {
  let component: FileUploadComponent;
  let fixture: ComponentFixture<FileUploadComponent>;

  beforeEach(async () => {
    const fileServiceSpy = jasmine.createSpyObj(SolidFileHandlerService, [
      'writeAndEncryptFile',
    ]);
    await TestBed.configureTestingModule({
      imports: [MatDialogModule, NoopAnimationsModule],
      providers: [
        { provide: MAT_DIALOG_DATA, useValue: {} },
        { provide: MatDialogRef, useValue: {} },
        { provide: SolidFileHandlerService, useValue: fileServiceSpy },
      ],
      declarations: [FileUploadComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FileUploadComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
