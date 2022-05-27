import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { UserActionAbortedException } from 'src/app/exceptions/user-action-aborted-exception';

@Component({
  selector: 'app-set-master-password',
  templateUrl: './set-master-password.component.html',
  styleUrls: ['./set-master-password.component.scss'],
})
export class SetMasterPasswordComponent {
  constructor(
    public dialogRef: MatDialogRef<SetMasterPasswordComponent>,
    @Inject(MAT_DIALOG_DATA) public mpwd: string,
    @Inject(MAT_DIALOG_DATA) public mpwdConfirm: string
  ) {}

  onNoClick(): void {
    this.dialogRef.close();
    throw new UserActionAbortedException('Master password not set');
  }

  validate(): boolean {
    if (!this.mpwd) {
      return false;
    }
    return this.mpwd == this.mpwdConfirm;
  }
}
