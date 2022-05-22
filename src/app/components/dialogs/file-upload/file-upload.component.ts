import { Component, ElementRef, Inject, ViewChild } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { setErrorContext } from 'src/app/exceptions/error-options';
import { SolidFileHandlerService } from 'src/app/services/file-handler/solid-file-handler.service';

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

  constructor(
    @Inject(MAT_DIALOG_DATA) private data: FileUploadData,
    private dialogRef: MatDialogRef<FileUploadComponent>,
    private fileService: SolidFileHandlerService
  ) {}

  async uploadFiles(): Promise<void> {
    for (const file of this.files) {
      await this.uploadFile(file);
    }
    this.close();
  }

  async uploadFile(file: File): Promise<void> {
    const url = this.data.folder.url + file.name;
    await this.fileService
      .writeAndEncryptFile(file, url)
      .catch(setErrorContext('could not upload file'));
  }

  handleChange(e: Event) {
    const fileInput = e.currentTarget as HTMLInputElement;
    this.files = Array.from(fileInput.files || []);
  }

  close(): void {
    this.dialogRef.close();
  }
}
