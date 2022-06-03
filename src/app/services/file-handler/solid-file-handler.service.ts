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
import { KeystoreService } from '../keystore/keystore.service';
import { BaseException } from 'src/app/exceptions/base-exception';
import { SolidClientService } from '../module-wrappers/solid-client/solid-client.service';
import { NotFoundException } from 'src/app/exceptions/not-found-exception';
import * as mime from 'mime';
import { SolidAuthenticationService } from '../authentication/solid-authentication.service';
import { NotACryptpadUrlException } from 'src/app/exceptions/not-a-cryptpad-url-exception';
import { throwWithContext } from 'src/app/exceptions/error-options';
import { FolderNotEmptyException } from 'src/app/exceptions/folder-not-empty-exception';
import { SolidPodException } from 'src/app/exceptions/solid-pod-exception';

@Injectable({
  providedIn: 'root',
})
export class SolidFileHandlerService {
  private readonly cryptoDirectoryName = 'solidcryptpad';

  constructor(
    private keystoreService: KeystoreService,
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
   * reads and exncrypted file saved at the url
   *
   * @param fileURL the url to read from
   * @returns a promise for the decrypted file as a blob
   * @throws InvalidUrlException if the given url is not considered valid
   * @throws PermissionException if the given url cannot be written to
   * @throws UnknownException on all errors that are not explicitly caught
   * @throws NotFoundException if the given file was not found
   * @throws NotACryptpadUrlException if the url does not point into a solidcryptpad folder
   */
  async readAndDecryptFile(fileURL: string): Promise<Blob> {
    if (!this.isCryptoDirectory(fileURL)) {
      throw new NotACryptpadUrlException('file is not in a valid directory');
    }
    const file = await this.readFile(fileURL);
    return await this.keystoreService.decryptFile(file, fileURL);
  }

  /**
   * writes a file to an url
   * if the given link is a directory the fileName is appended
   * if the file already exists then it is overwritten
   * if the file does not exist then a new one is created
   *
   * @param fileURL the url to write to
   * @returns a promise for the saved file
   * @throws InvalidUrlException if the given url is not considered valid
   * @throws PermissionException if the given url cannot be written to cause of missing permissions
   * @throws UnknownException on all errors that are not explicitly caught
   * @throws AlreadyExistsException if the file cannot be overwritten
   */
  async writeFile(
    file: Blob,
    fileURL: string,
    fileName = 'unnamed'
  ): Promise<Blob> {
    if (this.isContainer(fileURL)) {
      fileURL = fileURL + '' + fileName;
    }

    try {
      return await this.solidClientService.overwriteFile(fileURL, file, {
        contentType: file.type || 'text/plain', //TODO standard content type?
        fetch: this.authService.authenticatedFetch.bind(this.authService),
      });
    } catch (error: any) {
      this.convertError(error);
    }
  }

  /**
   * encrypts a file and writes it to an url
   * if the given link is a directory the fileName is appended
   * if the file already exists then it is overwritten
   * if the file does not exist then a new one is created
   *
   * @param fileURL the url to write to
   * @returns a promise for the saved file
   * @throws InvalidUrlException if the given url is not considered valid
   * @throws PermissionException if the given url cannot be written to cause of missing permissions
   * @throws UnknownException on all errors that are not explicitly caught
   * @throws AlreadyExistsException if the file cannot be overwritten
   */
  async writeAndEncryptFile(
    file: Blob,
    fileURL: string,
    fileName = 'unnamed'
  ): Promise<Blob> {
    if (this.isContainer(fileURL)) {
      fileURL = fileURL + '' + fileName;
    }
    if (!this.isCryptoDirectory(fileURL)) {
      throw new NotACryptpadUrlException('file is not in a valid directory');
    }
    const encryptedFile = await this.keystoreService.encryptFile(file, fileURL);

    return await this.writeFile(encryptedFile, fileURL, fileName);
  }

  /**
   * creates the folder at the given url
   * if a folder/file already exists then it is overwritten
   * if the file does not exist then a new one is created
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
    try {
      return await this.solidClientService.getSolidDataset(containerURL, {
        fetch: this.authService.authenticatedFetch.bind(this.authService),
      });
    } catch (error: any) {
      this.convertError(error);
    }
  }

  /**
   * checks if a container exists
   * @param containerURL the container to check
   * @returns true or false depending on if it exists
   */
  async containerExists(containerURL: string): Promise<boolean> {
    try {
      await this.getContainer(containerURL);
    } catch (error: any) {
      if (error instanceof NotFoundException) {
        return false;
      }
      throw error;
    }
    return true;
  }

  /**
   * creates the container if it does not exist
   * @returns true if the folder has been created
   */
  async ensureContainerExists(containerUrl: string): Promise<boolean> {
    if (!(await this.containerExists(containerUrl))) {
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
   * checks if the directory is a valid cryptodirectory
   * @param url the url to check
   * @returns if it contains the wanted directoryname
   */
  isCryptoDirectory(url: string): boolean {
    return url.includes('/' + this.cryptoDirectoryName + '/');
  }

  /**
   * @param baseUrl url to which the crypto directory path should be added. Must end with /
   * @returns url of the crypto directory
   */
  getDefaultCryptoDirectoryUrl(baseUrl: string): string {
    return `${baseUrl}${this.cryptoDirectoryName}/`;
  }

  /**
   * deletes the folder at the url
   * @param url url of folder to delete
   */
  async deleteFolder(url: string): Promise<void> {
    try {
      await this.solidClientService.deleteContainer(url, {
        fetch: this.authService.authenticatedFetch.bind(this.authService),
      });
    } catch (error: any) {
      //is checked here because message doesn't make sense for most cases
      if (error instanceof FetchError && error.statusCode == 409) {
        throw new FolderNotEmptyException(
          'folder has to be empty to be deleted'
        );
      }
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
   * converts any given error
   * @param error the error to convert
   */
  convertError(error: Error): never {
    if (error instanceof BaseException) {
      throw error;
    }
    if (error instanceof TypeError) {
      console.error(error);
      throw new InvalidUrlException('the given url is not valid', {
        cause: error,
      });
    }
    if (error instanceof FetchError) {
      switch (error.statusCode) {
        case 401:
        case 403:
          throw new PermissionException(
            'you do not have the permission needed for this file',
            { cause: error }
          );
        case 404:
          throw new NotFoundException('the requested file was not found', {
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
}
