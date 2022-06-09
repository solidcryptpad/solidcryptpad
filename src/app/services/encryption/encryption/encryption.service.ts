import { Injectable } from '@angular/core';
import * as cryptoJS from 'crypto-js';

@Injectable({
  providedIn: 'root',
})
export class EncryptionService {
  generateNewKey(): string {
    const salt = cryptoJS.lib.WordArray.random(128 / 8);
    const secret = cryptoJS.lib.WordArray.random(256 / 8);
    const key256Bits = cryptoJS.PBKDF2(secret, salt, { keySize: 256 / 32 });

    return key256Bits.toString();
  }

  encryptString(data: string, key: string): string {
    return cryptoJS.AES.encrypt(data, key).toString();
  }

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

  // TODO: assert that dataURL starts with data url prefix
  private dataURLtoBlob(dataUrl: string): Promise<Blob> {
    return window.fetch(dataUrl).then((res) => res.blob());
  }
}
