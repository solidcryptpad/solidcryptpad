import { Injectable } from '@angular/core';
import {
  AclDataset,
  WithAccessibleAcl,
  WithServerResourceInfo,
} from '@inrupt/solid-client';
import { SolidAuthenticationService } from '../authentication/solid-authentication.service';
import { PermissionException } from 'src/app/exceptions/permission-exception';
import { SolidClientService } from '../module-wrappers/solid-client/solid-client.service';
import { throwWithContext } from 'src/app/exceptions/error-options';
import { SolidFileHandlerService } from '../file-handler/solid-file-handler.service';

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
  constructor(
    private solidClient: SolidClientService,
    private fileService: SolidFileHandlerService,
    private authService: SolidAuthenticationService
  ) {}

  /**
   * Sets the permissions of a group for a specific resource
   * @param resourceUrl target file or folder
   * @param groupUrl group for which the permissions are set
   * @param grantedPermissions new permissions of the group
   */
  async setGroupPermissions(
    resourceUrl: string,
    groupUrl: string,
    grantedPermissions: Partial<SolidPermissions>
  ) {
    await this.updateAcl(resourceUrl, (acl) =>
      this.solidClient.setGroupResourceAccess(
        acl,
        groupUrl,
        this.extendWithFalsePermissions(grantedPermissions)
      )
    );
  }

  /**
   * Set default group permissions for all contained resources without an own ACL file
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
      this.solidClient.setGroupDefaultAccess(
        acl,
        groupUrl,
        this.extendWithFalsePermissions(grantedPermissions)
      )
    );
  }

  /**
   * Set group permissions for all contained resources
   * @param folderUrl
   * @param groupUrl
   * @param grantedPermissions new permissions of this group. Default to false for unspecified values
   */
  async setGroupPermissionsForContainedResources(
    folderUrl: string,
    groupUrl: string,
    grantedPermissions: Partial<SolidPermissions>
  ) {
    await this.setGroupDefaultPermissions(
      folderUrl,
      groupUrl,
      grantedPermissions
    );
    await this.fileService.traverseContainerContentsRecursively(
      folderUrl,
      async (resourceUrl) => {
        if (await this.hasAcl(resourceUrl)) {
          if (this.fileService.isContainer(resourceUrl))
            await this.setGroupDefaultPermissions(
              resourceUrl,
              groupUrl,
              grantedPermissions
            );
          await this.setGroupPermissions(
            resourceUrl,
            groupUrl,
            grantedPermissions
          );
        }
      }
    );
  }

  /**
   * Set the permissions everyone has for a file or folder
   */
  async setPublicPermissions(
    resourceUrl: string,
    grantedPermissions: Partial<SolidPermissions>
  ): Promise<void> {
    await this.updateAcl(resourceUrl, (acl) =>
      this.solidClient.setPublicResourceAccess(
        acl,
        this.extendWithFalsePermissions(grantedPermissions)
      )
    );
  }

  /**
   * Fetch the acl, update the acl with the callback, and save the new acl
   */
  private async updateAcl(
    resourceUrl: string,
    callback: (acl: AclDataset) => AclDataset
  ) {
    const { resourceAcl, resourceInfo } = await this.getResourceOrFallbackAcl(
      resourceUrl
    );
    const updatedAcl = callback(resourceAcl);
    await this.saveAcl(resourceInfo, updatedAcl).catch(
      throwWithContext(`Could not update permissions of ${resourceUrl}`)
    );
  }

  /**
   * Return the acl of the resource, and the info about the resource itself.
   * If the resource does not have an acl then it returns one based on the fallback acl.
   */
  private async getResourceOrFallbackAcl(
    resourceUrl: string
  ): Promise<{ resourceAcl: AclDataset; resourceInfo: WithAccessibleAcl }> {
    const resourceWithAcl = await this.solidClient.getResourceInfoWithAcl(
      resourceUrl,
      {
        fetch: this.authService.authenticatedFetch.bind(this.authService),
      }
    );

    if (this.solidClient.hasResourceAcl(resourceWithAcl)) {
      return {
        resourceAcl: this.solidClient.getResourceAcl(resourceWithAcl),
        resourceInfo: resourceWithAcl,
      };
    } else {
      if (!this.solidClient.hasAccessibleAcl(resourceWithAcl)) {
        throw new PermissionException(
          `You don't have permission to change access rights of ${resourceUrl}`
        );
      }
      if (!this.solidClient.hasFallbackAcl(resourceWithAcl)) {
        throw new PermissionException(
          `You don't have permission to see the access rights of ${resourceUrl}`
        );
      }
      return {
        resourceAcl: this.solidClient.createAclFromFallbackAcl(resourceWithAcl),
        resourceInfo: resourceWithAcl,
      };
    }
  }

  /**
   * Return true if the resource has its own acl file
   *
   * @throws PermissionException if the current user has no control access
   */
  async hasAcl(resourceUrl: string): Promise<boolean> {
    const resourceWithAcl = await this.solidClient.getResourceInfoWithAcl(
      resourceUrl,
      {
        fetch: this.authService.authenticatedFetch.bind(this.authService),
      }
    );

    if (!this.solidClient.hasAccessibleAcl(resourceWithAcl))
      throw new PermissionException(
        `You don't seem to have control access to ${resourceUrl}`
      );
    return this.solidClient.hasResourceAcl(resourceWithAcl);
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
    resourceInfo: WithAccessibleAcl<WithServerResourceInfo>,
    acl: AclDataset
  ) {
    await this.solidClient.saveAclFor(resourceInfo, acl, {
      fetch: this.authService.authenticatedFetch.bind(this.authService),
    });
  }

  /**
   * Take a subset of permissions, and set all other permissions to false
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
