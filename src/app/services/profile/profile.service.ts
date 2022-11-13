import { Injectable } from '@angular/core';

import { SolidAuthenticationService } from '../authentication/solid-authentication.service';
import { FOAF } from '@inrupt/vocab-common-rdf';

import { SolidClientService } from '../module-wrappers/solid-client/solid-client.service';
import { AttributeNotFoundException } from '../../exceptions/attribute-not-found-exception';

@Injectable({
  providedIn: 'root',
})
export class ProfileService {
  cachedUserName: string | null = null;

  cachedPodUrl: string | null = null;

  constructor(
    private authService: SolidAuthenticationService,
    private solidClientService: SolidClientService
  ) {}

  /**
   * Check if the logged in person has a username
   */
  async hasUserName(): Promise<boolean> {
    try {
      await this.getUserName();
      return true;
    } catch (err) {
      if (err instanceof AttributeNotFoundException) {
        return false;
      }
      throw err;
    }
  }

  /**
   * Retrieves the name of the logged in person.
   */
  async getUserName(): Promise<string> {
    if (this.cachedUserName) {
      return this.cachedUserName;
    }

    const profile = this.solidClientService.getThing(
      await this.getProfileDataset(),
      await this.authService.getWebId()
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

    this.cachedUserName = userName;

    return userName;
  }

  /**
   * Get current pod url of the logged in user
   */
  async getPodUrl(): Promise<string> {
    if (this.cachedPodUrl) {
      return this.cachedPodUrl;
    }

    const podUrls = await this.solidClientService.getPodUrlAll(
      await this.authService.getWebId()
    );
    if (!podUrls.length) {
      throw new AttributeNotFoundException(
        'No pod is associated with your profile. Please add one to use this application'
      );
    }
    this.cachedPodUrl = podUrls[0];
    return this.cachedPodUrl;
  }

  /**
   * Retrieves profile dataset containing public information.
   */
  private async getProfileDataset() {
    return this.solidClientService.getSolidDataset(
      await this.authService.getWebId()
    );
  }
}
