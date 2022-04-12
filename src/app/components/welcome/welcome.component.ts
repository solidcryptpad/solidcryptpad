import { Component } from '@angular/core';
import { SolidAuthenticationService } from '../../services/authentication/solid-authentication.service';

@Component({
  selector: 'app-welcome',
  templateUrl: './welcome.component.html',
  styleUrls: ['./welcome.component.scss'],
})
export class WelcomeComponent {
  constructor(private solidAuthenticationService: SolidAuthenticationService) {
    this.oidc = solidAuthenticationService.oidc;
    this.selected = '';
  }

  public oidc: string[][];
  public selected: string;

  login() {
    if (this.selected === '') {
      this.solidAuthenticationService
        .goToLoginPage()
        .catch((reason) => window.alert(reason.message));
    } else {
      this.solidAuthenticationService
        .goToLoginPage(this.selected)
        .catch((reason) => window.alert(reason.message));
    }
  }
}
