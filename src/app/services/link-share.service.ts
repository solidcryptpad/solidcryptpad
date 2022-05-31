import { Injectable } from '@angular/core';
import { KeystoreService } from './keystore/keystore.service';

@Injectable({
  providedIn: 'root',
})
export class LinkShareService {
  constructor(private keystoreService: KeystoreService) {}

  async createShareLink(fileURL: string): Promise<string> {
    const key = await this.keystoreService.getKey(fileURL);
    const encodedKey = btoa(key);
    const link = `editor?file=${fileURL}&key=${encodedKey}`;

    return link;
  }
}
