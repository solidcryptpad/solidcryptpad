import { Component } from '@angular/core';
import { SolidFileHandlerService } from 'src/app/services/file_handler/solid-file-handler.service';

@Component({
  selector: 'app-upload',
  templateUrl: './upload.component.html',
  styleUrls: ['./upload.component.scss'],
})
export class UploadComponent {
  constructor(private solidFileHandler: SolidFileHandlerService) {
    this.sendRequest('https://mimi.solidweb.org/public/testpy/hello.txt');
  }

  sendRequest(link: string) {
    const x = this.solidFileHandler.readFile(link);
    x.then((y) => y.text().then((z) => console.log(z)));
  }
}
