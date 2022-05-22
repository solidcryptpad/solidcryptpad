import { Injectable } from '@angular/core';

import { SolidAuthenticationService } from '../authentication/solid-authentication.service';
import { FOAF } from '@inrupt/vocab-common-rdf';

import { SolidClientService } from '../module-wrappers/solid-client/solid-client.service';
import { AttributeNotFoundException } from '../../exceptions/attribute-not-found-exception';

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
  async getUserName(): Promise<string> {
    const profile = this.solidClientService.getThing(
      await this.getProfileDataset(),
      await this.getWebId()
    );

    if (profile === null) {
      throw new Error('Could not retrieve profile');
    }

    const userName = this.solidClientService.getStringNoLocale(
      profile,
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
    console.log('getPodUrls', await this.getWebId());
    console.log(
      await this.solidClientService
        .getPodUrlAll(await this.getWebId())
        .catch(() => 'could not get podUrls')
    );
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
