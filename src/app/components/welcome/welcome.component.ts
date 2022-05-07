import { Component, OnInit } from '@angular/core';
import { SolidAuthenticationService } from '../../services/authentication/solid-authentication.service';
import { NotificationService } from '../../services/notification/notification.service';
import { map, Observable, startWith } from 'rxjs';
import { FormControl } from '@angular/forms';

@Component({
  selector: 'app-welcome',
  templateUrl: './welcome.component.html',
  styleUrls: ['./welcome.component.scss'],
})
export class WelcomeComponent implements OnInit {
  constructor(
    private solidAuthenticationService: SolidAuthenticationService,
    private notificationService: NotificationService
  ) {
    this.oidc = solidAuthenticationService.oidc;
    this.selected = '';
  }

  myControl = new FormControl();

  public oidc: string[];
  public selected: string;
  filteredOptions$: Observable<string[]> | undefined;

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

  ngOnInit(): void {
    this.filteredOptions$ = this.myControl.valueChanges.pipe(
      startWith(''),
      map((value) => this._filter(value))
    );
  }

  private _filter(value: string): string[] {
    const filterValue = value.toLowerCase();

    return this.oidc.filter((provider) =>
      provider.toLowerCase().includes(filterValue)
    );
  }
}
