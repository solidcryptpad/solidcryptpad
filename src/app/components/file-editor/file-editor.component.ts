import { Component } from '@angular/core';
import { SolidFileHandlerService } from '../../services/file_handler/solid-file-handler.service';
import { NotificationService } from 'src/app/services/notification/notification.service';

@Component({
  selector: 'app-file-editor',
  templateUrl: './file-editor.component.html',
  styleUrls: ['./file-editor.component.scss'],
})
/**
 * This component is a simple example for uploading and downloading and will be replaced in the future
 */
export class FileEditorComponent {
  fileContent = 'no content';
  newFileContent = '';
  link = '';
  newlink = '';
  uploadLink = ''; // link the new file will be uploaded to
  folderLink = '';
  file: FileList = { length: 0, item: () => null }; // list of uploaded files

  constructor(
    private solidFileHandler: SolidFileHandlerService,
    private notificationService: NotificationService
  ) {}

  async sendRequest(link: string): Promise<void> {
    const x = await this.solidFileHandler.readFile(link);
    this.fileContent = await x.text();
  }

  async sendFile(link: string): Promise<void> {
    const blob = new Blob([this.newFileContent], { type: 'text/plain' });
    await this.solidFileHandler.writeFile(blob, link);
  }

  selectFile(event: any) {
    if (event.target == null) return;
    else {
      this.file = event.target.files;

      if (event.target.files.length != 1) {
        this.notificationService.info({
          title: 'multiple files choosen',
          message: 'they will be uploaded as a folder',
        });
      }
    }
  }

  /**
   * uploads a file to the given pod
   * @param file the file to upload
   * @param link the link to the solid pod
   */
  async uploadFile(file: File, link: string): Promise<void> {
    await (await this.solidFileHandler.writeFile(file, link, file.name)).text();
    this.notificationService.success({
      title: 'upload',
      message: 'success',
    });
  }

  /**
   * uploads multiple files to a solid pod
   * @param files the files to upload
   * @param link the link to upload them
   */
  async uploadFiles(files: FileList, link: string): Promise<void> {
    if (files.length == 0) {
      this.notificationService.info({
        title: 'no file selected',
        message: 'please select one or more files',
      });
    } else if (files.length == 1) {
      await this.uploadFile(files[0], link);
    } else {
      // this is currently untested because my browser-setup seems to not allow to upload more then one file
      // will change anyway as soon as the overwriteFile bug workaround is in
      for (let i = 0; i < files.length; i++) {
        let flink;
        if (link.endsWith('/')) flink = link + `${files[0].name}`;
        else flink = link + `/${files[0].name}`;

        await this.uploadFile(files[i], flink);
      }
    }
  }

  /**
   * creates a folder at the given location
   * @param link the link to create the folder on
   */
  async createFolder(link: string): Promise<void> {
    await this.solidFileHandler.writeContainer(link);

    this.notificationService.success({
      title: 'created',
      message: 'success',
    });
  }
}
