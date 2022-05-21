import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-enter-master-password',
  templateUrl: './enter-master-password.component.html',
  styleUrls: ['./enter-master-password.component.scss'],
})
export class EnterMasterPasswordComponent {
  constructor(
    public dialogRef: MatDialogRef<EnterMasterPasswordComponent>,
    @Inject(MAT_DIALOG_DATA) public data: string
  ) {}

  onNoClick(): void {
    this.dialogRef.close();
  }
}
