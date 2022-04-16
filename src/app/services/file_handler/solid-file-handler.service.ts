import { Injectable } from '@angular/core';
import { getFile, overwriteFile } from '@inrupt/solid-client';
import { fetch } from '@inrupt/solid-client-authn-browser';

@Injectable({
  providedIn: 'root',
})
export class SolidFileHandlerService {
  /**
   * reads a file saved at the url
   *
   * @param fileURL the url to read from
   * @returns a promise for the file as a blob
   */
  async readFile(fileURL: string): Promise<Blob> {
    return await getFile(fileURL, {
      fetch: fetch,
    });
  }

  /**
   * writes a file to an url
   * if the file already exists then it is overwritten
   * if the file does not exist then a new one is created
   *
   * @param fileURL the url to write to
   * @returns a promise for the saved file
   */
  async writeFile(file: Blob, fileURL: string): Promise<Blob> {
    return await overwriteFile(fileURL, file, {
      contentType: file.type,
      fetch: fetch,
    });
  }
}
