import { TestBed } from '@angular/core/testing';
import { PermissionException } from 'src/app/exceptions/permission-exception';
import { SolidAuthenticationService } from '../authentication/solid-authentication.service';
import { SolidFileHandlerService } from '../file-handler/solid-file-handler.service';
import { SolidClientService } from '../module-wrappers/solid-client/solid-client.service';

import { SolidPermissionService } from './solid-permission.service';

describe('SolidPermissionService', () => {
  let service: SolidPermissionService;
  let authenticationServiceSpy: jasmine.SpyObj<SolidAuthenticationService>;
  let solidClientServiceSpy: jasmine.SpyObj<SolidClientService>;
  let fileServiceSpy: jasmine.SpyObj<SolidFileHandlerService>;

  // values where we only check how they are forward to other calls
  // hence we don't care about the values
  const placeholderAcl: any = 'mocked acl';
  const placeholderFallbackAcl: any = 'mocked fallback acl';
  const placeholderUpdatedAcl: any = 'mocked updated acl';
  const placeholderResourceInfo: any = 'mocked resource info';
  const returnPlacholdersWhenGettingAcl = () =>
    spyOn<any>(service, 'getResourceOrFallbackAcl').and.resolveTo({
      resourceAcl: placeholderAcl,
      resourceInfo: placeholderResourceInfo,
    });

  const sampleFolderUrl = 'https://example.com/folder/';
  const sampleFileUrl = 'https://example.com/folder/file.txt';
  const sampleGroupUrl = 'https://example.com/groups/group.ttl#some-group-id';
  const samplePartialPermissions = Object.freeze({ read: true, write: false });
  const sampleExtendedPermissions = Object.freeze({
    read: true,
    write: false,
    append: false,
    control: false,
  });

  beforeEach(() => {
    const authenticationSpy = jasmine.createSpyObj(
      'SolidAuthenticationService',
      ['authenticatedFetch']
    );

    const solidClientSpy = jasmine.createSpyObj('SolidClientService', [
      'setGroupResourceAccess',
      'setGroupDefaultAccess',
      'setPublicResourceAccess',
      'getResourceInfoWithAcl',
      'getResourceAcl',
      'hasResourceAcl',
      'hasAccessibleAcl',
      'hasFallbackAcl',
      'createAclFromFallbackAcl',
      'saveAclFor',
    ]);

    const fileSpy = jasmine.createSpyObj('SolidFileHandlerService', [
      'isContainer',
      'traverseContainerContentsRecursively',
    ]);

    TestBed.configureTestingModule({
      providers: [
        { provide: SolidAuthenticationService, useValue: authenticationSpy },
        { provide: SolidClientService, useValue: solidClientSpy },
        { provide: SolidFileHandlerService, useValue: fileSpy },
      ],
    });
    service = TestBed.inject(SolidPermissionService);
    authenticationServiceSpy = TestBed.inject(
      SolidAuthenticationService
    ) as jasmine.SpyObj<SolidAuthenticationService>;
    solidClientServiceSpy = TestBed.inject(
      SolidClientService
    ) as jasmine.SpyObj<SolidClientService>;
    fileServiceSpy = TestBed.inject(
      SolidFileHandlerService
    ) as jasmine.SpyObj<SolidFileHandlerService>;
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('setGroupPermissions updates acl by calling setGroupResourceAccess and saving the acl', async () => {
    returnPlacholdersWhenGettingAcl();
    solidClientServiceSpy.setGroupResourceAccess.and.returnValue(
      placeholderUpdatedAcl
    );
    const saveAclSpy = spyOn<any>(service, 'saveAcl').and.resolveTo();

    await service.setGroupPermissions(
      sampleFileUrl,
      sampleGroupUrl,
      samplePartialPermissions
    );

    expect(solidClientServiceSpy.setGroupResourceAccess).toHaveBeenCalledWith(
      placeholderAcl,
      sampleGroupUrl,
      sampleExtendedPermissions
    );
    expect(saveAclSpy).toHaveBeenCalledWith(
      placeholderResourceInfo,
      placeholderUpdatedAcl
    );
  });

  it('setGroupDefaultPermissions updates acl by calling setGroupDefaultAccess and saving the acl', async () => {
    returnPlacholdersWhenGettingAcl();
    solidClientServiceSpy.setGroupDefaultAccess.and.returnValue(
      placeholderUpdatedAcl
    );
    const saveAclSpy = spyOn<any>(service, 'saveAcl').and.resolveTo();

    await service.setGroupDefaultPermissions(
      sampleFileUrl,
      sampleGroupUrl,
      samplePartialPermissions
    );

    expect(solidClientServiceSpy.setGroupDefaultAccess).toHaveBeenCalledWith(
      placeholderAcl,
      sampleGroupUrl,
      sampleExtendedPermissions
    );
    expect(saveAclSpy).toHaveBeenCalledWith(
      placeholderResourceInfo,
      placeholderUpdatedAcl
    );
  });

  it('setPublicPermissions updates acl by calling setPublicResourceAccess and saving the acl', async () => {
    returnPlacholdersWhenGettingAcl();
    solidClientServiceSpy.setPublicResourceAccess.and.returnValue(
      placeholderUpdatedAcl
    );
    const saveAclSpy = spyOn<any>(service, 'saveAcl').and.resolveTo();

    await service.setPublicPermissions(sampleFileUrl, samplePartialPermissions);

    expect(solidClientServiceSpy.setPublicResourceAccess).toHaveBeenCalledWith(
      placeholderAcl,
      sampleExtendedPermissions
    );
    expect(saveAclSpy).toHaveBeenCalledWith(
      placeholderResourceInfo,
      placeholderUpdatedAcl
    );
  });

  it('getResourceOrFallbackAcl returns acl and resource info if resource has own acl file', async () => {
    solidClientServiceSpy.getResourceInfoWithAcl.and.resolveTo(
      placeholderResourceInfo
    );
    solidClientServiceSpy.getResourceAcl.and.returnValue(placeholderAcl);
    solidClientServiceSpy.hasResourceAcl.and.returnValue(true);

    const { resourceAcl, resourceInfo } = await service[
      'getResourceOrFallbackAcl'
    ](sampleFileUrl);

    expect(resourceAcl).toEqual(placeholderAcl);
    expect(resourceInfo).toEqual(placeholderResourceInfo);
  });

  it('getResourceOrFallbackAcl returns fallback acl and resource info if resource has no acl', async () => {
    solidClientServiceSpy.getResourceInfoWithAcl.and.resolveTo(
      placeholderResourceInfo
    );
    solidClientServiceSpy.hasResourceAcl.and.returnValue(false);
    solidClientServiceSpy.hasAccessibleAcl.and.returnValue(true);
    solidClientServiceSpy.hasFallbackAcl.and.returnValue(true);
    solidClientServiceSpy.createAclFromFallbackAcl.and.returnValue(
      placeholderFallbackAcl
    );

    const { resourceAcl, resourceInfo } = await service[
      'getResourceOrFallbackAcl'
    ](sampleFileUrl);

    expect(resourceAcl).toEqual(placeholderFallbackAcl);
    expect(resourceInfo).toEqual(placeholderResourceInfo);
  });

  it('getResourceOrFallbackAcl throws permission exception if no access to resource acl', async () => {
    solidClientServiceSpy.getResourceInfoWithAcl.and.resolveTo(
      placeholderResourceInfo
    );
    solidClientServiceSpy.hasResourceAcl.and.returnValue(false);
    solidClientServiceSpy.hasAccessibleAcl.and.returnValue(false);

    await expectAsync(
      service['getResourceOrFallbackAcl'](sampleFileUrl)
    ).toBeRejectedWithError(PermissionException);
  });

  it('getResourceOrFallbackAcl throws permission exception if no access to fallback acl', async () => {
    solidClientServiceSpy.getResourceInfoWithAcl.and.resolveTo(
      placeholderResourceInfo
    );
    solidClientServiceSpy.hasResourceAcl.and.returnValue(false);
    solidClientServiceSpy.hasAccessibleAcl.and.returnValue(true);
    solidClientServiceSpy.hasFallbackAcl.and.returnValue(false);

    await expectAsync(
      service['getResourceOrFallbackAcl'](sampleFileUrl)
    ).toBeRejectedWithError(PermissionException);
  });

  it('hasAcl returns true for a resource with an own acl file', async () => {
    solidClientServiceSpy.getResourceInfoWithAcl.and.resolveTo(
      placeholderResourceInfo
    );
    solidClientServiceSpy.hasResourceAcl.and.returnValue(true);
    solidClientServiceSpy.hasAccessibleAcl.and.returnValue(true);

    const hasAcl = await service.hasAcl(sampleFileUrl);

    expect(hasAcl).toBeTrue();
  });

  it('hasAcl returns false for a resource with no own acl file', async () => {
    solidClientServiceSpy.getResourceInfoWithAcl.and.resolveTo(
      placeholderResourceInfo
    );
    solidClientServiceSpy.hasResourceAcl.and.returnValue(false);
    solidClientServiceSpy.hasAccessibleAcl.and.returnValue(true);

    const hasAcl = await service.hasAcl(sampleFileUrl);

    expect(hasAcl).toBeFalse();
  });

  it('hasAcl throws permission exception if no access to resource acl', async () => {
    solidClientServiceSpy.getResourceInfoWithAcl.and.resolveTo(
      placeholderResourceInfo
    );
    solidClientServiceSpy.hasAccessibleAcl.and.returnValue(false);

    await expectAsync(service.hasAcl(sampleFileUrl)).toBeRejectedWithError(
      PermissionException
    );
  });

  it('hasWritePermissions returns true if the wac-allow header shows write permissions', async () => {
    const headers = {
      'wac-allow': `user="read write append control",public="read"`,
    };
    authenticationServiceSpy.authenticatedFetch.and.resolveTo(
      new Response(undefined, { headers })
    );

    const hasPermissions = await service.hasWritePermissions(sampleFileUrl);

    expect(hasPermissions).toBeTrue();
  });

  it('hasWritePermissions returns false if the wac-allow header does not show write permissions', async () => {
    const headers = {
      'wac-allow': `user="read append",public="read"`,
    };
    authenticationServiceSpy.authenticatedFetch.and.resolveTo(
      new Response(undefined, { headers })
    );

    const hasPermissions = await service.hasWritePermissions(sampleFileUrl);

    expect(hasPermissions).toBeFalse();
  });
  it('hasWritePermissions returns false if wac-allow header is not included', async () => {
    const headers = {};
    authenticationServiceSpy.authenticatedFetch.and.resolveTo(
      new Response(undefined, { headers })
    );

    const hasPermissions = await service.hasWritePermissions(sampleFileUrl);

    expect(hasPermissions).toBeFalse();
  });

  it('saveAcl calls saveAclFor with resource info and acl', async () => {
    solidClientServiceSpy.saveAclFor.and.resolveTo();

    await service['saveAcl'](placeholderResourceInfo, placeholderAcl);

    expect(solidClientServiceSpy.saveAclFor).toHaveBeenCalledWith(
      placeholderResourceInfo,
      placeholderAcl,
      jasmine.anything()
    );
  });

  it('setGroupPermissionsForContainedResources sets default permissions of container', async () => {
    const setDefaultPermissionsSpy = spyOn(
      service,
      'setGroupDefaultPermissions'
    );
    setDefaultPermissionsSpy.and.resolveTo();
    fileServiceSpy.traverseContainerContentsRecursively.and.resolveTo();

    await service.setGroupPermissionsForContainedResources(
      sampleFolderUrl,
      sampleGroupUrl,
      samplePartialPermissions
    );

    expect(setDefaultPermissionsSpy).toHaveBeenCalledWith(
      sampleFolderUrl,
      sampleGroupUrl,
      samplePartialPermissions
    );
  });

  it('setGroupPermissionsForContainedResources updates contained resources that have an ACL', async () => {
    const setDefaultPermissionsSpy = spyOn(
      service,
      'setGroupDefaultPermissions'
    );
    setDefaultPermissionsSpy.and.resolveTo();
    const setGroupPermissionsSpy = spyOn(service, 'setGroupPermissions');
    setGroupPermissionsSpy.and.resolveTo();
    fileServiceSpy.traverseContainerContentsRecursively.and.resolveTo();
    fileServiceSpy.isContainer.and.callFake((url) => url.endsWith('/'));
    const folderWithAcl = 'https://example.org/with/acl/folder/';
    const fileWithAcl = 'https://example.org/with/acl/file.txt';
    const fileWithoutAcl = 'https://example.org/without/acl/file.txt';
    spyOn(service, 'hasAcl')
      .withArgs(folderWithAcl)
      .and.resolveTo(true)
      .withArgs(fileWithAcl)
      .and.resolveTo(true)
      .withArgs(fileWithoutAcl)
      .and.resolveTo(false);

    await service.setGroupPermissionsForContainedResources(
      sampleFolderUrl,
      sampleGroupUrl,
      samplePartialPermissions
    );
    const callback =
      fileServiceSpy.traverseContainerContentsRecursively.calls.first().args[1];

    await callback(folderWithAcl);
    await callback(fileWithAcl);
    await callback(fileWithoutAcl);

    expect(setDefaultPermissionsSpy.calls.all()[0].args[0]).toBe(
      sampleFolderUrl
    );
    expect(setDefaultPermissionsSpy.calls.all()[1].args[0]).toBe(folderWithAcl);
    expect(setDefaultPermissionsSpy).toHaveBeenCalledTimes(2);

    expect(setGroupPermissionsSpy.calls.all()[0].args[0]).toBe(folderWithAcl);
    expect(setGroupPermissionsSpy.calls.all()[1].args[0]).toBe(fileWithAcl);
    expect(setGroupPermissionsSpy).toHaveBeenCalledTimes(2);
  });
});
