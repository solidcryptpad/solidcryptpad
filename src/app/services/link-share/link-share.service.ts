import { Injectable } from '@angular/core';
import { KeystoreService } from '../encryption/keystore/keystore.service';
import { SolidAuthenticationService } from '../authentication/solid-authentication.service';
import { SolidFileHandlerService } from '../file-handler/solid-file-handler.service';
import { ProfileService } from '../profile/profile.service';
import { EncryptionService } from '../encryption/encryption/encryption.service';
import {
  SolidPermissionService,
  SolidPermissions,
} from '../solid-permission/solid-permission.service';
import { Keystore } from '../encryption/keystore/keystore.interface';
import { FolderKeystore } from '../encryption/keystore/folder-keystore.class';
import { KeystoreStorageService } from '../encryption/keystore/keystore-storage.service';

@Injectable({
  providedIn: 'root',
})
export class LinkShareService {
  constructor(
    private keystoreService: KeystoreService,
    private keystoreStorageService: KeystoreStorageService,
    private encryptionService: EncryptionService,
    private authService: SolidAuthenticationService,
    private fileService: SolidFileHandlerService,
    private profileService: ProfileService,
    private permissionService: SolidPermissionService
  ) {}

  private readonly groupsFolderPath = 'solidcryptpad/groups/';

  /**
   * Creates a READ ONLY share link for the given file.
   * Access is granted by adding the recipient to a group
   * which has permissions to view the file. Such a group
   * has to be prepended by its permission (currently, READ-...)
   * followed by a cryptographically random string.
   * @param fileURL
   */
  async createReadOnlyShareLink(fileURL: string): Promise<string> {
    return this.createFileSharingLink(fileURL, { read: true });
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

  private async createFileSharingLink(
    fileUrl: string,
    grantedPermissions: Partial<SolidPermissions>
  ): Promise<string> {
    const key = await this.keystoreService.getKey(fileUrl);
    const encodedKey = btoa(key);

    await this.ensureGroupsFolderExists();
    const groupUrl = await this.createNewRandomGroup();

    await this.permissionService.setGroupResourcePermissions(
      fileUrl,
      groupUrl,
      grantedPermissions
    );

    return this.toSharingLink({
      file: fileUrl,
      key: encodedKey,
      group: groupUrl,
    });
  }

  /**
   * Creates a share link for for the given folder with the given permissions.
   */
  private async createFolderSharingLink(
    folderURL: string,
    grantedPermissions: Partial<SolidPermissions>
  ): Promise<string> {
    // TODO: somehow give access to a keystore for this folder
    const encryptionKey = this.encryptionService.generateNewKey();
    const keystoreUrl = await this.setupKeystoreForFolder(
      folderURL,
      encryptionKey
    );
    // currently it only handles solid sharing, not encryption

    await this.ensureGroupsFolderExists();
    const groupUrl = await this.createNewRandomGroup();

    // give access to the folder and all items in it without an acl file
    await this.permissionService.setGroupDefaultPermissions(
      folderURL,
      groupUrl,
      grantedPermissions
    );
    await this.permissionService.setGroupResourcePermissions(
      folderURL,
      groupUrl,
      grantedPermissions
    );

    // give access to all items in the folder with an acl file
    // TODO: test if this really works
    await this.fileService.traverseContainerContentsRecursively(
      folderURL,
      async (resourceUrl) => {
        if (await this.permissionService.hasAcl(resourceUrl)) {
          if (this.fileService.isContainer(resourceUrl))
            await this.permissionService.setGroupDefaultPermissions(
              resourceUrl,
              groupUrl,
              grantedPermissions
            );
          await this.permissionService.setGroupResourcePermissions(
            resourceUrl,
            groupUrl,
            grantedPermissions
          );
        }
      }
    );

    return this.toSharingLink({
      folder: folderURL,
      group: groupUrl,
      keystore: keystoreUrl,
      keystoreEncryptionKey: encryptionKey,
    });
  }

  private async setupKeystoreForFolder(
    folderUrl: string,
    encryptionKey: string
  ): Promise<string> {
    const keystoreUrl = folderUrl + '.keystore';
    const storage =
      this.keystoreStorageService.createSecureStorage(encryptionKey);
    const keystore: Keystore = new FolderKeystore(
      keystoreUrl,
      folderUrl,
      storage
    );
    const keys = await this.keystoreService.getKeysInFolder(folderUrl);
    await keystore.addKeys(keys);
    await this.keystoreService.addKeystore(keystore);
    return keystoreUrl;
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
    await this.permissionService.setResourcePublicPermissions(folderUrl, {});
  }

  /**
   * Creates a secret group file, which is publicly readable and appendable
   * @returns groupUrl
   */
  async createNewRandomGroup(): Promise<string> {
    const groupFileUrl = await this.generateSecretGroupFileUrl();
    await this.fileService.writeFile(
      new Blob([], { type: 'text/turtle' }),
      groupFileUrl
    );
    await this.permissionService.setResourcePublicPermissions(groupFileUrl, {
      read: true,
      append: true,
    });
    return `${groupFileUrl}#sharing-group`;
  }

  async generateSecretGroupFileUrl(): Promise<string> {
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

    await this.authService.authenticatedFetch(groupUrl, {
      method: 'PATCH',
      headers: {
        'content-type': 'text/n3',
      },
      body: n3Patch,
    });
  }

  async getGroupsFolderUrl() {
    const podUrls = await this.profileService.getPodUrls();
    return podUrls[0] + this.groupsFolderPath;
  }

  private toSharingLink(data: Record<string, string>): string {
    const urlParams = new URLSearchParams(data);
    return `${window.location.origin}/share?${urlParams.toString()}`;
  }
}
