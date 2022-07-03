import { Injectable } from '@angular/core';
import { EncryptionService } from '../encryption/encryption/encryption.service';
import { SolidFileHandlerService } from '../file-handler/solid-file-handler.service';
import { ProfileService } from '../profile/profile.service';

@Injectable({
  providedIn: 'root',
})
export class SolidGroupService {
  // this must be a folder for which only the owner has read access
  private readonly secretGroupsFolderPath = 'solidcryptpad-data/groups/';

  constructor(
    private fileService: SolidFileHandlerService,
    private encryptionService: EncryptionService,
    private profileService: ProfileService
  ) {}

  /**
   * Creates a secret group file, which is publicly readable and appendable
   * @returns groupUrl
   */
  async createNewRandomGroup(): Promise<string> {
    const groupFileUrl = await this.generateSecretGroupFileUrl();
    await this.createGroupFile(groupFileUrl);
    return `${groupFileUrl}#some-group-name`;
  }

  async createGroupFile(groupFileUrl: string): Promise<void> {
    await this.fileService.writeFile(
      new Blob([], { type: 'text/turtle' }),
      groupFileUrl
    );
  }

  async generateSecretGroupFileUrl(): Promise<string> {
    const secret = this.encryptionService.generateNewKey();
    const groupFolderUrl = await this.getGroupsFolderUrl();
    return `${groupFolderUrl}group-${secret}.ttl`;
  }

  private async getGroupsFolderUrl() {
    const podUrl = await this.profileService.getPodUrl();
    return podUrl + this.secretGroupsFolderPath;
  }
}
