import { Injectable } from '@angular/core';
import { getPodUrlAll, getProfileAll, UrlString } from '@inrupt/solid-client';
import { SolidAuthenticationService } from '../authentication/solid-authentication.service';

@Injectable({
  providedIn: 'root',
})
export class ProfileService {
  constructor(private authService: SolidAuthenticationService) {}

  /**
   * Retrieves all Pod Urls connected to the logged in webId.
   */
  async getPodUrls(): Promise<UrlString[]> {
    return getPodUrlAll(await this.getWebId());
  }

  /**
   * Retrieves profile resources advertised by webId.
   */
  async getProfileAll() {
    return getProfileAll(await this.getWebId());
  }

  /**
   * Retrieves the webId of the logged in user
   */
  async getWebId() {
    return this.authService.getWebId();
  }
}
