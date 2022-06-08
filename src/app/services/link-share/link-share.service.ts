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

  groupTtlFilePath = 'solidcryptpad/myGroups.ttl';

  baseShareUrl =
    window.location.protocol +
    '//' +
    window.location.hostname +
    (window.location.port ? `:${window.location.port}` : '') +
    '/share?';

  /**
   * Creates a READ ONLY share link for the given file.
   * Access is granted by adding the recipient to a group
   * which has permissions to view the file. Such a group
   * has to be prepended by its permission (currently, READ-...)
   * followed by a cryptographically random string.
   * @param fileURL
   */
  async createReadOnlyShareLink(fileURL: string): Promise<string> {
    const key = await this.keystoreService.getKey(fileURL);
    const encodedKey = btoa(key);

    await this.createGroupFileIfNotExists();
    const groupKeyUrl = await this.generateReadOnlyGroupKeyUrl();

    await this.giveGroupPermissionsRead(fileURL, groupKeyUrl);

    const data = {
      file: fileURL,
      key: encodedKey,
      group: groupKeyUrl,
    };
    const urlParams = new URLSearchParams(data);

    return this.baseShareUrl + urlParams.toString();
  }

  /**
   * Creates the myGroups.ttl file if it does not exist already,
   * and sets its public access to append-only.
   */
  async createGroupFileIfNotExists() {
    const path = await this.getGroupTtlFileLocation();
    const groupFileExists = await this.fileService.fileExists(path);

    if (!groupFileExists) {
      await this.fileService.writeFile(
        new Blob([], { type: 'text/turtle' }),
        path
      );

      const [resourceAcl, myFileWithAcl] = await this.getAclForFile(path);

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

  /**
   * Returns a file's Acl and the file itself. If the file does not currently have
   * an acl then one is created for it.
   * @param path of the file whose acl is requested
   */
  async getAclForFile(path: string) {
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

    return [resourceAcl, myFileWithAcl] as const;
  }

  async giveGroupPermissionsRead(fileUrl: string, groupUrl: string) {
    const [resourceAcl, myFileWithAcl] = await this.getAclForFile(fileUrl);

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

  /**
   * Generates a cryptographically random group key url for a read only
   * group.
   */
  async generateReadOnlyGroupKeyUrl(): Promise<string> {
    const groupKey = 'READ-' + this.keystoreService.generateNewKey();
    const groupTtlFileLocation = await this.getGroupTtlFileLocation();
    return groupTtlFileLocation + '#' + groupKey;
  }

  /**
   * Inserts the current user's webId to the specified group
   * by using a so called n3-patch. Further information
   * can be found under https://solid.github.io/specification/protocol#n3-patch
   * @param webId the webId to be added
   * @param groupUrl the group to which the webId is to be added
   */
  async addWebIdToGroup(groupUrl: string) {
    const webId = await this.authService.getWebId();
    const n3Patch = `
@prefix solid: <http://www.w3.org/ns/solid/terms#>.
@prefix vcard: <http://www.w3.org/2006/vcard/ns#>.

_:addAccess a solid:InsertDeletePatch;
  solid:inserts { <${groupUrl}> vcard:hasMember <${webId}>. }.
`;

    await window.fetch(groupUrl, {
      method: 'PATCH',
      headers: {
        'content-type': 'text/n3',
      },
      body: n3Patch,
    });
  }

  /**
   * Returns the location of myGroups.ttl
   */
  async getGroupTtlFileLocation() {
    const podUrls = await this.profileService.getPodUrls();
    return podUrls[0] + this.groupTtlFilePath;
  }
}
