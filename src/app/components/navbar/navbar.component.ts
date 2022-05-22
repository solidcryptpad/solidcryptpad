import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatSlideToggleChange } from '@angular/material/slide-toggle';
import { SolidAuthenticationService } from '../../services/authentication/solid-authentication.service';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss'],
})
export class NavbarComponent implements OnInit {
  constructor(private solidAuthenticationService: SolidAuthenticationService) {}
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
}
