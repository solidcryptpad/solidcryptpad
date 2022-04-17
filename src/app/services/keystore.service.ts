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
    const keystore = this.loadKeystore();
    const keyEntry = keystore.find((entry) => entry['ID'] == fileID);
    if (keyEntry) {
      return keyEntry['KEY'];
    } else {
      return 'Key not found';
    }
  }

  loadKeystore(): KeyEntry[] {
    let keystore = [];
    if (localStorage.getItem('keystore')) {
      const keystoreString = localStorage.getItem('keystore');
      if (keystoreString) {
        keystore = JSON.parse(keystoreString);
      }
    }
    return keystore;
  }

  storeKey(fileID: string, key: string) {
    const keystore = this.loadKeystore();

    keystore.push({ ID: fileID, KEY: key });
    localStorage.setItem('keystore', JSON.stringify(keystore));
    console.log(localStorage.getItem('keystore'));
    this.writeKeystoreToPod();
  }

  writeKeystoreToPod() {
    const encryptedKeystore = this.encryptKeystore();
    console.log(encryptedKeystore);
    const keyStoreBlob = new Blob([encryptedKeystore], { type: 'text/plain' });
    this.solidFileHandlerService
      .writeFile(keyStoreBlob, 'https://rade.solidweb.org/private/Keystore')
      .then(); //TODO
  }

  encryptKeystore(): string {
    const keystore = this.loadKeystore();
    return cryptoJS.AES.encrypt(
      JSON.stringify(keystore),
      this.masterPassword
    ).toString();
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
