import { Component, ElementRef, Inject, ViewChild } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { throwWithContext } from 'src/app/exceptions/error-options';
import { FileEncryptionService } from 'src/app/services/encryption/file-encryption/file-encryption.service';
import { SolidFileHandlerService } from 'src/app/services/file-handler/solid-file-handler.service';
import { marked } from 'marked';

interface FileUploadData {
  folder: {
    url: string;
  };
}

@Component({
  selector: 'app-file-upload',
  templateUrl: './file-upload.component.html',
  styleUrls: ['./file-upload.component.scss'],
})
export class FileUploadComponent {
  @ViewChild('file_input')
  input: ElementRef<HTMLInputElement> | undefined;
  files: File[] = [];

  @ViewChild('fileDropRef', { static: false }) fileDropEl:
    | ElementRef
    | undefined;

  constructor(
    @Inject(MAT_DIALOG_DATA) private data: FileUploadData,
    private dialogRef: MatDialogRef<FileUploadComponent>,
    private fileService: SolidFileHandlerService,
    private fileEncryptionService: FileEncryptionService
  ) {}

  async uploadFiles(): Promise<void> {
    for (const file of this.files) {
      await this.uploadFile(file);
    }
    this.close();
  }

  async uploadFile(file: File): Promise<void> {
    const url = this.data.folder.url + file.name;
    const contentType = this.fileService.guessContentType(file.name);
    let blob;
    if (contentType === 'text/plain') {
      const text = await file.text();
      blob = new Blob([marked(text, { breaks: true })], { type: 'text/plain' });
    } else {
      blob = file.slice(0, file.size, contentType || undefined);
    }

    await this.fileEncryptionService
      .writeAndEncryptFile(blob, url)
      .catch(throwWithContext('could not upload file'));
  }

  handleChange(e: Event) {
    const fileInput = e.currentTarget as HTMLInputElement;
    this.files = Array.from(fileInput.files || []);
  }

  handleDrop(files: FileList) {
    this.files = Array.from(files);
  }

  close(): void {
    this.dialogRef.close();
  }

  /**
   * Remove file from list
   * @param index of file to be removed
   */
  deleteFile(index: number) {
    this.files.splice(index, 1);
  }

  /**
   * format bytes
   * @param bytes (File size in bytes)
   * @param decimals (Decimals point)
   */
  formatBytes(bytes: number, decimals = 2) {
    if (bytes === 0) {
      return '0 Bytes';
    }
    const k = 1024;
    const dm = decimals <= 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  }
}
