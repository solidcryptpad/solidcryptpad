import { Component, HostListener, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { SolidFileHandlerService } from 'src/app/services/file-handler/solid-file-handler.service';
import { Node } from '../../tree-nested-explorer/folder-data-source.class';
import { FormControl, Validators } from '@angular/forms';

@Component({
  selector: 'app-folder-create',
  templateUrl: './folder-create.component.html',
  styleUrls: ['./folder-create.component.scss'],
})
export class FolderCreateComponent {
  folderCreateFormControl = new FormControl('', [Validators.required]);

  constructor(
    @Inject(MAT_DIALOG_DATA) private node: Node,
    private dialogRef: MatDialogRef<FolderCreateComponent>,
    private fileService: SolidFileHandlerService
  ) {}

  @HostListener('window:keyup.Enter')
  async createFolder(): Promise<void> {
    if (this.folderCreateFormControl.value) {
      await this.fileService.writeContainer(
        this.node.link + this.folderCreateFormControl.value
      );
      this.close();
    }
  }

  close(): void {
    this.dialogRef.close();
  }
}
