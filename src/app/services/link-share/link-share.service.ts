import { Injectable } from '@angular/core';
import { KeystoreService } from '../encryption/keystore/keystore.service';
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
import { SolidGroupService } from '../solid-group/solid-group.service';

@Injectable({
  providedIn: 'root',
})
export class LinkShareService {
  private readonly keystoreFolderPath = 'solidcryptpad-data/keystores/';

  constructor(
    private keystoreService: KeystoreService,
    private keystoreStorageService: KeystoreStorageService,
    private encryptionService: EncryptionService,
    private fileService: SolidFileHandlerService,
    private groupService: SolidGroupService,
    private profileService: ProfileService,
    private permissionService: SolidPermissionService
  ) {}

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

    const groupUrl = await this.createSecretAppendableGroup();

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
    folderUrl: string,
    grantedPermissions: Partial<SolidPermissions>
  ): Promise<string> {
    const encryptionKey = this.encryptionService.generateNewKey();
    const groupUrl = await this.createSecretAppendableGroup();

    const keystoreUrl = await this.setupKeystoreForFolder(
      folderUrl,
      encryptionKey,
      groupUrl
    );

    const linksKeystore = await this.keystoreService.getLinksKeystore();

    // give access to the folder and all items in it
    await this.permissionService.setGroupPermissions(
      folderUrl,
      groupUrl,
      grantedPermissions
    );
    await this.permissionService.setGroupPermissionsForContainedResources(
      folderUrl,
      groupUrl,
      grantedPermissions
    );

    const link = this.toSharingLink({
      folder: folderUrl,
      group: groupUrl,
      keystore: keystoreUrl,
      keystoreEncryptionKey: encryptionKey,
    });

    await linksKeystore.addKey(
      JSON.stringify({ object: folderUrl, url: link, type: 'Folder' }),
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
      // TODO: currently there's a mismatch between the key and url if we return this
      // because the caller will expect it to be encrypted with the encryptionKey parameter
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

  private async createSecretAppendableGroup(): Promise<string> {
    const groupFileUrl = await this.groupService.createNewRandomGroup();
    await this.permissionService.setPublicPermissions(groupFileUrl, {
      read: true,
      append: true,
    });
    return groupFileUrl;
  }

  private toSharingLink(data: Record<string, string>): string {
    const urlParams = new URLSearchParams(data);
    return `${window.location.origin}/share?${urlParams.toString()}`;
  }
}
