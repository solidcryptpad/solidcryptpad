import { Injectable } from '@angular/core';
import {
  FetchError,
  SolidDataset,
  UrlString,
  WithServerResourceInfo,
} from '@inrupt/solid-client';
import { AlreadyExistsException } from 'src/app/exceptions/already-exists-exception';
import { InvalidUrlException } from 'src/app/exceptions/invalid-url-exception';
import { PermissionException } from 'src/app/exceptions/permission-exception';
import { UnknownException } from 'src/app/exceptions/unknown-exception';
import { BaseException } from 'src/app/exceptions/base-exception';
import { SolidClientService } from '../module-wrappers/solid-client/solid-client.service';
import { NotFoundException } from 'src/app/exceptions/not-found-exception';
import * as mime from 'mime';
import { SolidAuthenticationService } from '../authentication/solid-authentication.service';
import { throwWithContext } from 'src/app/exceptions/error-options';
import { SolidPodException } from 'src/app/exceptions/solid-pod-exception';

@Injectable({
  providedIn: 'root',
})
export class SolidFileHandlerService {
  constructor(
    private solidClientService: SolidClientService,
    private authService: SolidAuthenticationService
  ) {}

  /**
   * reads a file saved at the url
   *
   * @param fileURL the url to read from
   * @returns a promise for the file as a blob
   * @throws InvalidUrlException if the given url is not considered valid
   * @throws PermissionException if the given url cannot be written to
   * @throws UnknownException on all errors that are not explicitly caught
   * @throws NotFoundException if the given file was not found
   */
  async readFile(fileURL: string): Promise<Blob> {
    try {
      return await this.solidClientService.getFile(fileURL, {
        fetch: this.authService.authenticatedFetch.bind(this.authService),
      });
    } catch (error: any) {
      this.convertError(error);
    }
  }

  /**
   * writes a file to an url
   * if the file already exists then it is overwritten
   * if the file does not exist then a new one is created
   *
   * @param file the file being written
   * @param fileURL the url to write to
   * @returns a promise for the saved file
   * @throws InvalidUrlException if the given url is not considered valid
   * @throws PermissionException if the given url cannot be written to cause of missing permissions
   * @throws UnknownException on all errors that are not explicitly caught
   * @throws AlreadyExistsException if the file cannot be overwritten
   */
  async writeFile(file: Blob, fileURL: string): Promise<Blob> {
    fileURL = fileURL.replace(/ /g, '');

    try {
      return await this.solidClientService.overwriteFile(fileURL, file, {
        contentType: file.type || 'text/plain',
        fetch: this.authService.authenticatedFetch.bind(this.authService),
      });
    } catch (error: any) {
      this.convertError(error);
    }
  }

  /**
   * creates the folder at the given url
   * if a folder/file already exists then it is overwritten
   * if the folder does not exist then a new one is created
   *
   * @param containerURL the url the container should be created
   * @returns a promise with a soliddataset of the container
   * @throws InvalidUrlException if the given url is not considered valid
   * @throws PermissionException if the given url cannot be written to cause of missing permissions
   * @throws UnknownException on all errors that are not explicitly caught
   * @throws AlreadyExistsException if the file cannot be overwritten
   */
  async writeContainer(
    containerURL: string
  ): Promise<SolidDataset & WithServerResourceInfo> {
    containerURL = containerURL.replace(/ /g, '');

    if (!this.isContainer(containerURL)) {
      containerURL = containerURL + '/';
    }

    try {
      return await this.solidClientService.createContainerAt(containerURL, {
        fetch: this.authService.authenticatedFetch.bind(this.authService),
      });
    } catch (error: any) {
      this.convertError(error);
    }
  }

  /**
   * gets a container from the url
   * @param containerURL the url to the container
   * @returns the container
   */
  async getContainer(
    containerURL: string
  ): Promise<SolidDataset & WithServerResourceInfo> {
    return this.solidClientService
      .getSolidDataset(containerURL, {
        fetch: this.authService.authenticatedFetch.bind(this.authService),
      })
      .catch((err: any) => this.convertError(err));
  }

  async resourceExists(resourceUrl: string): Promise<boolean> {
    const response = await this.authService.authenticatedFetch(resourceUrl, {
      method: 'HEAD',
    });
    if (response.status === 404) return false;
    if (response.ok === false) {
      throw this.convertError(
        new FetchError(
          `Could not check if ${resourceUrl} exists`,
          response as Response & { ok: false }
        )
      );
    }
    return true;
  }

