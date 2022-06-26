import { ComponentFixture, fakeAsync, TestBed } from '@angular/core/testing';

import { FileExplorerComponent } from './file-explorer.component';
import { FormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { ActivatedRoute, Routes } from '@angular/router';
import { of } from 'rxjs';
import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { FileEncryptionService } from 'src/app/services/encryption/file-encryption/file-encryption.service';
import { ProfileService } from 'src/app/services/profile/profile.service';
import { MatIcon } from '@angular/material/icon';

@Component({
  selector: 'app-tree-nested-explorer',
  template: ``,
})
class MockTreeExplorerComponent {}

describe('FileExplorerComponent', () => {
  let component: FileExplorerComponent;
  let fixture: ComponentFixture<FileExplorerComponent>;

  beforeEach(async () => {
    const routes = [{ path: 'files', component: {} }] as Routes;
    const dialogHandlerSpy = jasmine.createSpyObj('MatDialog', [
      'open',
      'afterClosed',
    ]);
    const profileHandlerSpy = jasmine.createSpyObj('ProfileService', [
      'getUserName',
    ]);
    const fileHandlerSpy = jasmine.createSpyObj('FileEncryptionService', [
      'readAndDecryptFile',
    ]);
    await TestBed.configureTestingModule({
      imports: [FormsModule, RouterTestingModule.withRoutes(routes)],
      declarations: [FileExplorerComponent, MockTreeExplorerComponent, MatIcon],
      providers: [
        FileExplorerComponent,
        {
          provide: ActivatedRoute,
          useValue: {
            queryParams: of({
              url: 'example.url.com/',
            }),
          },
        },
        {
          provide: FileEncryptionService,
          useValue: fileHandlerSpy,
        },
        {
          provide: MatDialog,
          useValue: dialogHandlerSpy,
        },
        {
          provide: ProfileService,
          useValue: profileHandlerSpy,
        },
      ],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FileExplorerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should toggle view when clicked', fakeAsync(() => {
    spyOn(component, 'toggleChangingDirectory').and.callThrough();
    fixture.nativeElement.querySelector('button').click();
    expect(component.toggleChangingDirectory).toHaveBeenCalled();
  }));
});
