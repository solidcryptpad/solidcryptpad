import { Injectable } from '@angular/core';
import * as cryptoJS from 'crypto-js';
@Injectable({
  providedIn: 'root',
})
export class KeystoreService {
  storeKey(fileID: string, key: string) {
    let keystore = [];
    if (localStorage.getItem('keystore')) {
      const keystoreString = localStorage.getItem('keystore');
      if (keystoreString) {
        keystore = JSON.parse(keystoreString);
      }
    }
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
