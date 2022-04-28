import { Injectable } from '@angular/core';
import {
  FetchError,
  getFile,
  isContainer,
  overwriteFile,
} from '@inrupt/solid-client';
import { fetch } from '@inrupt/solid-client-authn-browser';
import { AlreadyExistsException } from 'src/app/exceptions/already-exists-exception';
import { InvalidUrlException } from 'src/app/exceptions/invalid-url-exception';
import { NotFoundException } from 'src/app/exceptions/not-found-exception';
import { PermissionException } from 'src/app/exceptions/permission-exception';
import { UnknownException } from 'src/app/exceptions/unknown-exception';

@Injectable({
  providedIn: 'root',
})
export class SolidFileHandlerService {
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
      return await getFile(fileURL, {
        fetch: fetch,
      });
    } catch (error: any) {
      if (error instanceof TypeError) {
        throw new InvalidUrlException('the given url is not valid');
      }
      if (error instanceof FetchError) {
        switch (error.statusCode) {
          case 401:
          case 403:
            throw new PermissionException(
              'you do not have the permission to read to this file'
            );
          case 404:
            throw new NotFoundException('file was not found');
          default:
            break;
        }
      }
      console.log(error);
      throw new UnknownException(`an unknown error appeared ${error.name}`);
    }
  }

  /**
   * writes a file to an url
   * if the given link is a directory the file_name is appended
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
    file_name = 'unnamed'
  ): Promise<Blob> {
    if (isContainer(fileURL)) {
      fileURL = fileURL + '' + file_name;
    }

    try {
      return await overwriteFile(fileURL, file, {
        contentType: file.type,
        fetch: fetch,
      });
    } catch (error: any) {
      if (error instanceof TypeError) {
        throw new InvalidUrlException('the given url is not valid');
      }
      if (error instanceof FetchError) {
        switch (error.statusCode) {
          case 401:
          case 403:
            throw new PermissionException(
              'you do not have the permission to write to this file'
            );
          case 405:
            throw new AlreadyExistsException(
              'A file or folder of that name already exists and cannot be overwritten'
            );

          default:
            break;
        }
      }
      throw new UnknownException(`an unknown error appeared ${error.name}`);
    }
  }

  /**
   * creates the folder at the given url
   * if a folder/file already exists then it is overwritten
   * if the file does not exist then a new one is created
   *
   * @param containerURL the url the container should be created
   * @returns a promise for the saved folder
   * @throws InvalidUrlException if the given url is not considered valid
   * @throws PermissionException if the given url cannot be written to cause of missing permissions
   * @throws UnknownException on all errors that are not explicitly caught
   * @throws AlreadyExistsException if the file cannot be overwritten
   */
  async writeZContainer(containerURL: string): Promise<Blob> {
    if (!isContainer(containerURL)) {
      containerURL = containerURL + '/';
    }

    try {
      return await overwriteFile(containerURL, new Blob());
    } catch (error: any) {
      if (error instanceof TypeError) {
        throw new InvalidUrlException('the given url is not valid');
      }
      if (error instanceof FetchError) {
        switch (error.statusCode) {
          case 401:
          case 403:
            throw new PermissionException(
              'you do not have the permission to write to this file'
            );
          case 405:
            throw new AlreadyExistsException(
              'A file or folder of that name already exists and cannot be overwritten'
            );

          default:
            break;
        }
      }
      throw new UnknownException(`an unknown error appeared ${error.name}`);
    }
  }
}
