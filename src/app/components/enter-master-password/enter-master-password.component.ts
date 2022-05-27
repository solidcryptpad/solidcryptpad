import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { UserActionAbortedException } from 'src/app/exceptions/user-action-aborted-exception';

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
    throw new UserActionAbortedException('Decryption aborted');
  }
}
