import { Component } from '@angular/core';
import { SolidFileHandlerService } from '../../services/file_handler/solid-file-handler.service';
import { NotificationService } from 'src/app/services/notification/notification.service';

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

  constructor(
    private solidFileHandler: SolidFileHandlerService,
    private notificationService: NotificationService
  ) {}

  async sendRequest(link: string): Promise<void> {
    try {
      const x = await this.solidFileHandler.readFile(link);
      this.fileContent = await x.text();
    } catch (error: any) {
      this.notificationService.error({
        title: error.title,
        message: error.message,
      });
    }
  }

  async sendFile(link: string): Promise<void> {
    try {
      const blob = new Blob([this.newFileContent], { type: 'text/plain' });
      await this.solidFileHandler.writeFile(blob, link);
    } catch (error: any) {
      this.notificationService.error({
        title: error.title,
        message: error.message,
      });
    }
  }
}
