import { Component } from '@angular/core';
import { SolidAuthenticationService } from 'src/app/services/authentication/solid-authentication.service';
import { NotificationService } from 'src/app/services/notification/notification.service';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss'],
})
export class NavbarComponent {
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
