import { Component, HostBinding, OnInit } from '@angular/core';
import { SolidFileHandlerService } from './services/file-handler/solid-file-handler.service';
import { MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';
import { RedirectService } from './services/redirect/redirect.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {
  link = '';

  @HostBinding('class') className = window.localStorage.getItem('darkMode');

  constructor(
    private solidFileHandler: SolidFileHandlerService,
    private matIconRegistry: MatIconRegistry,
    private domSanitizer: DomSanitizer,
    private redirect: RedirectService
  ) {}

  toggleDarkMode(darkModeOff: boolean) {
    this.className = darkModeOff ? '' : 'darkMode';
    window.localStorage.setItem('darkMode', this.className);
  }

  ngOnInit(): void {
    this.matIconRegistry.addSvgIcon(
      'solid',
      this.domSanitizer.bypassSecurityTrustResourceUrl(
        // TODO: figure out a path that works for the deployment and development
        './assets/solid-emblem.svg'
      )
    );

    this.redirect.tryRedirect();
  }
}
