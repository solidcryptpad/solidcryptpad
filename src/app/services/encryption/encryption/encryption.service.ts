import { Injectable } from '@angular/core';
import * as cryptoJS from 'crypto-js';
import { InvalidContentException } from 'src/app/exceptions/invalid-content';
import { UnknownException } from 'src/app/exceptions/unknown-exception';
import { WrongDecriptionKeyException } from 'src/app/exceptions/wrong-decription-key-exception';

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
   * If key is wrong, then WrongDecriptionKeyException is thrown.
   */
  decryptString(ciphertext: string, key: string): string {
    try {
      const plaintext = cryptoJS.AES.decrypt(ciphertext, key).toString(
        cryptoJS.enc.Utf8
      );
      if (plaintext == '') {
        throw new WrongDecriptionKeyException('Wrong Decription Key');
      }
      return cryptoJS.AES.decrypt(ciphertext, key).toString(cryptoJS.enc.Utf8);
    } catch (error: any) {
      if (error.message == 'Malformed UTF-8 data') {
        throw new WrongDecriptionKeyException('Wrong Decription Key');
      } else if (error instanceof WrongDecriptionKeyException) {
        throw error;
      } else {
        throw new UnknownException(error.message);
      }
    }
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
    try {
      const dataURL = this.decryptString(ciphertext, key);
      return this.dataURLtoBlob(dataURL);
    } catch (error: any) {
      if (error.message == 'Malformed UTF-8 data') {
        throw new WrongDecriptionKeyException('Wrong Decription Key');
      } else {
        throw new UnknownException(error.message);
      }
    }
  }

  private SHA256(data: string): string {
    return cryptoJS.SHA256(data).toString();
  }

  SHA256Salted(data: string): string {
    return this.SHA256(data + '1205sOlIDCryptPADsalt1502');
  }

  private blobToDataURL(blob: Blob): Promise<string> {
    // chromium returns data: which fails for our conversion back
    if (blob.size === 0) {
      return Promise.resolve(`data:${blob.type};base64,`);
    }
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
