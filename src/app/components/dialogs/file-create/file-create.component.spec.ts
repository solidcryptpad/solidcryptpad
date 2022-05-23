import {
  ComponentFixture,
  fakeAsync,
  TestBed,
  tick,
} from '@angular/core/testing';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Router, Routes } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';

import { FileCreateComponent } from './file-create.component';

describe('FileCreateComponent', () => {
  let component: FileCreateComponent;
  let fixture: ComponentFixture<FileCreateComponent>;
  let router: Router;

  beforeEach(async () => {
    const routes = [{ path: 'editor', component: {} }] as Routes;
    await TestBed.configureTestingModule({
      imports: [RouterTestingModule.withRoutes(routes)],
      declarations: [FileCreateComponent],
      providers: [
        { provide: MAT_DIALOG_DATA, useValue: {} },
        // eslint-disable-next-line
        { provide: MatDialogRef, useValue: { close: () => {} } },
      ],
    }).compileComponents();
    router = TestBed.inject(Router);
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FileCreateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
  it('createFile redirects to editor', fakeAsync(() => {
    fixture.nativeElement.querySelector('#create').click();
    tick();

    expect(router.url.split('?')[0]).toBe('/editor');
  }));
});
