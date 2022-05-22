import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PageNotFoundComponent } from './page-not-found.component';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';

describe('PageNotFoundComponent', () => {
  let component: PageNotFoundComponent;
  let fixture: ComponentFixture<PageNotFoundComponent>;
  let router: Router;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RouterTestingModule],
      declarations: [PageNotFoundComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PageNotFoundComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    router = TestBed.inject(Router);
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should contain 404', () => {
    const header = fixture.nativeElement.querySelector('h1');
    expect(header.innerText).toContain('404');
  });

  it('button should redirect back', () => {
    const button = fixture.nativeElement.querySelector('button');
    button.click();
    expect(router.url).toBe('/');
  });

  it('contains message for user', () => {
    const message = fixture.nativeElement.querySelector('h2');
    expect(message.innerText.length).toBeGreaterThan(0);
  });
});
