import { Injectable } from '@angular/core';
import * as cryptoJS from 'crypto-js';
import { ProfileService } from '../profile/profile.service';
import { overwriteFile, getFile } from '@inrupt/solid-client';
import { MatDialog } from '@angular/material/dialog';
import { fetch } from '@inrupt/solid-client-authn-browser';
import { firstValueFrom } from 'rxjs';
import { EnterMasterPasswordComponent } from 'src/app/components/enter-master-password/enter-master-password.component';
import { WrongMasterPasswordException } from 'src/app/exceptions/wrong-master-password-exception';
import { KeyNotFoundException } from 'src/app/exceptions/key-not-found-exception';
import { NotFoundException } from 'src/app/exceptions/not-found-exception';

@Injectable({
  providedIn: 'root',
})
export class KeystoreService {
  constructor(
    private profileService: ProfileService,
    private dialog: MatDialog
  ) {}

  declare masterPasswordHash: string;
  /**
   * Sets the masterpassword .
   */
  async setMasterPassword(pwd: string) {
    this.masterPasswordHash = cryptoJS
      .SHA256(pwd + '1205sOlIDCryptPADsalt1502')
      .toString();
  }

  async getMasterPassword(): Promise<string> {
    if (!this.masterPasswordHash) {
      this.setMasterPassword(await this.openMasterPasswordDialog());
    }
    return this.masterPasswordHash;
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
    const podUrls = await this.profileService.getPodUrls();
    let encryptedKeystore;
    try {
      encryptedKeystore = await getFile(`${podUrls[0]}private/Keystore`, {
        fetch: fetch,
      });
    } catch (error: any) {
      throw new NotFoundException('No keystore found'); //TODO: Replace with set-master-password-component
    }
    keystore = await this.decryptKeystore(await encryptedKeystore.text());

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
    const podUrls = await this.profileService.getPodUrls();
    const encryptedKeystore = await this.encryptKeystore(
      this.getLocalKeystore()
    );
    const keyStoreBlob = new Blob([encryptedKeystore], { type: 'text/plain' });

    await overwriteFile(`${podUrls[0]}private/Keystore`, keyStoreBlob, {
      contentType: keyStoreBlob.type,
      fetch: fetch,
    });
  }

  /**
   * Encrypts the keystore using the masterpassword.
   */
  private async encryptKeystore(keystore: KeyEntry[]): Promise<string> {
    const masterPassword = await this.getMasterPassword();

    return cryptoJS.AES.encrypt(
      JSON.stringify(keystore),
      masterPassword
    ).toString();
  }

  /**
   * Decrypts the keystore using the masterpassword.
   */
  private async decryptKeystore(
    encryptedKeystore: string
  ): Promise<KeyEntry[]> {
    const masterPassword = await this.getMasterPassword();
    try {
      return JSON.parse(
        cryptoJS.AES.decrypt(encryptedKeystore, masterPassword).toString(
          cryptoJS.enc.Utf8
        )
      );
    } catch (error) {
      throw new WrongMasterPasswordException('Wrong master password');
    }
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
      await this.blobToDataURL(file),
      key
    ).toString();
    const encryptedFile = new Blob([encryptedFileContent]);

    return encryptedFile;
  }

  private blobToDataURL(data: Blob): Promise<string> {
    const reader = new FileReader();
    return new Promise((resolve) => {
      reader.onload = () => resolve(reader.result as string);
      reader.readAsDataURL(data);
    });
  }

  private dataURLtoBlob(dataUrl: string): Promise<Blob> {
    return window.fetch(dataUrl).then((res) => res.blob());
  }

  /**
   * Decrypts a file by using its FileURL to find the matching key from the keystore.
   */
  async decryptFile(file: Blob, fileURL: string): Promise<Blob> {
    const key = await this.getKey(fileURL);
    if (!key) {
      throw new KeyNotFoundException('Decryption key not found');
    }
    const decryptedFileContent = cryptoJS.AES.decrypt(
      await file.text(),
      key
    ).toString(cryptoJS.enc.Utf8);

    return this.dataURLtoBlob(decryptedFileContent);
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

  async openMasterPasswordDialog(): Promise<string> {
    const dialogRef = this.dialog.open(EnterMasterPasswordComponent, {});

    return await firstValueFrom(dialogRef.afterClosed());
  }
}
interface KeyEntry {
  ID: string;
  KEY: string;
}
