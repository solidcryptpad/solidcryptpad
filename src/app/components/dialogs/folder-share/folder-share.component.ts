import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-folder-share',
  templateUrl: './folder-share.component.html',
  styleUrls: ['./folder-share.component.scss'],
})
export class FolderShareComponent {
  constructor(
    public dialogRef: MatDialogRef<FolderShareComponent>,
    @Inject(MAT_DIALOG_DATA) public data: string
  ) {}

  cancel(): void {
    this.dialogRef.close();
  }
}
