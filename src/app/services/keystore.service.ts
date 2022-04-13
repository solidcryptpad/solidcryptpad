import { Injectable } from '@angular/core';
import * as cryptoJS from 'crypto-js';
@Injectable({
  providedIn: 'root',
})
export class KeystoreService {
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
