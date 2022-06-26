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

  private readonly groupsFolderPath = 'solidcryptpad-data/groups/';
  private readonly keystoreFolderPath = 'solidcryptpad-data/keystores/';

  /**
   * Creates a share link for the given file with the given permissons.
   * Access is granted by adding the recipient to a group
   * which has permissions to view the file.
   * @param fileUrl path to the file
   * @param grantedPermissions set of permissions for the file
   */
  public async createFileSharingLink(
    fileUrl: string,
    grantedPermissions: Partial<SolidPermissions>
  ): Promise<string> {
    const linksKeystore = await this.keystoreService.getLinksKeystore();
    const key = await this.keystoreService.getKey(fileUrl);
    const encodedKey = btoa(key);

    await this.ensureGroupsFolderExists();
    const groupUrl = await this.createNewRandomGroup();

    await this.permissionService.setGroupPermissions(
      fileUrl,
      groupUrl,
      grantedPermissions
    );

    const link = this.toSharingLink({
      file: fileUrl,
      key: encodedKey,
      group: groupUrl,
    });
    await linksKeystore.addKey(
      JSON.stringify({ object: fileUrl, url: link, type: 'Link' }),
      ''
    );
    return link;
  }

  /**
   * Creates a share link for the given folder with the given permissions.
   */
  public async createFolderSharingLink(
    folderURL: string,
    grantedPermissions: Partial<SolidPermissions>
  ): Promise<string> {
    const encryptionKey = this.encryptionService.generateNewKey();
    const groupUrl = await this.createNewRandomGroup();

    const keystoreUrl = await this.setupKeystoreForFolder(
      folderURL,
      encryptionKey,
      groupUrl
    );

    const linksKeystore = await this.keystoreService.getLinksKeystore();

    await this.ensureGroupsFolderExists();

    // give access to the folder and all items in it without an acl file
    await this.permissionService.setGroupDefaultPermissions(
      folderURL,
      groupUrl,
      grantedPermissions
    );
    await this.permissionService.setGroupPermissions(
      folderURL,
      groupUrl,
      grantedPermissions
    );

    // give access to all items in the folder which already have their own acl file
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
          await this.permissionService.setGroupPermissions(
            resourceUrl,
            groupUrl,
            grantedPermissions
          );
        }
      }
    );

    const link = this.toSharingLink({
      folder: folderURL,
      group: groupUrl,
      keystore: keystoreUrl,
      keystoreEncryptionKey: encryptionKey,
    });

    await linksKeystore.addKey(
      JSON.stringify({ object: folderURL, url: link, type: 'Folder' }),
      ''
    );
    return link;
  }

  private async setupKeystoreForFolder(
    folderUrl: string,
    encryptionKey: string,
    groupUrl: string
  ): Promise<string> {
    const keystoreUrl =
      (await this.profileService.getPodUrls())[0] +
      this.keystoreFolderPath +
      this.encryptionService.SHA256Salted(folderUrl) +
      '.keystore';

    console.log(keystoreUrl);
    // assume that it already is known and contains keys if it already exists
    if (await this.fileService.resourceExists(keystoreUrl)) {
      return keystoreUrl;
    }
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
    await this.permissionService.setGroupPermissions(keystoreUrl, groupUrl, {
      read: true,
      write: false,
      append: false,
    });
    return keystoreUrl;
  }

  /**
   * Creates groups folder with appropriate permissions if it does not exist
   */
  async ensureGroupsFolderExists() {
    const groupsFolderUrl = await this.getGroupsFolderUrl();
    if (!(await this.fileService.resourceExists(groupsFolderUrl))) {
      await this.createSecretFolder(groupsFolderUrl);
    }
  }

  /**
   * Create a folder where only the creator has access
   */
  async createSecretFolder(folderUrl: string) {
    await this.fileService.writeContainer(folderUrl);
    // TODO: consider creating ACL from scratch, to prevent inheriting bad defaults
    await this.permissionService.setPublicPermissions(folderUrl, {});
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
    await this.permissionService.setPublicPermissions(groupFileUrl, {
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
