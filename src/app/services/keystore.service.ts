import { Injectable } from '@angular/core';
import * as cryptoJS from 'crypto-js';
import { SolidFileHandlerService } from './file_handler/solid-file-handler.service';

@Injectable({
  providedIn: 'root',
})
export class KeystoreService {
  constructor(private solidFileHandlerService: SolidFileHandlerService) {}

  masterPassword = '';

  setMasterPassword(pwd: string) {
    this.masterPassword = pwd;
  }

  getKey(fileID: string): string {
    const keystore = this.getLocalKeystore();
    const keyEntry = keystore.find((entry) => entry['ID'] == fileID);
    if (keyEntry) {
      return keyEntry['KEY'];
    } else {
      return 'Key not found';
    }
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
    keystore = JSON.parse(this.decryptKeystore(encryptedKeystore));
    return keystore;
  }

  storeKey(fileID: string, key: string) {
    this.loadKeystore().then((keystore) => {
      keystore.push({ ID: fileID, KEY: key });
      localStorage.setItem('keystore', JSON.stringify(keystore));
      console.log(localStorage.getItem('keystore'));
      this.writeKeystoreToPod();
    });
  }

  writeKeystoreToPod() {
    const encryptedKeystore = this.encryptKeystore(this.getLocalKeystore());
    console.log(encryptedKeystore);
    const keyStoreBlob = new Blob([encryptedKeystore], { type: 'text/plain' });
    this.solidFileHandlerService
      .writeFile(keyStoreBlob, 'https://rade.solidweb.org/private/Keystore')
      .then(); //TODO
  }

  encryptKeystore(keystore: KeyEntry[]): string {
    return cryptoJS.AES.encrypt(
      JSON.stringify(keystore),
      this.masterPassword
    ).toString();
  }

  decryptKeystore(encryptedKeystore: string): string {
    return cryptoJS.AES.decrypt(
      encryptedKeystore,
      this.masterPassword
    ).toString(cryptoJS.enc.Utf8);
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
