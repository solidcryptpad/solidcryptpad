import { Component, HostListener, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { Node } from '../../tree-nested-explorer/folder-data-source.class';
import { FormControl, Validators } from '@angular/forms';

@Component({
  selector: 'app-file-create',
  templateUrl: './file-create.component.html',
  styleUrls: ['./file-create.component.scss'],
})
export class FileCreateComponent {
  fileCreateFormControl = new FormControl('', [Validators.required]);

  constructor(
    @Inject(MAT_DIALOG_DATA) private node: Node,
    private router: Router,
    private dialogRef: MatDialogRef<FileCreateComponent>
  ) {}

  @HostListener('window:keyup.Enter')
  async createFile(): Promise<void> {
    if (this.fileCreateFormControl.value) {
      await this.router.navigateByUrl(
        `/editor?file=${this.node.link}${this.fileCreateFormControl.value}`
      );
      this.close();
    }
  }

  close(): void {
    this.dialogRef.close();
  }
}
