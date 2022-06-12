import { Injectable } from '@angular/core';
import { KeyNotFoundException } from 'src/app/exceptions/key-not-found-exception';
import { EncryptionService } from '../encryption/encryption.service';
import { KeystoreService } from '../keystore/keystore.service';

@Injectable({
  providedIn: 'root',
})
export class FileEncryptionService {
  constructor(
    private keystoreService: KeystoreService,
    private encryptionService: EncryptionService
  ) {}

  /**
   * Encrypts a file by using its FileURL to find the matching key from the keystore.
   * If no matching key is found, a new one is generated.
   */
  async encryptFile(file: Blob, fileURL: string): Promise<Blob> {
    let key = await this.keystoreService.getKey(fileURL);
    if (!key) {
      key = this.encryptionService.generateNewKey();
      await this.keystoreService.storeKey(fileURL, key);
    }

    const encryptedFileContent = await this.encryptionService.encryptBlob(
      file,
      key
    );
    const encryptedFile = new Blob([encryptedFileContent]);

    return encryptedFile;
  }

  /**
   * Decrypts a file by using its FileURL to find the matching key from the keystore.
   */
  async decryptFile(file: Blob, fileURL: string): Promise<Blob> {
    const key = await this.keystoreService.getKey(fileURL);
    if (!key) {
      throw new KeyNotFoundException('Decryption key not found');
    }
    return this.encryptionService.decryptAsBlob(await file.text(), key);
  }

  /**
   * Decrypts a file by using the provided key
   */
  async decryptFileWithKey(file: Blob, key: string): Promise<Blob> {
    return this.encryptionService.decryptAsBlob(await file.text(), key);
  }
}
