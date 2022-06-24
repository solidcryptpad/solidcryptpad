import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FolderShareComponent } from './folder-share.component';
import {
  MAT_DIALOG_DATA,
  MatDialogModule,
  MatDialogRef,
} from '@angular/material/dialog';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { ReactiveFormsModule } from '@angular/forms';
import { LinkShareService } from 'src/app/services/link-share/link-share.service';
import { MatCheckboxModule } from '@angular/material/checkbox';

describe('FolderShareComponent', () => {
  let component: FolderShareComponent;
  let fixture: ComponentFixture<FolderShareComponent>;
  let linkShareServiceSpy: jasmine.SpyObj<LinkShareService>;
  let dialogRefSpy: jasmine.SpyObj<MatDialogRef<FolderShareComponent>>;

  beforeEach(async () => {
    const linkShareSpy = jasmine.createSpyObj('LinkShareService', [
      'createFolderSharingLink',
    ]);
    const dialogRef = jasmine.createSpyObj(MatDialogRef, ['close']);

    await TestBed.configureTestingModule({
      imports: [
        NoopAnimationsModule,
        MatDialogModule,
        ReactiveFormsModule,
        MatCheckboxModule,
      ],
      declarations: [FolderShareComponent],
      providers: [
        { provide: MatDialogRef, useValue: dialogRef },
        { provide: MAT_DIALOG_DATA, useValue: {} },
        { provide: LinkShareService, useValue: linkShareSpy },
      ],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FolderShareComponent);
    component = fixture.componentInstance;

    linkShareServiceSpy = TestBed.inject(
      LinkShareService
    ) as jasmine.SpyObj<LinkShareService>;
    dialogRefSpy = TestBed.inject(MatDialogRef) as jasmine.SpyObj<
      MatDialogRef<FolderShareComponent>
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
    component.data = { folderUrl: 'https://example.org/folder/' };
    linkShareServiceSpy.createFolderSharingLink.and.resolveTo('some link');

    await component.createLink();

    expect(component.link).toBe('some link');
    expect(linkShareServiceSpy.createFolderSharingLink).toHaveBeenCalledWith(
      'https://example.org/folder/',
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