  /**
   * creates the container if it does not exist
   * @returns true if the folder has been created
   */
  async ensureContainerExists(containerUrl: string): Promise<boolean> {
    if (!(await this.resourceExists(containerUrl))) {
      await this.writeContainer(containerUrl).catch(
        throwWithContext(`Could not create directory ${containerUrl}`)
      );
      return true;
    }
    return false;
  }

  /**
   * gets a list of files that are contained in the folder
   * @param containerURL the link to the folder
   * @returns a list of urls of the objects in the directory
   */
  async getContainerContent(containerURL: string): Promise<UrlString[]> {
    try {
      const container = await this.getContainer(containerURL);
      return this.solidClientService.getContainedResourceUrlAll(container);
    } catch (error: any) {
      this.convertError(error);
    }
  }

  /**
   * checks if the url is a folder
   * @param containerURL the url to the container
   * @returns if the file is a container or not
   */
  isContainer(containerURL: string): boolean {
    return this.solidClientService.isContainer(containerURL);
  }

  /**
   * guess content type based on file extension
   * @param url url or file name with file extension
   * @returns
   */
  guessContentType(url: string): string | null {
    return mime.getType(url);
  }

  /**
   * deletes the folder at the url
   * @param url url of folder to delete
   */
  async deleteFolder(url: string): Promise<void> {
    try {
      const content = await this.getContainerContent(url);

      for (const i of content) {
        if (this.isContainer(i)) {
          await this.deleteFolder(i);
        } else {
          await this.deleteFile(i);
        }
      }

      await this.solidClientService.deleteContainer(url, {
        fetch: this.authService.authenticatedFetch.bind(this.authService),
      });
    } catch (error: any) {
      this.convertError(error);
    }
  }

  async deleteFile(url: string): Promise<void> {
    try {
      await this.solidClientService.deleteFile(url, {
        fetch: this.authService.authenticatedFetch.bind(this.authService),
      });
    } catch (error: any) {
      this.convertError(error);
    }
  }

  /**
   * Iterates through all items in a container. If the contained resources are also containers, recursively iterate through its contents.
   * Guarantees no order of calling.
   *
   * @param folderUrl
   * @param urlHandler will be called with every resource contained in the folder
   */
  async traverseContainerContentsRecursively(
    folderUrl: string,
    urlHandler: (url: string) => Promise<void>
  ): Promise<void> {
    const contents: string[] = await this.getContainerContent(folderUrl);
    const containerUrls = contents.filter((url) => this.isContainer(url));
    const fileUrls = contents.filter((url) => !this.isContainer(url));

    await Promise.all([
      ...fileUrls.map((url) => urlHandler(url)),
      ...containerUrls.map((url) => urlHandler(url)),
      ...containerUrls.map((url) =>
        this.traverseContainerContentsRecursively(url, urlHandler)
      ),
    ]);
  }

  /**
   * Inserts the current user's webId to the specified group
   * by using a so called n3-patch. Further information
   * can be found under https://solid.github.io/specification/protocol#n3-patch
   * @param webId the webId to be added
   * @param groupUrl the group to which the webId is to be added
   */
  async addCurrentUserToGroup(groupUrl: string) {
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

  /**
   * converts any given error
   * @param error the error to convert
   */
  convertError(error: Error): never {
    if (error instanceof BaseException) {
      throw error;
    }
    if (error instanceof TypeError) {
      throw new InvalidUrlException('the given url is not valid', {
        cause: error,
      });
    }
    if (error instanceof FetchError) {
      switch (error.statusCode) {
        case 401:
        case 403:
          throw new PermissionException(
            `You do not have permissions for ${error.response.url}`,
            { cause: error }
          );
        case 404:
          throw new NotFoundException(`Could not find ${error.response.url}`, {
            cause: error,
          });
        case 405:
          throw new AlreadyExistsException(
            'A file or folder of that name already exists and cannot be overwritten',
            { cause: error }
          );
        case 500:
          throw new SolidPodException(
            'your solid provider returned an error, this might not be our fault',
            { cause: error }
          );
        default:
          break;
      }
    }
    throw new UnknownException(`an unknown error appeared`, {
      cause: error,
    });
  }

  /**
   * checks if a file should be hidden from user
   * if hides all files/folders starting with a . and the groups folder
   * but it does not hide anything if it is a child of those folders
   * @param url the file to check
   * @returns if the file should be hidden
   */
  isHiddenFile(url: string): boolean {
    // prepare for checks
    if (url.endsWith('/')) {
      url = url.slice(0, url.length - 1);
    }

    // files starting with . should be hidden
    const url_parts = url.split('/');
    if (url_parts[url_parts.length - 1].startsWith('.')) {
      return true;
    }

    return false;
  }
}
