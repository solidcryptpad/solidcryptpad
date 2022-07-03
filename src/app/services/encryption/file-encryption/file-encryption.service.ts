import { Injectable } from '@angular/core';
import { throwWithContext } from 'src/app/exceptions/error-options';
import { NotACryptpadUrlException } from 'src/app/exceptions/not-a-cryptpad-url-exception';
import { DirectoryStructureService } from '../../directory-structure/directory-structure.service';
import { SolidFileHandlerService } from '../../file-handler/solid-file-handler.service';
import { EncryptionService } from '../encryption/encryption.service';
import { KeyService } from '../key/key.service';

@Injectable({
  providedIn: 'root',
})
export class FileEncryptionService {
  constructor(
    private keyService: KeyService,
    private encryptionService: EncryptionService,
    private fileService: SolidFileHandlerService,
    private directoryService: DirectoryStructureService
  ) {}

  /**
   * Encrypts a file by using its url to find the matching key from the keystore.
   * If no matching key is found, a new one is generated.
   */
  async encryptFile(file: Blob, fileURL: string): Promise<Blob> {
    const key = await this.keyService.getOrCreateKey(fileURL);
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
    const key = await this.keyService.getKey(fileURL);
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
    if (!this.directoryService.isInEncryptedDirectory(fileURL)) {
      throw new NotACryptpadUrlException(
        `Cannot encrypt ${fileURL} if it is not in an encrypted directory`
      );
    }
    const file = await this.fileService.readFile(fileURL);
    return this.decryptFile(file, fileURL);
  }

  async readAndDecryptFileWithKey(fileURL: string, key: string): Promise<Blob> {
    if (!this.directoryService.isInEncryptedDirectory(fileURL)) {
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
    if (!this.directoryService.isInEncryptedDirectory(fileURL)) {
      throw new NotACryptpadUrlException(
        `Cannot encrypt ${fileURL} if it is not in an encrypted directory`
      );
    }
    const encryptedFile = await this.encryptFile(file, fileURL);

    return this.fileService.writeFile(encryptedFile, fileURL);
  }
}
