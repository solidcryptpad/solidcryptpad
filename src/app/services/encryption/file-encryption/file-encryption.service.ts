import { Injectable } from '@angular/core';
import { throwWithContext } from 'src/app/exceptions/error-options';
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
    const key = await this.keystoreService.getOrCreateKey(fileURL);
    const encryptedFileContent = await this.encryptionService.encryptBlob(
      file,
      key
    );

    return new Blob([encryptedFileContent]);
  }

  /**
   * Decrypts a file by using its FileURL to find the matching key from the keystore.
   */
  async decryptFile(file: Blob, fileURL: string): Promise<Blob> {
    const key = await this.keystoreService.getKey(fileURL);
    return this.encryptionService
      .decryptAsBlob(await file.text(), key)
      .catch(throwWithContext(`Could not decrypt ${file}`));
  }

  /**
   * Decrypts a file by using the provided key
   */
  async decryptFileWithKey(file: Blob, key: string): Promise<Blob> {
    return this.encryptionService
      .decryptAsBlob(await file.text(), key)
      .catch(throwWithContext(`Could not decrypt ${file}`));
  }
}
