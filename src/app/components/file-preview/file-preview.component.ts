import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { SolidFileHandlerService } from '../../services/file-handler/solid-file-handler.service';

@Component({
  selector: 'app-file-preview',
  templateUrl: './file-preview.component.html',
  styleUrls: ['./file-preview.component.scss'],
})
export class FilePreviewComponent implements OnInit {
  fileUrl = '';
  textFileContent = 'no content';
  fileType = '';
  errorMsg = '';
  imageUrl: string | ArrayBuffer | null | undefined;
  key = '';
  keyInUrl: boolean;
  group = '';

  constructor(
    private fileService: SolidFileHandlerService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.keyInUrl = false;
  }

  ngOnInit(): void {
    this.setupFilenameFromParams();
    // this.loadFile();
    this.loadDecryptedFile();
  }

  setupFilenameFromParams(): void {
    this.route.queryParams.subscribe((params) => {
      this.fileUrl = params['url'];
      if (
        this.fileUrl === null ||
        this.fileUrl === undefined ||
        this.fileUrl === ''
      ) {
        console.debug('no filename given');
        //Redirect to files
      }

      if (params['key']) {
        this.keyInUrl = true;
        this.key = params['key'];
      }

      if (params['group']) {
        this.group = params['group'];
      }
    });
  }

  /**
   * loads the current file and decrypted the File
   */
  loadDecryptedFile(): void {
    let readFile;

    if (this.keyInUrl) {
      readFile = this.fileService.readAndDecryptFileWithKey(
        this.fileUrl,
        atob(this.key)
      );
    } else {
      readFile = this.fileService.readAndDecryptFile(this.fileUrl);
    }

    readFile.then(
      (blob) => {
        this.fileType = blob.type;
        console.log('Preview for File with ContentType: ' + this.fileType);
        if (this.fileType.includes('text')) {
          this.getTextFileContent(blob);
        } else if (this.fileType.includes('image')) {
          this.getImageUrlFromBlob(blob);
        } else {
          this.errorMsg = 'No Preview for ContentType: ' + this.fileType;
        }
      },
      (reason) => {
        this.errorMsg = 'Error while opening your file: ' + reason;
        console.error('couldnt load file: ' + reason);
      }
    );
  }

  /**
   * Get Text File Content from Blob
   * @param blob
   */
  getTextFileContent(blob: Blob): void {
    blob.text().then((text) => {
      this.textFileContent = text;
    });
  }

  /**
   * Get Image Url from Blob
   * @param blob
   */
  getImageUrlFromBlob(blob: Blob): void {
    const reader = new FileReader();
    reader.readAsDataURL(blob); //FileStream response from .NET core backend
    // eslint-disable-next-line unused-imports/no-unused-vars
    reader.onload = (_event) => {
      this.imageUrl = reader.result; //url declared earlier
    };
  }

  open(link: string) {
    this.router.navigateByUrl(`/editor?file=${link}`);
  }

  isWriteable() {
    return this.group.includes('WRITE');
  }
}
