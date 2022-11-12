import { LocationStrategy } from '@angular/common';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class NavigationService {
  constructor(
    private locationStrategy: LocationStrategy,
    private router: Router
  ) {}

  /**
   * Navigates to the target url and does not add the base-href a second time
   *
   * @example
   * ```ts
   * // if base-href set to '/solidcryptpad/'
   * // navigate to '/solidcryptpad/files'
   * await navigateByUrlIgnoringBaseHref('/solidcryptpad/files')
   * // router.navigateByUrl would navigate to base-href + '/solidcryptpad/files' instead
   * ```
   */
  navigateByUrlIgnoringBaseHref(url: string) {
    const baseHref = this.locationStrategy.getBaseHref();
    if (url.startsWith(baseHref)) {
      url = '/' + url.substring(baseHref.length);
    }
    return this.router.navigateByUrl(url);
  }

  /**
   * @returns root of the solidcryptpad app
   */
  getAppRoot() {
    return `${this.getOrigin()}${this.locationStrategy.getBaseHref()}`;
  }

  // wrapper to allow mocking window.location.origin in tests
  private getOrigin() {
    return window.location.origin;
  }
}
