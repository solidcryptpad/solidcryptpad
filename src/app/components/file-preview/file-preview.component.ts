import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { SolidFileHandlerService } from '../../services/file-handler/solid-file-handler.service';

@Component({
  selector: 'app-file-preview',
  templateUrl: './file-preview.component.html',
  styleUrls: ['./file-preview.component.scss'],
})
export class FilePreviewComponent {
  fileUrl = 'test';
  fileContent = '##no content';
  fileType = '';
  errorMsg = '';

  constructor(
    private fileService: SolidFileHandlerService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.setupFilenameFromParams();
    this.loadFile();
  }

  setupFilenameFromParams(): void {
    this.route.queryParams.subscribe((params) => {
      this.fileUrl = params['file'];
      if (
        this.fileUrl === null ||
        this.fileUrl === undefined ||
        this.fileUrl === ''
      ) {
        console.debug('no filename given');
        //Redirect to files
      }
    });
  }

  /**
   * loads the current file that is open in editor
   */
  loadFile(): void {
    console.log(this.fileUrl);
    this.fileService.readFile(this.fileUrl).then(
      (blob) => {
        console.log(blob.type);

        this.fileType = blob.type;
        if (this.fileType == 'text/plain') {
          blob.text().then((text) => {
            console.log(text);
            this.getTextFileContent(text);
          });
        } else if (this.fileType == 'text/markdown') {
          blob.text().then((text) => {
            this.getMarkdownFileContent(text);
          });
        } else if (this.fileType == 'text/html') {
          blob.text().then((text) => {
            this.getHTMLFileContent(text);
          });
        } else if (this.fileType.includes('image')) {
        } else {
          this.fileContent = 'File Type not supported';
        }
      },
      (reason) => {
        this.errorMsg = 'Error while opening your file: ' + reason;
        console.error('couldnt load file: ' + reason);
      }
    );
  }

  getTextFileContent(content: string): void {
    this.fileContent = content;
    console.log(this.fileContent);
  }

  getMarkdownFileContent(content: string): void {
    this.fileContent = content;
    console.log(this.fileContent);
  }
  getHTMLFileContent(content: string): void {
    this.fileContent = content;
    console.log(this.fileContent);
  }

  open(link: string) {
    this.router.navigateByUrl(`/editor?file=${link}`);
  }
}
