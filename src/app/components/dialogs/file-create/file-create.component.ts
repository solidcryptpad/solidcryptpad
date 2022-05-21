import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { FolderCreateComponent } from '../folder-create/folder-create.component';
import { Node } from '../../tree-nested-explorer/tree-nested-explorer.component';

@Component({
  selector: 'app-file-create',
  templateUrl: './file-create.component.html',
  styleUrls: ['./file-create.component.scss'],
})
export class FileCreateComponent {
  file_name = '';

  constructor(
    @Inject(MAT_DIALOG_DATA) private node: Node,
    private router: Router,
    private dialogRef: MatDialogRef<FolderCreateComponent>
  ) {}

  async createFile(): Promise<void> {
    this.router.navigateByUrl(
      `/editor?file=${this.node.link}${this.file_name}`
    );
    this.close();
  }

  close(): void {
    this.dialogRef.close();
  }
}
