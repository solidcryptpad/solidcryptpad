import { Injectable } from '@angular/core';
import { ProfileService } from '../profile/profile.service';
import { SolidFileHandlerService } from '../file-handler/solid-file-handler.service';
import { FileEncryptionService } from '../encryption/file-encryption/file-encryption.service';
import { DirectoryStructureService } from '../directory-structure/directory-structure.service';

@Injectable({
  providedIn: 'root',
})
export class SharedByMeService {
  constructor(
    private profileService: ProfileService,
    private directoryService: DirectoryStructureService,
    private fileEncryptionService: FileEncryptionService,
    private fileService: SolidFileHandlerService
  ) {}

  async addLink(resourceName: string, link: string) {
    if (!(await this.sharedByMeIndexExists())) {
      await this.instantiateSharedByMeIndexWithFirstEntry(resourceName, link);
      return;
    }
    const index = await this.getAllSharedByMe();
    index.links.push({ resourceName: resourceName, link: link });

    await this.saveIndex(JSON.stringify(index));
  }

  async instantiateSharedByMeIndexWithFirstEntry(
    resourceName: string,
    link: string
  ) {
    const firstEntry = JSON.stringify({
      links: [{ resourceName: resourceName, link: link }],
    });
    await this.saveIndex(firstEntry);
  }

  async getAllSharedByMe() {
    const indexAsBlob = await this.fileEncryptionService.readAndDecryptFile(
      await this.getIndexUrl()
    );

    // TODO: this should return some specific type, not any
    return JSON.parse(await indexAsBlob.text());
  }

  async removeLink(link: string) {
    const allSharedByMe = await this.getAllSharedByMe();

    allSharedByMe.links.splice(
      allSharedByMe.links.findIndex((v: { link: string }) => v.link === link),
      1
    );

    await this.saveIndex(JSON.stringify(allSharedByMe));
  }

  private async getIndexUrl() {
    return (
      (await this.directoryService.getSharingDirectory()) + 'shared-by-me.json'
    );
  }

  private async sharedByMeIndexExists() {
    return this.fileService.resourceExists(await this.getIndexUrl());
  }

  private async saveIndex(index: string) {
    const indexUrl = await this.getIndexUrl();
    const asBlob = new Blob([index], { type: 'application/json' });
    await this.fileEncryptionService.writeAndEncryptFile(asBlob, indexUrl);
  }
}
