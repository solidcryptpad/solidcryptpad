import { Component, OnInit } from '@angular/core';
import { SolidAuthenticationService } from '../../services/authentication/solid-authentication.service';
import { NotificationService } from '../../services/notification/notification.service';
import { map, Observable, startWith } from 'rxjs';
import { FormControl } from '@angular/forms';
import { Oidc } from '../../models/oidc';
import { Router } from '@angular/router';

@Component({
  selector: 'app-welcome',
  templateUrl: './welcome.component.html',
  styleUrls: ['./welcome.component.scss'],
})
export class WelcomeComponent implements OnInit {
  constructor(
    private solidAuthenticationService: SolidAuthenticationService,
    private notificationService: NotificationService,
    private router: Router
  ) {
    this.oidc = solidAuthenticationService.getDefaultOidcProviders();
  }

  oidc: Oidc[];
  oidcSelection = new FormControl();
  filteredOptions$: Observable<Oidc[]> | undefined;

  login() {
    const selected = this.oidcSelection.value;

    if (selected !== '' && !this.isValidUrl(selected)) {
      this.notificationService.error({
        title: 'Invalid provider',
        message: `"${selected}" is not a valid URL`,
      });
    } else {
      this.solidAuthenticationService.goToLoginPage(selected).catch((reason) =>
        this.notificationService.error({
          title: 'Login error',
          message: reason?.message,
        })
      );
    }
  }

  isValidUrl(url: string) {
    try {
      // throws on invalid URL
      new URL(url);
      return true;
    } catch (err) {
      return false;
    }
  }

  ngOnInit(): void {
    this.solidAuthenticationService.isLoggedIn().subscribe((val) => {
      if (val) {
        this.router.navigate(['home']);
      }
    });

    this.filteredOptions$ = this.oidcSelection.valueChanges.pipe(
      startWith(''),
      map((value) => this._filter(value))
    );
  }

  /**
   * Filter function for the material autocomplete field
   * @param value the user's input
   */
  private _filter(value: string): Oidc[] {
    const filterValue = value.toLowerCase();

    return this.oidc.filter((provider) =>
      provider.url.toLowerCase().includes(filterValue)
    );
  }
}
