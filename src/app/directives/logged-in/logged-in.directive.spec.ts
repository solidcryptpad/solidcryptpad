import { LoggedInDirective } from './logged-in.directive';
import { Component, DebugNode } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { SolidAuthenticationService } from '../../services/authentication/solid-authentication.service';
import { of } from 'rxjs';

// #docregion test-component
@Component({
  template: ` <h2 *appLoggedIn>I'm logged in!</h2>
    <h2 *appLoggedIn>Me too!</h2>
    <h2 *appLoggedIn>Me three!</h2>
    <h2>Oh no</h2>`,
})
class TestComponent {}
// #enddocregion test-component

describe('LoggedInDirective', () => {
  let fixture: ComponentFixture<TestComponent>;
  let des: DebugNode[]; // the three elements w/ the directive
  let authenticationServiceSpy: jasmine.SpyObj<SolidAuthenticationService>;

  beforeEach(() => {
    const authenticationSpy = jasmine.createSpyObj(
      'SolidAuthenticationService',
      ['isLoggedIn', 'goToLoginPage']
    );

    fixture = TestBed.configureTestingModule({
      declarations: [LoggedInDirective, TestComponent],
      providers: [
        { provide: SolidAuthenticationService, useValue: authenticationSpy },
      ],
    }).createComponent(TestComponent);

    authenticationServiceSpy = TestBed.inject(
      SolidAuthenticationService
    ) as jasmine.SpyObj<SolidAuthenticationService>;

    authenticationServiceSpy.isLoggedIn.and.returnValue(of(false));
    fixture.detectChanges();
  });

  it('should have three annotated elements', () => {
    fixture.detectChanges(); // initial binding
    des = fixture.debugElement.queryAllNodes(By.directive(LoggedInDirective));
    expect(des.length).toBe(3);
  });
});
