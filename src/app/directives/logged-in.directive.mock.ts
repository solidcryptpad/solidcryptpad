import { Directive, TemplateRef, ViewContainerRef } from '@angular/core';

@Directive({
  selector: '[appLoggedIn]',
})
export class MockLoggedInDirective {
  constructor(
    private templateRef: TemplateRef<never>,
    private viewContainer: ViewContainerRef
  ) {}

  mockLogin(): void {
    this.viewContainer.createEmbeddedView(this.templateRef);
  }

  mockLogout(): void {
    this.viewContainer.clear();
  }
}
