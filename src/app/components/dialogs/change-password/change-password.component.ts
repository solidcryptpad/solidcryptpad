import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { EncryptionService } from 'src/app/services/encryption/encryption/encryption.service';
import { KeystoreService } from 'src/app/services/encryption/keystore/keystore.service';
import { MasterPasswordService } from 'src/app/services/encryption/master-password/master-password.service';
import { NotificationService } from 'src/app/services/notification/notification.service';

@Component({
  selector: 'app-change-password',
  templateUrl: './change-password.component.html',
  styleUrls: ['./change-password.component.scss'],
})
export class ChangePasswordComponent {
  public old_password = '';
  public new_password = '';
  public repeated_password = '';

  constructor(
    private dialogRef: MatDialogRef<ChangePasswordComponent>,
    private masterPasswordService: MasterPasswordService,
    private encryptionService: EncryptionService,
    private notificationService: NotificationService,
    private keystoreService: KeystoreService
  ) {}

  async changePassword() {
    const p_hash = this.encryptionService.SHA256Salted(this.old_password);

    if ((await this.masterPasswordService.getMasterPassword()) != p_hash) {
      this.notificationService.error({
        title: 'Password error',
        message: 'old password does not match',
      });
      this.dialogRef.close();
      return;
    }

    if (this.new_password != this.repeated_password) {
      this.notificationService.error({
        title: 'Password',
        message: 'new password not repeated correctly',
      });
      this.dialogRef.close();
      return;
    }

    await this.keystoreService.loadKeystores();
    await this.masterPasswordService.setMasterPassword(this.new_password);
    await this.keystoreService.saveKeystores();
    this.notificationService.success({
      title: 'Password',
      message: 'Password changed successfully',
    });
    this.dialogRef.close();
  }

  close() {
    this.dialogRef.close();
  }
}
