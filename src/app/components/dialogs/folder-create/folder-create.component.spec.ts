import { ComponentFixture, TestBed } from '@angular/core/testing';
import {
  MatDialogRef,
  MAT_DIALOG_DATA,
} from '@angular/material/dialog';
import { SolidFileHandlerService } from 'src/app/services/file-handler/solid-file-handler.service';

import { FolderCreateComponent } from './folder-create.component';

describe('FolderCreateComponent', () => {
  let component: FolderCreateComponent;
  let fixture: ComponentFixture<FolderCreateComponent>;
  let solidFileHandlerServiceSpy: jasmine.SpyObj<SolidFileHandlerService>;

  beforeEach(async () => {
    const solidFileHandlerSpy = jasmine.createSpyObj(
      'SolidFileHandlerService',
      ['writeContainer']
    );

    await TestBed.configureTestingModule({
      declarations: [FolderCreateComponent],
      providers: [
        { provide: MAT_DIALOG_DATA, useValue: {} },
        // eslint-disable-next-line
        { provide: MatDialogRef, useValue: { close: () => {} } },
        { provide: SolidFileHandlerService, useValue: solidFileHandlerSpy },
      ],
    }).compileComponents();
    solidFileHandlerServiceSpy = TestBed.inject(
      SolidFileHandlerService
    ) as jasmine.SpyObj<SolidFileHandlerService>;
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FolderCreateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('createFolder should call writeContainer', async () => {
    await component.createFolder();
    expect(solidFileHandlerServiceSpy.writeContainer).toHaveBeenCalled();
  });
});
