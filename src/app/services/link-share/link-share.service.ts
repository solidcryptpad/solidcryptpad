import { Injectable } from '@angular/core';
import { KeystoreService } from '../encryption/keystore/keystore.service';
import {
  createAclFromFallbackAcl,
  getFileWithAcl,
  getResourceAcl,
  hasAccessibleAcl,
  hasFallbackAcl,
  hasResourceAcl,
  saveAclFor,
  setGroupDefaultAccess,
  setGroupResourceAccess,
  setPublicResourceAccess,
} from '@inrupt/solid-client';
import { SolidAuthenticationService } from '../authentication/solid-authentication.service';
import { SolidFileHandlerService } from '../file-handler/solid-file-handler.service';
import { ProfileService } from '../profile/profile.service';
import { EncryptionService } from '../encryption/encryption/encryption.service';

interface Permissions {
  read: boolean;
  append: boolean;
  write: boolean;
  control: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class LinkShareService {
  constructor(
    private keystoreService: KeystoreService,
    private encryptionService: EncryptionService,
    private authService: SolidAuthenticationService,
    private fileService: SolidFileHandlerService,
    private profileService: ProfileService
  ) {}

  groupTtlFilePath = 'solidcryptpad/myGroups.ttl';
  private readonly groupsFolderPath = 'solidcryptpad/groups/';

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
   * Creates a read only share link for the given folder.
   */
  async createReadOnlyFolderLink(folderURL: string): Promise<string> {
    // TODO: somehow give access to a keystore for this folder
    await this.ensureGroupsFolderExists();

    // secret group file, but publicly readable if the name is known
    const groupUrl = await this.generateSecretGroupFileName();
    await this.fileService.writeFile(
      new Blob([], { type: 'text/turtle' }),
      groupUrl
    );
    await this.setItemPublicPermissions(groupUrl, {
      append: true,
      read: true,
      write: false,
      control: false,
    });

    // give group access to read the folder and all items in it without an acl file
    // TODO: also give all files with custom acl access to this link?
    const groupKeyUrl = `${groupUrl}#sharing-group`;
    await this.giveGroupDefaultPermissionRead(folderURL, groupKeyUrl);
    await this.giveGroupPermissionsRead(folderURL, groupKeyUrl);

    const urlParams = new URLSearchParams({
      folder: folderURL,
      group: groupKeyUrl,
    });

    return this.baseShareUrl + urlParams.toString();
  }

  /**
   * Creates groups folder with appropriate permissions if it does not exist
   */
  async ensureGroupsFolderExists() {
    const groupsFolderUrl = await this.getGroupsFolderUrl();
    if (!(await this.fileService.containerExists(groupsFolderUrl))) {
      await this.createSecretFolder(groupsFolderUrl);
    }
  }

  /**
   * Create a folder where only the creator has access
   */
  async createSecretFolder(folderUrl: string) {
    await this.fileService.writeContainer(folderUrl);
    // TODO: consider creating ACL from scratch, to prevent inheriting bad defaults
    await this.setItemPublicPermissions(folderUrl, {
      append: false,
      read: false,
      write: false,
      control: false,
    });
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

  async setItemPublicPermissions(
    fileUrl: string,
    permissions: Permissions
  ): Promise<void> {
    const [resourceAcl, myFileWithAcl] = await this.getAclForFile(fileUrl);
    const updatedAcl = setPublicResourceAccess(resourceAcl, permissions);
    await saveAclFor(myFileWithAcl, updatedAcl, {
      fetch: this.authService.authenticatedFetch.bind(this.authService),
    });
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
   * Gives this group read permissions for all contained resources of the folder
   */
  async giveGroupDefaultPermissionRead(folderUrl: string, groupUrl: string) {
    const [resourceAcl, myFileWithAcl] = await this.getAclForFile(folderUrl);

    const updatedAcl = setGroupDefaultAccess(resourceAcl, groupUrl, {
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
    const groupKey = 'READ-' + this.encryptionService.generateNewKey();
    const groupTtlFileLocation = await this.getGroupTtlFileLocation();
    return groupTtlFileLocation + '#' + groupKey;
  }

  async generateSecretGroupFileName(): Promise<string> {
    const secret = this.encryptionService.generateNewKey();
    const groupFolderUrl = await this.getGroupsFolderUrl();
    return `${groupFolderUrl}group-${secret}.ttl`;
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

  async getGroupsFolderUrl() {
    const podUrls = await this.profileService.getPodUrls();
    return podUrls[0] + this.groupsFolderPath;
  }
}
