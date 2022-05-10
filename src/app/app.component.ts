import { Component, HostBinding } from '@angular/core';
import { SolidFileHandlerService } from './services/file_handler/solid-file-handler.service';
import { MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  link = '';

  @HostBinding('class') className = '';

  constructor(
    private solidFileHandler: SolidFileHandlerService,
    private matIconRegistry: MatIconRegistry,
    private domSanitizer: DomSanitizer
  ) {
    this.matIconRegistry.addSvgIcon(
      'solid',
      this.domSanitizer.bypassSecurityTrustResourceUrl(
        '../assets/solid-emblem.svg'
      )
    );
  }

  toggleDarkMode(darkModeOff: boolean) {
    this.className = darkModeOff ? '' : 'darkMode';
  }
}
