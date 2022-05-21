import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { SolidFileHandlerService } from 'src/app/services/file-handler/solid-file-handler.service';
import { Node } from '../../tree-nested-explorer/tree-nested-explorer.component';

@Component({
  selector: 'app-folder-create',
  templateUrl: './folder-create.component.html',
  styleUrls: ['./folder-create.component.scss'],
})
export class FolderCreateComponent {
  folder_name = '';

  constructor(
    @Inject(MAT_DIALOG_DATA) private node: Node,
    private fileService: SolidFileHandlerService,
    private dialogRef: MatDialogRef<FolderCreateComponent>
  ) {}

  async createFolder(): Promise<void> {
    await this.fileService.writeContainer(this.node.link + this.folder_name);
    this.close();
  }

  close(): void {
    this.dialogRef.close();
  }
}
