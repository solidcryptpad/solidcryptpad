import { Injectable } from '@angular/core';
import { KeystoreService } from '../keystore/keystore.service';
import {
  createAclFromFallbackAcl,
  getFileWithAcl,
  getResourceAcl,
  hasAccessibleAcl,
  hasFallbackAcl,
  hasResourceAcl,
  saveAclFor,
  setGroupResourceAccess,
  setPublicResourceAccess,
} from '@inrupt/solid-client';
import { SolidAuthenticationService } from '../authentication/solid-authentication.service';
import { SolidFileHandlerService } from '../file-handler/solid-file-handler.service';
import { ProfileService } from '../profile/profile.service';

@Injectable({
  providedIn: 'root',
})
export class LinkShareService {
  constructor(
    private keystoreService: KeystoreService,
    private authService: SolidAuthenticationService,
    private fileService: SolidFileHandlerService,
    private profileService: ProfileService
  ) {}

  async createShareLink(fileURL: string): Promise<string> {
    const key = await this.keystoreService.getKey(fileURL);
    const encodedKey = btoa(key);

    await this.createGroupFileIfNotExists();
    // generate groupKey
    const groupKey = this.keystoreService.generateNewKey();
    const podUrls = await this.profileService.getPodUrls();
    const groupKeyUrl = podUrls[0] + 'solidcryptpad/myGroups.ttl#' + groupKey;

    await this.giveGroupPermissionsRead(fileURL, groupKeyUrl);

    const data = {
      file: fileURL,
      key: encodedKey,
      group: groupKeyUrl,
    };
    const urlParams = new URLSearchParams(data);

    const link = `http://localhost:4200/share?` + urlParams.toString();

    return link;
  }

  async createGroupFileIfNotExists() {
    // check if myGroups.ttl exists
    const podUrls = await this.profileService.getPodUrls();
    const path = podUrls[0] + 'solidcryptpad/myGroups.ttl';
    const groupFileExists = await this.fileService.fileExists(path);

    if (!groupFileExists) {
      // create group
      const blobby = new Blob([], { type: 'text/turtle' });
      await this.fileService.writeFile(blobby, path);

      const myFileWithAcl = await getFileWithAcl(path, {
        fetch: this.authService.authenticatedFetch.bind(this.authService),
      });

      let resourceAcl;

      if (!hasResourceAcl(myFileWithAcl)) {
        if (!hasAccessibleAcl(myFileWithAcl)) {
          throw new Error('Acl file is inaccessible');
        }

        if (!hasFallbackAcl(myFileWithAcl)) {
          throw new Error('Current user does not have permission to load acl');
        }

        resourceAcl = createAclFromFallbackAcl(myFileWithAcl);
      } else {
        resourceAcl = getResourceAcl(myFileWithAcl);
      }

      const updatedAcl = setPublicResourceAccess(resourceAcl, {
        read: false,
        write: false,
        append: true,
        control: false,
      });

      await saveAclFor(myFileWithAcl, updatedAcl, {
        fetch: this.authService.authenticatedFetch.bind(this.authService),
      });
    }
  }

  async giveGroupPermissionsRead(fileUrl: string, groupUrl: string) {
    const myFileWithAcl = await getFileWithAcl(fileUrl, {
      fetch: this.authService.authenticatedFetch.bind(this.authService),
    });

    let resourceAcl;

    if (!hasResourceAcl(myFileWithAcl)) {
      if (!hasAccessibleAcl(myFileWithAcl)) {
        throw new Error('Acl file is inaccessible');
      }

      if (!hasFallbackAcl(myFileWithAcl)) {
        throw new Error('Current user does not have permission to load acl');
      }

      resourceAcl = createAclFromFallbackAcl(myFileWithAcl);
    } else {
      resourceAcl = getResourceAcl(myFileWithAcl);
    }

    console.log("this file's resourceAcl: ", resourceAcl);

    const updatedAcl = setGroupResourceAccess(resourceAcl, groupUrl, {
      read: true,
      write: false,
      append: false,
      control: false,
    });

    await saveAclFor(myFileWithAcl, updatedAcl, {
      fetch: this.authService.authenticatedFetch.bind(this.authService),
    });
  }

  async addWebIdToGroup(webId: string, groupUrl: string) {
    const n3Patch = `
@prefix solid: <http://www.w3.org/ns/solid/terms#>.
@prefix vcard: <http://www.w3.org/2006/vcard/ns#>.

_:addAccess a solid:InsertDeletePatch;
  solid:inserts { <${groupUrl}> vcard:hasMember <${webId}>. }.
`;
    // send as PATCH to fileUrl

    await window.fetch(groupUrl, {
      method: 'PATCH',
      headers: {
        'content-type': 'text/n3',
      },
      body: n3Patch,
    });
  }
}
