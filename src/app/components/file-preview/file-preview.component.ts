import { Component, OnInit, SecurityContext } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FileEncryptionService } from 'src/app/services/encryption/file-encryption/file-encryption.service';
import { SolidPermissionService } from '../../services/solid-permission/solid-permission.service';
import { DomSanitizer } from '@angular/platform-browser';
import { marked } from 'marked';

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
  isWriteable: boolean | undefined;
  loading = false;

  constructor(
    private fileEncryptionService: FileEncryptionService,
    private route: ActivatedRoute,
    private router: Router,
    private sanitizer: DomSanitizer,
    private permissionService: SolidPermissionService
  ) {}

  async ngOnInit(): Promise<void> {
    this.loading = true;
    this.setupFilenameFromParams();
    await this.loadDecryptedFile();
    this.isWriteable = await this.permissionService.hasWritePermissions(
      this.fileUrl
    );
    this.loading = false;
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
    });
  }

  /**
   * loads the current file and decrypted the File
   */
  async loadDecryptedFile(): Promise<void> {
    await this.fileEncryptionService.readAndDecryptFile(this.fileUrl).then(
      (blob) => {
        this.fileType = blob.type;
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
        console.error('couldnt load file', reason);
      }
    );
  }

  /**
   * Get Text File Content from Blob
   * @param blob
   */
  async getTextFileContent(blob: Blob): Promise<void> {
    this.textFileContent = this.sanitizeHtmlContent(marked(await blob.text()));
  }

  /**
   * Get Image Url from Blob
   * @param blob
   */
  getImageUrlFromBlob(blob: Blob): void {
    const reader = new FileReader();
    reader.readAsDataURL(blob);
    reader.onload = () => {
      this.imageUrl = reader.result; //url declared earlier
    };
  }

  /**
   * sanitize Html Content
   * @param htmlstring sanitized Html Content
   */
  public sanitizeHtmlContent(htmlstring: string): string {
    let content = this.sanitizer.sanitize(SecurityContext.HTML, htmlstring);
    if (content === null) {
      content = '';
    }
    return content;
  }

  open(link: string) {
    this.router.navigateByUrl(`/editor?file=${link}`);
  }
}
