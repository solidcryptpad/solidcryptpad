import { Injectable } from '@angular/core';
import { ProfileService } from '../../profile/profile.service';
import { overwriteFile, getFile, FetchError } from '@inrupt/solid-client';
import { WrongMasterPasswordException } from 'src/app/exceptions/wrong-master-password-exception';
import { SolidAuthenticationService } from '../../authentication/solid-authentication.service';
import { UserLocalStorage } from '../../user-local-storage/user-local-storage.service';
import { EncryptionService } from '../encryption/encryption.service';
import { MasterPasswordService } from '../master-password/master-password.service';

@Injectable({
  providedIn: 'root',
})
export class KeystoreService {
  constructor(
    private encryptionService: EncryptionService,
    private masterPasswordService: MasterPasswordService,
    private profileService: ProfileService,
    private authService: SolidAuthenticationService,
    private userLocalStorage: UserLocalStorage
  ) {}

  /**
   * Localstorage keys.
   */
  private readonly keystoreKey: string = 'keystore';

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
    if (this.userLocalStorage.getItem(this.keystoreKey)) {
      const keystoreString = this.userLocalStorage.getItem(this.keystoreKey);
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
        if (this.masterPasswordService.checkMasterPasswordNotSet()) {
          const newMasterPassword =
            await this.masterPasswordService.openSetMasterPasswordDialog();
          console.log('masterkey: ' + newMasterPassword);
          if (newMasterPassword) {
            this.masterPasswordService.setMasterPassword(newMasterPassword);
          }
        }
      } else {
        throw error;
      }
    }

    this.userLocalStorage.setItem(this.keystoreKey, JSON.stringify(keystore));
    return keystore;
  }

  /**
   * Stores a new KeyEntry in the local keystore and writes it to the solid pod.
   */
  async storeKey(fileID: string, key: string) {
    const keystore = await this.loadKeystore();
    keystore.push({ ID: fileID, KEY: key });
    this.userLocalStorage.setItem(this.keystoreKey, JSON.stringify(keystore));
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
    const masterPassword = await this.masterPasswordService.getMasterPassword();

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
    const masterPassword = await this.masterPasswordService.getMasterPassword();
    try {
      return JSON.parse(
        this.encryptionService.decryptString(encryptedKeystore, masterPassword)
      );
    } catch (error) {
      throw new WrongMasterPasswordException('Wrong master password');
    }
  }
}
interface KeyEntry {
  ID: string;
  KEY: string;
}
