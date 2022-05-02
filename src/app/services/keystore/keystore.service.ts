import { Injectable } from '@angular/core';
import * as cryptoJS from 'crypto-js';
import { ProfileService } from '../profile/profile.service';
import { overwriteFile, getFile } from '@inrupt/solid-client';
import { fetch } from '@inrupt/solid-client-authn-browser';

@Injectable({
  providedIn: 'root',
})
export class KeystoreService {
  constructor(private profileService: ProfileService) {}

  masterPassword = '';

  setMasterPassword(pwd: string) {
    this.masterPassword = pwd;
  }

  async getKey(fileID: string): Promise<string> {
    const localKey = this.getKeyFromLocalKeystore(fileID);
    if (localKey) {
      return localKey;
    } else {
      const keystore = await this.loadKeystore();
      //console.log(keystore);
      return this.findKeyInKeystore(fileID, keystore);
    }
  }

  private findKeyInKeystore(fileID: string, keystore: KeyEntry[]): string {
    const keyEntry = keystore.find((entry) => entry['ID'] == fileID);
    if (keyEntry) {
      return keyEntry['KEY'];
    } else {
      return '';
    }
  }

  getKeyFromLocalKeystore(fileID: string): string {
    const keystore = this.getLocalKeystore();
    return this.findKeyInKeystore(fileID, keystore);
  }

  getLocalKeystore(): KeyEntry[] {
    let keystore = [];
    if (localStorage.getItem('keystore')) {
      const keystoreString = localStorage.getItem('keystore');
      if (keystoreString) {
        keystore = JSON.parse(keystoreString);
      }
    }
    return keystore;
  }

  async loadKeystore(): Promise<KeyEntry[]> {
    let keystore: KeyEntry[];
    keystore = [];
    const userName = await this.profileService.getUserName();
    try {
      const encryptedKeystore = await getFile(
        `https://${userName}.solidweb.org/private/Keystore`,
        {
          fetch: fetch,
        }
      );
      keystore = this.decryptKeystore(await encryptedKeystore.text());
    } catch (error: any) {
      console.log('No Keystore found'); // TEMP
    }

    localStorage.setItem('keystore', JSON.stringify(keystore));
    return keystore;
  }

  async storeKey(fileID: string, key: string) {
    const keystore = await this.loadKeystore();
    keystore.push({ ID: fileID, KEY: key });
    localStorage.setItem('keystore', JSON.stringify(keystore));
    console.log(localStorage.getItem('keystore'));
    await this.writeKeystoreToPod();
  }

  private async writeKeystoreToPod() {
    const userName = await this.profileService.getUserName();
    const encryptedKeystore = this.encryptKeystore(this.getLocalKeystore());
    //console.log(encryptedKeystore);
    const keyStoreBlob = new Blob([encryptedKeystore], { type: 'text/plain' });

    await overwriteFile(
      `https://${userName}.solidweb.org/private/Keystore`,
      keyStoreBlob,
      {
        contentType: keyStoreBlob.type,
        fetch: fetch,
      }
    );
  }

  private encryptKeystore(keystore: KeyEntry[]): string {
    return cryptoJS.AES.encrypt(
      JSON.stringify(keystore),
      this.masterPassword
    ).toString();
  }

  private decryptKeystore(encryptedKeystore: string): KeyEntry[] {
    return JSON.parse(
      cryptoJS.AES.decrypt(encryptedKeystore, this.masterPassword).toString(
        cryptoJS.enc.Utf8
      )
    );
  }

  async encryptFile(file: Blob, fileURL: string): Promise<Blob> {
    let key = await this.getKey(fileURL);
    if (!key) {
      key = this.generateNewKey();
      await this.storeKey(fileURL, key);
    }
    const encryptedFileContent = cryptoJS.AES.encrypt(
      await file.text(),
      key
    ).toString();
    const encryptedFile = new Blob([encryptedFileContent]);

    return encryptedFile;
  }

  async decryptFile(file: Blob, fileURL: string): Promise<Blob> {
    const key = await this.getKey(fileURL);
    if (!key) {
      console.log('Key not found'); // TEMP
      return new Blob(['ERROR']); // TEMP
    }
    const decryptedFileContent = cryptoJS.AES.decrypt(
      await file.text(),
      key
    ).toString(cryptoJS.enc.Utf8);
    const decryptedFile = new Blob([decryptedFileContent]);

    return decryptedFile;
  }

  generateNewKey(): string {
    const salt = cryptoJS.lib.WordArray.random(128 / 8);
    const secret = cryptoJS.lib.WordArray.random(256 / 8);
    const key256Bits = cryptoJS.PBKDF2(secret, salt, { keySize: 256 / 32 });

    return key256Bits.toString();
  }
}
interface KeyEntry {
  ID: string;
  KEY: string;
}
