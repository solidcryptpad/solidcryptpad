import { Injectable } from '@angular/core';
import {
  AclDataset,
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
  WithAccessibleAcl,
  WithServerResourceInfo,
} from '@inrupt/solid-client';
import { SolidAuthenticationService } from '../authentication/solid-authentication.service';
import { PermissionException } from 'src/app/exceptions/permission-exception';

export interface SolidPermissions {
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
export class SolidPermissionService {
  constructor(private authService: SolidAuthenticationService) {}

  /**
   * Sets the permissions of a group for a specific resource
   * @param resourceUrl target file or folder
   * @param groupUrl group for which the permissions are set
   * @param grantedPermissions new permissions of the group
   */
  async setGroupResourcePermissions(
    resourceUrl: string,
    groupUrl: string,
    grantedPermissions: Partial<SolidPermissions>
  ) {
    await this.updateAcl(resourceUrl, (acl) =>
      setGroupResourceAccess(
        acl,
        groupUrl,
        this.extendWithFalsePermissions(grantedPermissions)
      )
    );
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
    grantedPermissions: Partial<SolidPermissions>
  ) {
    await this.updateAcl(folderUrl, (acl) =>
      setGroupDefaultAccess(
        acl,
        groupUrl,
        this.extendWithFalsePermissions(grantedPermissions)
      )
    );
  }

  async setResourcePublicPermissions(
    url: string,
    grantedPermissions: Partial<SolidPermissions>
  ): Promise<void> {
    await this.updateAcl(url, (acl) =>
      setPublicResourceAccess(
        acl,
        this.extendWithFalsePermissions(grantedPermissions)
      )
    );
  }

  /**
   * Fetches the acl, updates the acl with the callback, and saves the new acl
   */
  private async updateAcl(
    resourceUrl: string,
    callback: (acl: AclDataset) => AclDataset
  ) {
    const [resourceAcl, myFileWithAcl] = await this.getResourceOrFallbackAcl(
      resourceUrl
    );
    const updatedAcl = callback(resourceAcl);
    await this.saveAcl(myFileWithAcl, updatedAcl);
  }

  /**
   * Returns the acl of the resource, and the resource itself.
   * If the resource does not have an acl then it returns one based on the fallback acl.
   */
  async getResourceOrFallbackAcl(resourceUrl: string) {
    const resourceWithAcl = await getFileWithAcl(resourceUrl, {
      fetch: this.authService.authenticatedFetch.bind(this.authService),
    });

    if (hasResourceAcl(resourceWithAcl)) {
      return [getResourceAcl(resourceWithAcl), resourceWithAcl] as const;
    } else {
      if (!hasAccessibleAcl(resourceWithAcl)) {
        throw new Error('Acl file is inaccessible');
      }
      if (!hasFallbackAcl(resourceWithAcl)) {
        throw new Error('Current user does not have permission to load acl');
      }
      return [
        createAclFromFallbackAcl(resourceWithAcl),
        resourceWithAcl,
      ] as const;
    }
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

  async hasWritePermissions(resourceUrl: string): Promise<boolean> {
    const response = await this.authService.authenticatedFetch(resourceUrl, {
      method: 'HEAD',
    });
    const permissionString = response.headers.get('wac-allow');

    if (permissionString) {
      return permissionString.split(',')[0].includes('write');
    }

    return false;
  }

  private async saveAcl(
    itemWithAcl: WithAccessibleAcl<WithServerResourceInfo>,
    acl: AclDataset
  ) {
    await saveAclFor(itemWithAcl, acl, {
      fetch: this.authService.authenticatedFetch.bind(this.authService),
    });
  }

  /**
   * Takes a subset of permissions, and sets all other permissions to false
   */
  private extendWithFalsePermissions(
    permissions: Partial<SolidPermissions>
  ): SolidPermissions {
    return {
      ...noPermissions,
      ...permissions,
    };
  }
}
