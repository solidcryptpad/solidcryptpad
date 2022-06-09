import { Injectable } from '@angular/core';
import { EncryptionService } from '../encryption/encryption.service';
import { firstValueFrom } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import { SetMasterPasswordComponent } from 'src/app/components/set-master-password/set-master-password.component';
import { EnterMasterPasswordComponent } from 'src/app/components/enter-master-password/enter-master-password.component';
import { WrongMasterPasswordException } from 'src/app/exceptions/wrong-master-password-exception';

@Injectable({
  providedIn: 'root',
})
export class MasterPasswordService {
  // key in localStorage
  private readonly masterPasswordHashKey: string = 'masterPasswordHash';

  constructor(
    private encryptionService: EncryptionService,
    private dialog: MatDialog
  ) {}

  async setMasterPassword(pwd: string) {
    if (pwd) {
      localStorage.setItem(
        this.masterPasswordHashKey,
        this.encryptionService.SHA256Salted(pwd)
      );
    }
  }

  async getMasterPassword(): Promise<string> {
    if (!localStorage.getItem(this.masterPasswordHashKey)) {
      this.setMasterPassword(await this.openMasterPasswordDialog());
    }
    const masterPasswordHash = localStorage.getItem(this.masterPasswordHashKey);

    if (!masterPasswordHash) {
      throw new WrongMasterPasswordException('Master password not set');
    }

    return masterPasswordHash;
  }

  async openMasterPasswordDialog(): Promise<string> {
    const dialogRef = this.dialog.open(EnterMasterPasswordComponent, {});

    return await firstValueFrom(dialogRef.afterClosed());
  }

  async openSetMasterPasswordDialog(): Promise<string> {
    const dialogRef = this.dialog.open(SetMasterPasswordComponent, {});

    return await firstValueFrom(dialogRef.afterClosed());
  }

  checkMasterPasswordNotSet(): boolean {
    return !localStorage.getItem(this.masterPasswordHashKey);
  }
}
