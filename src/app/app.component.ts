import { Component } from '@angular/core';
import { SolidFileHandlerService } from './services/file_handler/solid-file-handler.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  showContent = 'no content';
  link = '';
  constructor(private solidFileHandler: SolidFileHandlerService) {}
}
