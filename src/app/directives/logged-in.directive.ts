import {
  Directive,
  ElementRef,
  OnInit,
  TemplateRef,
  ViewContainerRef,
} from '@angular/core';
import { SolidAuthenticationService } from '../services/authentication/solid-authentication.service';

@Directive({
  selector: '[appLoggedIn]',
})
export class LoggedInDirective implements OnInit {
  constructor(
    private element: ElementRef,
    private templateRef: TemplateRef<any>,
    private viewContainer: ViewContainerRef,
    private solidAuthenticationService: SolidAuthenticationService
  ) {}

  //loggedIn$: Observable<boolean> | undefined;

  ngOnInit(): void {
    this.solidAuthenticationService.isLoggedIn().subscribe((isLoggedIn) => {
      if (isLoggedIn) {
        this.viewContainer.createEmbeddedView(this.templateRef);
      } else {
        this.viewContainer.clear();
      }
    });
  }
}
