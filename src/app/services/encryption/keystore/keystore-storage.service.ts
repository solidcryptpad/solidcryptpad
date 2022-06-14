import { Injectable } from '@angular/core';
import { UnknownException } from 'src/app/exceptions/unknown-exception';
import { SolidFileHandlerService } from '../../file-handler/solid-file-handler.service';
import { EncryptionService } from '../encryption/encryption.service';
import { SecureRemoteStorage } from './keystore.interface';

@Injectable({
  providedIn: 'root',
})
export class KeystoreStorageService {
  constructor(
    private encryptionService: EncryptionService,
    private fileService: SolidFileHandlerService
  ) {}

  createSecureStorage(encryptionKey: string): SecureRemoteStorage {
    return {
      loadSecure: (url) => this.loadKeystore(url, encryptionKey),
      saveSecure: (url, data) => this.saveKeystore(url, data, encryptionKey),
      serialize: () => JSON.stringify({ encryptionKey }),
    };
  }

  deserializeSecureStorage(serialization: string): SecureRemoteStorage {
    const { encryptionKey } = JSON.parse(serialization);
    return this.createSecureStorage(encryptionKey);
  }

  private async saveKeystore(
    url: string,
    data: string,
    encryptionKey: string
  ): Promise<void> {
    const encrypted = this.encryptionService.encryptString(data, encryptionKey);
    await this.fileService.writeFile(
      new Blob([encrypted], { type: 'text/plain' }),
      url
    );
  }

  private async loadKeystore(
    url: string,
    encryptionKey: string
  ): Promise<string> {
    const encrypted = await this.fileService
      .readFile(url)
      .then((res) => res.text());
    try {
      return this.encryptionService.decryptString(encrypted, encryptionKey);
    } catch (error) {
      // TODO: The encryption service should convert those errors
      throw new UnknownException(`Could not decrypt keystore ${url}`);
    }
  }
}
