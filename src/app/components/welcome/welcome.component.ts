import { Component } from '@angular/core';
import { SolidAuthenticationService } from '../../services/solid-authentication.service';

@Component({
  selector: 'app-welcome',
  templateUrl: './welcome.component.html',
  styleUrls: ['./welcome.component.scss'],
})
export class WelcomeComponent {
  constructor(private solidAuthenticationService: SolidAuthenticationService) {
    this.oidc = solidAuthenticationService.defaultOidc;
    this.selected = '';
  }

  public oidc: string[][];
  public selected: string;

  login() {
    if (this.selected === '') this.solidAuthenticationService.goToLoginPage();
    else this.solidAuthenticationService.goToLoginPage(this.selected);
  }
}
