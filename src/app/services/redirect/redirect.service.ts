import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class RedirectService {
  private storage_key = 'url';

  public setRedirect(url: string) {
    localStorage.setItem(this.storage_key, url);
  }

  /**
   * redirects to url or does nothing if not set
   */
  public tryRedirect() {
    const url = localStorage.getItem(this.storage_key);
    if (url !== null) {
      localStorage.removeItem(this.storage_key);
      window.location.href = url;
    }
  }
}
