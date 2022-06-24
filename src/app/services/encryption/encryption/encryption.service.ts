import { Injectable } from '@angular/core';
import * as cryptoJS from 'crypto-js';
import { InvalidContentException } from 'src/app/exceptions/invalid-content';

@Injectable({
  providedIn: 'root',
})
export class EncryptionService {
  private fetch = window.fetch.bind(window);

  generateNewKey(): string {
    const salt = cryptoJS.lib.WordArray.random(128 / 8);
    const secret = cryptoJS.lib.WordArray.random(256 / 8);
    const key256Bits = cryptoJS.PBKDF2(secret, salt, { keySize: 256 / 32 });

    return key256Bits.toString();
  }

  encryptString(data: string, key: string): string {
    return cryptoJS.AES.encrypt(data, key).toString();
  }

  /**
   * Careful: If key is wrong then <empty string> is returned, no exception is thrown.
   * Thanks cryptoJS :-)
   */
  decryptString(ciphertext: string, key: string): string {
    return cryptoJS.AES.decrypt(ciphertext, key).toString(cryptoJS.enc.Utf8);
  }

  /**
   * Stores the blob as dataURL and encrypts this string
   */
  async encryptBlob(blob: Blob, key: string): Promise<string> {
    const dataURL = await this.blobToDataURL(blob);
    return this.encryptString(dataURL, key);
  }

  /**
   * Decrypts a ciphertext of a previously encrypted blob
   */
  async decryptAsBlob(ciphertext: string, key: string): Promise<Blob> {
    const dataURL = this.decryptString(ciphertext, key);
    return this.dataURLtoBlob(dataURL);
  }

  private SHA256(data: string): string {
    return cryptoJS.SHA256(data).toString();
  }

  SHA256Salted(data: string): string {
    return this.SHA256(data + '1205sOlIDCryptPADsalt1502');
  }

  private blobToDataURL(blob: Blob): Promise<string> {
    const reader = new FileReader();
    return new Promise((resolve) => {
      reader.onload = () => resolve(reader.result as string);
      reader.readAsDataURL(blob);
    });
  }

  private dataURLtoBlob(dataUrl: string): Promise<Blob> {
    if (!dataUrl.startsWith('data:'))
      throw new InvalidContentException(
        'Encrypted file is in unexpected format'
      );
    return this.fetch(dataUrl).then((res) => res.blob());
  }
}
