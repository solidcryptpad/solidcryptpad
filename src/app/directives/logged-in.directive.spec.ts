import { LoggedInDirective } from './logged-in.directive';
import { Component, DebugElement } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';

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
  let des: DebugElement[]; // the three elements w/ the directive

  beforeEach(() => {
    fixture = TestBed.configureTestingModule({
      declarations: [LoggedInDirective, TestComponent],
    }).createComponent(TestComponent);

    fixture.detectChanges(); // initial binding

    // all elements with an attached HighlightDirective
    des = fixture.debugElement.queryAll(By.directive(LoggedInDirective));
  });

  it('should have three annotated elements', () => {
    expect(des.length).toBe(3);
  });
});
