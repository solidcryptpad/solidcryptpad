import { Component } from '@angular/core';
import { NotificationService } from 'src/app/services/notification/notification.service';
import { SolidAuthenticationService } from '../../services/authentication/solid-authentication.service';

@Component({
  selector: 'app-welcome',
  templateUrl: './welcome.component.html',
  styleUrls: ['./welcome.component.scss'],
})
export class WelcomeComponent {
  constructor(
    private solidAuthenticationService: SolidAuthenticationService,
    private notificationService: NotificationService
  ) {
    this.oidc = solidAuthenticationService.oidc;
    this.selected = '';
  }

  public oidc: string[][];
  public selected: string;

  login() {
    if (this.selected !== '' && !this.isValidUrl(this.selected)) {
      this.notificationService.error({
        title: 'Invalid provider',
        message: `"${this.selected}" is not a valid URL`,
      });
    } else if (this.selected === '') {
      this.solidAuthenticationService.goToLoginPage().catch((reason) =>
        this.notificationService.error({
          title: 'Login error',
          message: reason?.message,
        })
      );
    } else {
      this.solidAuthenticationService
        .goToLoginPage(this.selected)
        .catch((reason) =>
          this.notificationService.error({
            title: 'Login error',
            message: reason?.message,
          })
        );
    }
  }

  private isValidUrl(url: string) {
    try {
      // throws on invalid URL
      new URL(url);
      return true;
    } catch (err) {
      return false;
    }
  }
}
