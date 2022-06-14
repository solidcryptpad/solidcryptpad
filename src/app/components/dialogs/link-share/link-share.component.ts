import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-link-share',
  templateUrl: './link-share.component.html',
  styleUrls: ['./link-share.component.scss'],
})
export class LinkShareComponent {
  constructor(
    public dialogRef: MatDialogRef<LinkShareComponent>,
    @Inject(MAT_DIALOG_DATA) public data: string
  ) {}

  cancel(): void {
    this.dialogRef.close();
  }
}
