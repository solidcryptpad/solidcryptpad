import { Component } from '@angular/core';
import { SolidAuthenticationService } from '../../services/solid-authentication.service';

@Component({
  selector: 'app-welcome',
  templateUrl: './welcome.component.html',
  styleUrls: ['./welcome.component.scss'],
})
export class WelcomeComponent {
  constructor(private solidAuthenticationService: SolidAuthenticationService) {}

  login() {
    this.solidAuthenticationService.goToLoginPage();
  }
}
