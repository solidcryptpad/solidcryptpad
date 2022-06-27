import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class RedirectService {
  private storage_key = 'url';

  constructor(private router: Router) {}

  public setRedirect(url: string) {
    localStorage.setItem(this.storage_key, url);
  }

  /**
   * redirects to url or does nothing if not set
   */
  public tryRedirect() {
    const url = localStorage.getItem('url');
    if (url !== null) {
      this.router.navigateByUrl(url);
    }
  }
}
