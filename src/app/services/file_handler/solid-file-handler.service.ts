import { Injectable } from '@angular/core';
import { getFile } from '@inrupt/solid-client';
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
}
