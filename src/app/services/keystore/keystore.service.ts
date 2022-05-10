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

  /**
   * Sets the masterpassword .
   */
  setMasterPassword(pwd: string) {
    this.masterPassword = pwd;
  }

  /**
   * Searches for the key that belongs to the FileID.
   * First the local keystore is searched, and if this is not successful,
   * then the keystore is reloaded from the Solid Pod and searched.
   */
  async getKey(fileID: string): Promise<string> {
    const localKey = this.getKeyFromLocalKeystore(fileID);
    if (localKey) {
      return localKey;
    } else {
      const keystore = await this.loadKeystore();
      return this.findKeyInKeystore(fileID, keystore);
    }
  }

  /**
   * Searches for the key belonging to the FileID in a KeyEntry array.
   */
  private findKeyInKeystore(fileID: string, keystore: KeyEntry[]): string {
    const keyEntry = keystore.find((entry) => entry['ID'] == fileID);
    if (keyEntry) {
      return keyEntry['KEY'];
    } else {
      return '';
    }
  }

  /**
   * Searches for the key that belongs to the FileID in the local keystore.
   */
  getKeyFromLocalKeystore(fileID: string): string {
    const keystore = this.getLocalKeystore();
    return this.findKeyInKeystore(fileID, keystore);
  }

  /**
   * Returns the keystore from the local storage.
   */
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

  /**
   * Reloads the keystore from the solid pod and stores it in the local storage.
   */
  async loadKeystore(): Promise<KeyEntry[]> {
    let keystore: KeyEntry[];
    keystore = [];
    const userName = await this.profileService.getPodUrls();
    try {
      const encryptedKeystore = await getFile(
        `${userName[0]}private/Keystore`,
        {
          fetch: fetch,
        }
      );
      keystore = this.decryptKeystore(await encryptedKeystore.text());
    } catch (error: any) {
      console.log('No Keystore found'); // TODO: Exception-Handling
    }

    localStorage.setItem('keystore', JSON.stringify(keystore));
    return keystore;
  }

  /**
   * Stores a new KeyEntry in the local keystore and writes it to the solid pod.
   */
  async storeKey(fileID: string, key: string) {
    const keystore = await this.loadKeystore();
    keystore.push({ ID: fileID, KEY: key });
    localStorage.setItem('keystore', JSON.stringify(keystore));
    await this.writeKeystoreToPod();
  }

  /**
   * Writes the current keystore from the local storage to the solid pod.
   */
  private async writeKeystoreToPod() {
    const userName = await this.profileService.getPodUrls();
    const encryptedKeystore = this.encryptKeystore(this.getLocalKeystore());
    const keyStoreBlob = new Blob([encryptedKeystore], { type: 'text/plain' });

    await overwriteFile(`${userName[0]}private/Keystore`, keyStoreBlob, {
      contentType: keyStoreBlob.type,
      fetch: fetch,
    });
  }

  /**
   * Encrypts the keystore using the masterpassword.
   */
  private encryptKeystore(keystore: KeyEntry[]): string {
    return cryptoJS.AES.encrypt(
      JSON.stringify(keystore),
      this.masterPassword
    ).toString();
  }

  /**
   * Decrypts the keystore using the masterpassword.
   */
  private decryptKeystore(encryptedKeystore: string): KeyEntry[] {
    return JSON.parse(
      cryptoJS.AES.decrypt(encryptedKeystore, this.masterPassword).toString(
        cryptoJS.enc.Utf8
      )
    );
  }

  /**
   * Encrypts a file by using its FileURL to find the matching key from the keystore.
   * If no matching key is found, a new one is generated.
   */
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

  /**
   * Decrypts a file by using its FileURL to find the matching key from the keystore.
   */
  async decryptFile(file: Blob, fileURL: string): Promise<Blob> {
    const key = await this.getKey(fileURL);
    if (!key) {
      console.log('Key not found'); // TODO: Exception-Handling
      return new Blob(['ERROR']); // TODO: Exception-Handling
    }
    const decryptedFileContent = cryptoJS.AES.decrypt(
      await file.text(),
      key
    ).toString(cryptoJS.enc.Utf8);
    const decryptedFile = new Blob([decryptedFileContent]);

    return decryptedFile;
  }

  /**
   * Generates a new Key.
   */
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
