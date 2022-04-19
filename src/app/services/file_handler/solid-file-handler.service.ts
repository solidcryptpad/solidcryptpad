import { Injectable } from '@angular/core';
import { FetchError, getFile, overwriteFile } from '@inrupt/solid-client';
import { fetch } from '@inrupt/solid-client-authn-browser';
import { InvalidUrlException } from 'src/app/exceptions/invalid-url-exception';
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
          default:
            break;
        }
      }
      throw new UnknownException(`an unknown error appeared ${error.name}`);
    }
  }

  /**
   * writes a file to an url
   * if the file already exists then it is overwritten
   * if the file does not exist then a new one is created
   *
   * @param fileURL the url to write to
   * @returns a promise for the saved file
   * @throws InvalidUrlException if the given url is not considered valid
   * @throws PermissionException if the given url cannot be written to cause of missing permissions
   * @throws UnknownException on all errors that are not explicitly caught
   */
  async writeFile(file: Blob, fileURL: string): Promise<Blob> {
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
          default:
            break;
        }
      }
      throw new UnknownException(`an unknown error appeared ${error.name}`);
    }
  }
}
