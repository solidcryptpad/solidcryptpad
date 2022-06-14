import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatSlideToggleChange } from '@angular/material/slide-toggle';
import { firstValueFrom } from 'rxjs';
import { KeystoreService } from 'src/app/services/encryption/keystore/keystore.service';
import { SolidAuthenticationService } from '../../services/authentication/solid-authentication.service';
import { ChangePasswordComponent } from '../dialogs/change-password/change-password.component';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss'],
})
export class NavbarComponent implements OnInit {
  constructor(
    private solidAuthenticationService: SolidAuthenticationService,
    private dialog: MatDialog,
    private keyStoreService: KeystoreService
  ) {}
  @Output() darkModeToggleEvent: EventEmitter<boolean> =
    new EventEmitter<boolean>();

  toggleControl = new FormControl(false);

  ngOnInit(): void {
    const darkModeEnabled =
      window.localStorage.getItem('darkMode') === 'darkMode';

    this.toggleControl.setValue(darkModeEnabled);

    this.toggleControl.valueChanges.subscribe(() =>
      this.darkModeToggleEvent.emit(darkModeEnabled)
    );
  }

  toggleDarkMode(event: MatSlideToggleChange) {
    this.toggleControl.valueChanges.subscribe(() => {
      this.darkModeToggleEvent.emit(event.checked);
    });
  }

  logout() {
    this.solidAuthenticationService.logout();
  }

  async changeMasterPassword() {
    const dialogRef = this.dialog.open(ChangePasswordComponent, {});

    return await firstValueFrom(dialogRef.afterClosed());
  }
}
