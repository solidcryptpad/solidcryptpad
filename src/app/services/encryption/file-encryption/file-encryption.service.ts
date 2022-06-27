import { Injectable } from '@angular/core';
import { throwWithContext } from 'src/app/exceptions/error-options';
import { NotACryptpadUrlException } from 'src/app/exceptions/not-a-cryptpad-url-exception';
import { SolidFileHandlerService } from '../../file-handler/solid-file-handler.service';
import { EncryptionService } from '../encryption/encryption.service';
import { KeystoreService } from '../keystore/keystore.service';

@Injectable({
  providedIn: 'root',
})
export class FileEncryptionService {
  private readonly defaultCryptoDirectoryName = 'solidcryptpad';
  private readonly cryptoDirectoryNames = [
    this.defaultCryptoDirectoryName,
    'solidcryptpad-data',
  ];

  constructor(
    private keystoreService: KeystoreService,
    private encryptionService: EncryptionService,
    private fileService: SolidFileHandlerService
  ) {}

  /**
   * Encrypts a file by using its url to find the matching key from the keystore.
   * If no matching key is found, a new one is generated.
   */
  async encryptFile(file: Blob, fileURL: string): Promise<Blob> {
    const key = await this.keystoreService.getOrCreateKey(fileURL);
    const encryptedFileContent = await this.encryptionService.encryptBlob(
      file,
      key
    );

    return new Blob([encryptedFileContent]);
  }

  /**
   * Decrypts a file by using its url to find the matching key from the keystore.
   */
  async decryptFile(file: Blob, fileURL: string): Promise<Blob> {
    const key = await this.keystoreService.getKey(fileURL);
    return this.decryptFileWithKey(file, key);
  }

  /**
   * Decrypts a file by using the provided key
   */
  async decryptFileWithKey(file: Blob, key: string): Promise<Blob> {
    return this.encryptionService
      .decryptAsBlob(await file.text(), key)
      .catch(throwWithContext(`Could not decrypt ${file}`));
  }

  /**
   * reads and exncrypted file saved at the url
   *
   * @param fileURL the url to read from
   * @returns a promise for the decrypted file as a blob
   * @throws InvalidUrlException if the given url is not considered valid
   * @throws PermissionException if the given url cannot be written to
   * @throws UnknownException on all errors that are not explicitly caught
   * @throws NotFoundException if the given file was not found
   * @throws NotACryptpadUrlException if the url does not point into a solidcryptpad folder
   */
  async readAndDecryptFile(fileURL: string): Promise<Blob> {
    if (!this.isCryptoDirectory(fileURL)) {
      throw new NotACryptpadUrlException(
        `Cannot encrypt ${fileURL} if it is not in an encrypted directory`
      );
    }
    const file = await this.fileService.readFile(fileURL);
    return this.decryptFile(file, fileURL);
  }

  async readAndDecryptFileWithKey(fileURL: string, key: string): Promise<Blob> {
    if (!this.isCryptoDirectory(fileURL)) {
      throw new NotACryptpadUrlException(
        `Cannot encrypt ${fileURL} if it is not in an encrypted directory`
      );
    }
    const file = await this.fileService.readFile(fileURL);
    return this.decryptFileWithKey(file, key);
  }

  /**
   * encrypts a file and writes it to an url
   * if the file already exists then it is overwritten
   * if the file does not exist then a new one is created
   *
   * @param file the file being written
   * @param fileURL the url to write to
   * @returns a promise for the saved file
   * @throws InvalidUrlException if the given url is not considered valid
   * @throws PermissionException if the given url cannot be written to cause of missing permissions
   * @throws UnknownException on all errors that are not explicitly caught
   * @throws AlreadyExistsException if the file cannot be overwritten
   */
  async writeAndEncryptFile(file: Blob, fileURL: string): Promise<Blob> {
    fileURL = fileURL.replace(/ /g, '');
    if (!this.isCryptoDirectory(fileURL)) {
      throw new NotACryptpadUrlException(
        `Cannot encrypt ${fileURL} if it is not in an encrypted directory`
      );
    }
    const encryptedFile = await this.encryptFile(file, fileURL);

    return this.fileService.writeFile(encryptedFile, fileURL);
  }

  /**
   * checks if the directory is a valid cryptodirectory
   * @param url the url to check
   * @returns if it contains the wanted directoryname
   */
  isCryptoDirectory(url: string): boolean {
    return this.cryptoDirectoryNames.some((name) => url.includes(`/${name}/`));
  }

  /**
   * @param baseUrl url to which the crypto directory path should be added. Must end with /
   * @returns url of the crypto directory
   */
  getDefaultCryptoDirectoryUrl(baseUrl: string): string {
    return `${baseUrl}${this.defaultCryptoDirectoryName}/`;
  }
}
