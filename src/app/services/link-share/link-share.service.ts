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
import { PermissionException } from 'src/app/exceptions/permission-exception';

interface Permissions {
  read: boolean;
  append: boolean;
  write: boolean;
  control: boolean;
}

const noPermissions = {
  read: false,
  append: false,
  write: false,
  control: false,
} as const;

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

  private readonly groupTtlFilePath = 'solidcryptpad/myGroups.ttl';
  private readonly groupsFolderPath = 'solidcryptpad/groups/';
  private readonly baseShareUrl = window.location.origin + '/share?';

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

    await this.setGroupResourcePermissions(fileURL, groupKeyUrl, {
      read: true,
    });

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
    return this.createFolderSharingLink(folderURL, {
      read: true,
    });
  }

  /**
   * Creates a read only share link for the given folder.
   */
  async createReadWriteFolderLink(folderURL: string): Promise<string> {
    return this.createFolderSharingLink(folderURL, {
      read: true,
      write: true,
    });
  }

  /**
   * Creates a share link for for the given folder with the given permissions.
   */
  private async createFolderSharingLink(
    folderURL: string,
    grantedPermissions: Partial<Permissions>
  ): Promise<string> {
    // TODO: somehow give access to a keystore for this folder
    await this.ensureGroupsFolderExists();

    // secret group file, but publicly readable if the name is known
    const groupUrl = await this.generateSecretGroupFileName();
    await this.fileService.writeFile(
      new Blob([], { type: 'text/turtle' }),
      groupUrl
    );
    await this.setItemPublicPermissions(groupUrl, { read: true, append: true });

    // give access to the folder and all items in it without an acl file
    const groupKeyUrl = `${groupUrl}#sharing-group`;
    await this.setGroupDefaultPermissions(
      folderURL,
      groupKeyUrl,
      grantedPermissions
    );
    await this.setGroupResourcePermissions(
      folderURL,
      groupKeyUrl,
      grantedPermissions
    );
    // give access to all items in the folder with an acl file
    // TODO: test if this really works
    await this.fileService.traverseContainerContentsRecursively(
      folderURL,
      async (resourceUrl) => {
        console.log(resourceUrl, await this.hasAcl(resourceUrl));
        if (await this.hasAcl(resourceUrl)) {
          if (this.fileService.isContainer(resourceUrl))
            await this.setGroupDefaultPermissions(
              resourceUrl,
              groupKeyUrl,
              grantedPermissions
            );
          await this.setGroupResourcePermissions(
            resourceUrl,
            groupKeyUrl,
            grantedPermissions
          );
        }
      }
    );

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
    await this.setItemPublicPermissions(folderUrl, {});
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
    grantedPermissions: Partial<Permissions>
  ): Promise<void> {
    const [resourceAcl, myFileWithAcl] = await this.getAclForFile(fileUrl);
    const permissions: Permissions = {
      ...noPermissions,
      ...grantedPermissions,
    };
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
      console.log('from fallback', path, resourceAcl);
    } else {
      resourceAcl = getResourceAcl(myFileWithAcl);
    }

    return [resourceAcl, myFileWithAcl] as const;
  }

  async setGroupResourcePermissions(
    resourceUrl: string,
    groupUrl: string,
    grantedPermissions: Partial<Permissions>
  ) {
    const [resourceAcl, myFileWithAcl] = await this.getAclForFile(resourceUrl);
    const permissions: Permissions = {
      ...noPermissions,
      ...grantedPermissions,
    };

    const updatedAcl = setGroupResourceAccess(
      resourceAcl,
      groupUrl,
      permissions
    );

    await saveAclFor(myFileWithAcl, updatedAcl, {
      fetch: this.authService.authenticatedFetch.bind(this.authService),
    });
  }

  /**
   * Return true if the resource has its own acl file
   *
   * @throws PermissionException if the current user has no control access
   */
  async hasAcl(resourceUrl: string): Promise<boolean> {
    const resourceWithAcl = await getFileWithAcl(resourceUrl, {
      fetch: this.authService.authenticatedFetch.bind(this.authService),
    });

    if (!hasAccessibleAcl(resourceWithAcl))
      throw new PermissionException(
        `You don't seem to have control access to ${resourceUrl}`
      );
    return hasResourceAcl(resourceWithAcl);
  }

  /**
   * Set default group permissions for all contained resources
   * @param folderUrl
   * @param groupUrl
   * @param grantedPermissions new permissions of this group. Default to false for unspecified values
   */
  async setGroupDefaultPermissions(
    folderUrl: string,
    groupUrl: string,
    grantedPermissions: Partial<Permissions>
  ) {
    const [resourceAcl, myFileWithAcl] = await this.getAclForFile(folderUrl);
    const permissions: Permissions = {
      ...noPermissions,
      ...grantedPermissions,
    };

    const updatedAcl = setGroupDefaultAccess(
      resourceAcl,
      groupUrl,
      permissions
    );

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
