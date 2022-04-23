import { Component } from '@angular/core';
import { SolidFileHandlerService } from '../../services/file_handler/solid-file-handler.service';

@Component({
  selector: 'app-file-editor',
  templateUrl: './file-editor.component.html',
  styleUrls: ['./file-editor.component.scss'],
})
export class FileEditorComponent {
  fileContent = 'no content';
  newFileContent = '';
  link = '';
  newlink = '';

  constructor(private solidFileHandler: SolidFileHandlerService) {}

  async sendRequest(link: string): Promise<void> {
    const x = await this.solidFileHandler.readFile(link);
    this.fileContent = await x.text();
    //x.then((y) => y.text().then((z) => this.showContent=(z)));
  }

  async sendFile(link: string): Promise<void> {
    const blob = new Blob([this.newFileContent], { type: 'text/plain' });
    await this.solidFileHandler.writeFile(blob, link);
  }
}
