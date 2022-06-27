import { TestBed } from '@angular/core/testing';
import { Routes } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { RedirectService } from './redirect.service';

describe('RedirectService', () => {
  let service: RedirectService;

  beforeEach(() => {
    const routes = [] as Routes;

    TestBed.configureTestingModule({
      imports: [RouterTestingModule.withRoutes(routes)],
    });
    service = TestBed.inject(RedirectService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
