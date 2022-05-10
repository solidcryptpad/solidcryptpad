import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatSlideToggleChange } from '@angular/material/slide-toggle';
import { ProfileService } from 'src/app/services/profile/profile.service';
import { SolidAuthenticationService } from '../../services/authentication/solid-authentication.service';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss'],
})
export class NavbarComponent implements OnInit {
  pod_url = '';

  constructor(
    private solidAuthenticationService: SolidAuthenticationService,
    private profileService: ProfileService
  ) {
    profileService.getPodUrls().then((pods) => (this.pod_url = pods[0]));
  }
  @Output() darkModeToggleEvent: EventEmitter<boolean> =
    new EventEmitter<boolean>();

  toggleControl = new FormControl(false);

  ngOnInit(): void {
    // necessary for proper initialization, could be improved
    this.toggleControl.valueChanges.subscribe(() =>
      this.darkModeToggleEvent.emit(false)
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
