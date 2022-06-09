import { Injectable } from '@angular/core';
import { ProfileService } from '../../profile/profile.service';
import { overwriteFile, getFile, FetchError } from '@inrupt/solid-client';
import { MatDialog } from '@angular/material/dialog';
import { firstValueFrom } from 'rxjs';
import { EnterMasterPasswordComponent } from 'src/app/components/enter-master-password/enter-master-password.component';
import { WrongMasterPasswordException } from 'src/app/exceptions/wrong-master-password-exception';
import { KeyNotFoundException } from 'src/app/exceptions/key-not-found-exception';
import { SetMasterPasswordComponent } from 'src/app/components/set-master-password/set-master-password.component';
import { SolidAuthenticationService } from '../../authentication/solid-authentication.service';
import { EncryptionService } from '../encryption/encryption.service';

@Injectable({
  providedIn: 'root',
})
export class KeystoreService {
  constructor(
    private encryptionService: EncryptionService,
    private profileService: ProfileService,
    private authService: SolidAuthenticationService,
    private dialog: MatDialog
  ) {}

  /**
   * Localstorage keys.
   */
  private readonly masterPasswordHashKey: string = 'masterPasswordHash';
  private readonly keystoreKey: string = 'keystore';

  /**
   * Sets the masterpassword .
   */
  async setMasterPassword(pwd: string) {
    if (pwd) {
      localStorage.setItem(
        this.masterPasswordHashKey,
        this.encryptionService.SHA256Salted(pwd)
      );
    }
  }

  async getMasterPassword(): Promise<string> {
    if (!localStorage.getItem(this.masterPasswordHashKey)) {
      this.setMasterPassword(await this.openMasterPasswordDialog());
    }
    const masterPasswordHash = localStorage.getItem(this.masterPasswordHashKey);

    if (!masterPasswordHash) {
      throw new WrongMasterPasswordException('Master password not set');
    }

    return masterPasswordHash;
  }

  checkMasterPasswordNotSet(): boolean {
    return !localStorage.getItem(this.masterPasswordHashKey);
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
      // TODO: should throw here. The caller must take care of catching the exception
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
    if (localStorage.getItem(this.keystoreKey)) {
      const keystoreString = localStorage.getItem(this.keystoreKey);
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
    try {
      // TODO: should not use getFile directly, but through a service
      const encryptedKeystore = await getFile(`${podUrls[0]}private/Keystore`, {
        fetch: this.authService.authenticatedFetch.bind(this.authService),
      });
      keystore = await this.decryptKeystore(await encryptedKeystore.text());
    } catch (error) {
      if (error instanceof FetchError && error.statusCode == 404) {
        if (this.checkMasterPasswordNotSet()) {
          const newMasterPassword = await this.openSetMasterPasswordDialog();
          console.log('masterkey: ' + newMasterPassword);
          if (newMasterPassword) {
            this.setMasterPassword(newMasterPassword);
          }
        }
      } else {
        throw error;
      }
    }

    localStorage.setItem(this.keystoreKey, JSON.stringify(keystore));
    return keystore;
  }

  /**
   * Stores a new KeyEntry in the local keystore and writes it to the solid pod.
   */
  async storeKey(fileID: string, key: string) {
    const keystore = await this.loadKeystore();
    keystore.push({ ID: fileID, KEY: key });
    localStorage.setItem(this.keystoreKey, JSON.stringify(keystore));
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
      fetch: this.authService.authenticatedFetch.bind(this.authService),
    });
  }

  /**
   * Encrypts the keystore using the masterpassword.
   */
  private async encryptKeystore(keystore: KeyEntry[]): Promise<string> {
    const masterPassword = await this.getMasterPassword();

    return this.encryptionService.encryptString(
      JSON.stringify(keystore),
      masterPassword
    );
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
        this.encryptionService.decryptString(encryptedKeystore, masterPassword)
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
      key = this.encryptionService.generateNewKey();
      await this.storeKey(fileURL, key);
    }

    const encryptedFileContent = await this.encryptionService.encryptBlob(
      file,
      key
    );
    const encryptedFile = new Blob([encryptedFileContent]);

    return encryptedFile;
  }

  /**
   * Decrypts a file by using its FileURL to find the matching key from the keystore.
   */
  async decryptFile(file: Blob, fileURL: string): Promise<Blob> {
    const key = await this.getKey(fileURL);
    if (!key) {
      throw new KeyNotFoundException('Decryption key not found');
    }
    return this.encryptionService.decryptAsBlob(await file.text(), key);
  }

  /**
   * Decrypts a file by using the provided key
   */
  async decryptFileWithKey(file: Blob, key: string): Promise<Blob> {
    return this.encryptionService.decryptAsBlob(await file.text(), key);
  }

  async openMasterPasswordDialog(): Promise<string> {
    const dialogRef = this.dialog.open(EnterMasterPasswordComponent, {});

    return await firstValueFrom(dialogRef.afterClosed());
  }

  async openSetMasterPasswordDialog(): Promise<string> {
    const dialogRef = this.dialog.open(SetMasterPasswordComponent, {});

    return await firstValueFrom(dialogRef.afterClosed());
  }
}
interface KeyEntry {
  ID: string;
  KEY: string;
}
