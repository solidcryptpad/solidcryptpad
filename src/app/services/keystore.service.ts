import { Injectable } from '@angular/core';
import * as cryptoJS from 'crypto-js';
import { SolidFileHandlerService } from 'src/app/services/file_handler/solid-file-handler.service';

@Injectable({
  providedIn: 'root',
})
export class KeystoreService {
  constructor(private solidFileHandlerService: SolidFileHandlerService) {}

  masterPassword = '';

  setMasterPassword(pwd: string) {
    this.masterPassword = pwd;
  }

  async getKey(fileID: string): Promise<string> {
    const localKey = this.getKeyFromLocalKeystore(fileID);
    if (localKey) {
      return localKey;
    } else {
      console.log('b');

      const keystore = await this.loadKeystore();
      console.log(keystore);
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

    const encryptedKeystore = await (
      await this.solidFileHandlerService.readFile(
        'https://rade.solidweb.org/private/Keystore'
      )
    ).text();
    keystore = this.decryptKeystore(encryptedKeystore);
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
    const encryptedKeystore = this.encryptKeystore(this.getLocalKeystore());
    //console.log(encryptedKeystore);
    const keyStoreBlob = new Blob([encryptedKeystore], { type: 'text/plain' });
    await this.solidFileHandlerService.writeFile(
      keyStoreBlob,
      'https://rade.solidweb.org/private/Keystore'
    ); //TODO
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
