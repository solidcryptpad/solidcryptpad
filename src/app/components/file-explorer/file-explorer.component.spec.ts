import {
  ComponentFixture,
  fakeAsync,
  TestBed,
  tick,
} from '@angular/core/testing';

import { FileExplorerComponent } from './file-explorer.component';
import { FormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { ActivatedRoute, Router, Routes } from '@angular/router';
import { of } from 'rxjs';
import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { FileEncryptionService } from 'src/app/services/encryption/file-encryption/file-encryption.service';
import { ProfileService } from 'src/app/services/profile/profile.service';

@Component({
  selector: 'app-tree-nested-explorer',
  template: ``,
})
class MockTreeExplorerComponent {}

describe('FileExplorerComponent', () => {
  let component: FileExplorerComponent;
  let fixture: ComponentFixture<FileExplorerComponent>;
  let router: Router;

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
      declarations: [FileExplorerComponent, MockTreeExplorerComponent],
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
    router = TestBed.inject(Router);
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FileExplorerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should navigate to files when clicked', fakeAsync(() => {
    fixture.nativeElement.querySelector('button').click();
    tick();

    expect(router.url).toBe('/files?url=');
  }));
});
