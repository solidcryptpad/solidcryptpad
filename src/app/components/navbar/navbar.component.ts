import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatSlideToggleChange } from '@angular/material/slide-toggle';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss'],
})
export class NavbarComponent implements OnInit {
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
}
