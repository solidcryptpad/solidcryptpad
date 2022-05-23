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

describe('FileExplorerComponent', () => {
  let component: FileExplorerComponent;
  let fixture: ComponentFixture<FileExplorerComponent>;
  let router: Router;

  beforeEach(async () => {
    const routes = [{ path: 'files', component: {} }] as Routes;

    await TestBed.configureTestingModule({
      imports: [FormsModule, RouterTestingModule.withRoutes(routes)],
      declarations: [FileExplorerComponent],
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
