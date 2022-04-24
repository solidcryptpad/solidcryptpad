import { Injectable } from '@angular/core';

import { SolidAuthenticationService } from '../authentication/solid-authentication.service';
import { FOAF } from '@inrupt/vocab-common-rdf';
import { AttributeNotFoundException } from '../../exceptions/attribute-not-found-exception';
import { SolidClientService } from '../module-wrappers/solid-client/solid-client.service';
import { Thing } from '@inrupt/solid-client';

@Injectable({
  providedIn: 'root',
})
export class ProfileService {
  constructor(
    private authService: SolidAuthenticationService,
    private solidClientService: SolidClientService
  ) {}

  /**
   * Retrieves the name of the logged in person.
   */
  async getUserName() {
    const profile = this.solidClientService.getThing(
      await this.getProfileDataset(),
      await this.getWebId()
    );

    const userName = this.solidClientService.getStringNoLocale(
      <Thing>profile,
      FOAF.name
    );

    if (userName === null) {
      throw new AttributeNotFoundException(FOAF.name);
    }

    return userName;
  }

  /**
   * Retrieves all Pod Urls connected to the logged in webId.
   */
  async getPodUrls(): Promise<string[]> {
    return this.solidClientService.getPodUrlAll(await this.getWebId());
  }

  /**
   * Retrieves the webId of the logged in user
   */
  async getWebId(): Promise<string> {
    return this.authService.getWebId();
  }

  /**
   * Retrieves profile dataset containing public information.
   */
  private async getProfileDataset() {
    return this.solidClientService.getSolidDataset(await this.getWebId());
  }
}
