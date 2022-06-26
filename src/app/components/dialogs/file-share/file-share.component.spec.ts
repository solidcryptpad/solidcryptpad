import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FileShareComponent } from './file-share.component';
import {
  MAT_DIALOG_DATA,
  MatDialogModule,
  MatDialogRef,
} from '@angular/material/dialog';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { LinkShareService } from '../../../services/link-share/link-share.service';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { MatCheckboxModule } from '@angular/material/checkbox';

describe('FileShareComponent', () => {
  let component: FileShareComponent;
  let fixture: ComponentFixture<FileShareComponent>;
  let linkShareServiceSpy: jasmine.SpyObj<LinkShareService>;
  let dialogRefSpy: jasmine.SpyObj<MatDialogRef<FileShareComponent>>;

  beforeEach(async () => {
    const linkShareSpy = jasmine.createSpyObj('LinkShareService', [
      'createFolderSharingLink',
      'createFileSharingLink',
    ]);
    const dialogRef = jasmine.createSpyObj(MatDialogRef, ['close']);

    await TestBed.configureTestingModule({
      imports: [
        NoopAnimationsModule,
        MatDialogModule,
        ReactiveFormsModule,
        MatCheckboxModule,
      ],
      declarations: [FileShareComponent],
      providers: [
        { provide: MatDialogRef, useValue: dialogRef },
        { provide: MAT_DIALOG_DATA, useValue: {} },
        { provide: LinkShareService, useValue: linkShareSpy },
        FormBuilder,
      ],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FileShareComponent);
    component = fixture.componentInstance;

    linkShareServiceSpy = TestBed.inject(
      LinkShareService
    ) as jasmine.SpyObj<LinkShareService>;
    dialogRefSpy = TestBed.inject(MatDialogRef) as jasmine.SpyObj<
      MatDialogRef<FileShareComponent>
    >;

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('createLink calls link-sharing service and sets this.link', async () => {
    spyOn(component.access, 'getRawValue').and.returnValue({
      read: true,
      write: false,
    });
    component.data = { fileUrl: 'https://example.org/file.txt' };
    linkShareServiceSpy.createFileSharingLink.and.resolveTo('some link');

    await component.createLink();

    expect(component.link).toBe('some link');
    expect(linkShareServiceSpy.createFileSharingLink).toHaveBeenCalledWith(
      'https://example.org/file.txt',
      {
        read: true,
        write: false,
      }
    );
  });

  it('cancel closes the dialog', () => {
    component.cancel();

    expect(dialogRefSpy.close).toHaveBeenCalled();
  });
});
