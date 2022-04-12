import { Injectable } from '@angular/core';
import { getFile, overwriteFile } from '@inrupt/solid-client';
import { fetch } from '@inrupt/solid-client-authn-browser';

@Injectable({
  providedIn: 'root',
})
export class SolidFileHandlerService {
  async readFile(fileURL: string): Promise<Blob> {
    return await getFile(fileURL, {
      fetch: fetch,
    });
  }

  async writeFile(file: File, fileURL: string): Promise<Blob> {
    return await overwriteFile(fileURL, file, {
      contentType: file.type,
      fetch: fetch,
    });
  }
}
