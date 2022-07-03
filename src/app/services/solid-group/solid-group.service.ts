import { Injectable } from '@angular/core';
import { DirectoryStructureService } from '../directory-structure/directory-structure.service';
import { EncryptionService } from '../encryption/encryption/encryption.service';
import { SolidFileHandlerService } from '../file-handler/solid-file-handler.service';

@Injectable({
  providedIn: 'root',
})
export class SolidGroupService {
  constructor(
    private fileService: SolidFileHandlerService,
    private encryptionService: EncryptionService,
    private directoryService: DirectoryStructureService
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
    const groupFolderUrl = await this.directoryService.getGroupsDirectory();
    return `${groupFolderUrl}group-${secret}.ttl`;
  }
}
