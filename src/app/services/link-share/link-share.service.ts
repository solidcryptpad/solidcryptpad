import { Injectable } from '@angular/core';
import { SolidFileHandlerService } from '../file-handler/solid-file-handler.service';
import {
  SolidPermissionService,
  SolidPermissions,
} from '../solid-permission/solid-permission.service';
import { SolidGroupService } from '../solid-group/solid-group.service';
import { SharedByMeService } from '../shared-by-me/shared-by-me.service';
import { KeyService } from '../encryption/key/key.service';
import { NavigationService } from '../navigation/navigation.service';

@Injectable({
  providedIn: 'root',
})
export class LinkShareService {
  constructor(
    private keyService: KeyService,
    private fileService: SolidFileHandlerService,
    private groupService: SolidGroupService,
    private permissionService: SolidPermissionService,
    private sharedByMeService: SharedByMeService,
    private navigationService: NavigationService
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
    const key = await this.keyService.getKey(fileUrl);
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

    const fileName = fileUrl.substring(fileUrl.lastIndexOf('/') + 1);
    await this.sharedByMeService.addLink(fileName, link);

    return link;
  }

  /**
   * Creates a share link for the given folder with the given permissions.
   */
  public async createFolderSharingLink(
    folderUrl: string,
    grantedPermissions: Partial<SolidPermissions>
  ): Promise<string> {
    const groupUrl = await this.createSecretAppendableGroup();

    const { keystoreUrl, encryptionKey } = await this.setupKeystoreForFolder(
      folderUrl,
      groupUrl,
      grantedPermissions.write || false
    );

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

    const folderName = folderUrl.split('/')[folderUrl.split('/').length - 2];
    await this.sharedByMeService.addLink(folderName, link);

    return link;
  }

  private async setupKeystoreForFolder(
    folderUrl: string,
    groupUrl: string,
    hasWritePermissions: boolean
  ): Promise<{ keystoreUrl: string; encryptionKey: string }> {
    const { keystoreUrl, encryptionKey } =
      await this.keyService.getOrCreateFolderKeystore(folderUrl);
    await this.permissionService.setGroupPermissions(keystoreUrl, groupUrl, {
      read: true,
      write: hasWritePermissions,
    });
    return { keystoreUrl, encryptionKey };
  }

  private async createSecretAppendableGroup(): Promise<string> {
    // we use a random group file, so nobody can read it without knowing the file name
    // it must have read permissions, so the server itself is allowed to read it for checking ACL permissions
    const groupFileUrl = await this.groupService.createNewRandomGroup();
    await this.permissionService.setPublicPermissions(groupFileUrl, {
      read: true,
      append: true,
    });
    return groupFileUrl;
  }

  private toSharingLink(data: Record<string, string>): string {
    const urlParams = new URLSearchParams(data);
    return `${this.navigationService.getAppRoot()}share?${urlParams.toString()}`;
  }

  async deactivateLink(link: string) {
    // first delete group to make sure we still show the link in case deletion goes wrong
    const groupUrl = new URLSearchParams(link).get('group') as string;
    await this.fileService.deleteFile(groupUrl);
    await this.sharedByMeService.removeLink(link);
  }
}
