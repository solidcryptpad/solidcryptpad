import { Injectable } from '@angular/core';
import { ProfileService } from '../profile/profile.service';

@Injectable({
  providedIn: 'root',
})
export class DirectoryStructureService {
  constructor(private profileService: ProfileService) {}

  // these must be folders for which only the owner has read access
  // e.g. don't use /public except if it has to be public by default
  private readonly dirStorage = 'solidcryptpad/';
  private readonly dirMetadata = 'solidcryptpad-data/';
  private readonly dirKeystores = this.dirMetadata + 'keystores/';
  private readonly dirGroups = this.dirMetadata + 'groups/';
  private readonly dirSharing = this.dirMetadata + 'sharing/';

  private readonly encryptedDirectories = [this.dirStorage, this.dirSharing];

  /**
   * Directory where everything will be inside
   */
  async getRootDirectory() {
    return this.profileService.getPodUrl();
  }

  /**
   * Default directory where files are stored
   */
  async getDefaultStorageDirectory() {
    return (await this.getRootDirectory()) + this.dirStorage;
  }

  /**
   * Directory where metadata ist stored
   */
  async getMetadataDirectory() {
    return (await this.getRootDirectory()) + this.dirMetadata;
  }

  /**
   * Directory where own keystores are stored
   */
  async getKeystoresDirectory() {
    return (await this.getRootDirectory()) + this.dirKeystores;
  }

  /**
   * Directory where sharing indexes are stored
   */
  async getSharingDirectory() {
    return (await this.getRootDirectory()) + this.dirSharing;
  }

  /**
   * Directory where groups are stored
   */
  async getGroupsDirectory() {
    return (await this.getRootDirectory()) + this.dirGroups;
  }

  isInEncryptedDirectory(url: string) {
    return this.encryptedDirectories.some((path) => url.includes(`/${path}`));
  }
}
