import { Component, OnDestroy, OnInit, SecurityContext } from '@angular/core';
import { Editor } from 'ngx-editor';
import * as Y from 'yjs';
import { WebrtcProvider } from 'y-webrtc';
import {
  ySyncPlugin,
  yCursorPlugin,
  yUndoPlugin,
  undo,
  redo,
} from 'y-prosemirror';
import { keymap } from 'prosemirror-keymap';
import { ProfileService } from '../../services/profile/profile.service';
import { FileEncryptionService } from 'src/app/services/encryption/file-encryption/file-encryption.service';
import { YXmlFragment } from 'yjs/dist/src/types/YXmlFragment';
import { fromEvent, debounceTime, filter } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { NotFoundException } from '../../exceptions/not-found-exception';
import { MatDialog } from '@angular/material/dialog';
import { FileShareComponent } from '../dialogs/file-share/file-share.component';
import { DomSanitizer } from '@angular/platform-browser';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import ColorHash from 'color-hash';
import { NotificationService } from '../../services/notification/notification.service';
import { SolidFileHandlerService } from '../../services/file-handler/solid-file-handler.service';
import { KeyService } from 'src/app/services/encryption/key/key.service';
import { DirectoryStructureService } from 'src/app/services/directory-structure/directory-structure.service';
import { marked } from 'marked';

@Component({
  selector: 'app-text-editor',
  templateUrl: './text-editor.component.html',
  styleUrls: ['./text-editor.component.scss'],
})
export class TextEditorComponent implements OnInit, OnDestroy {
  editor!: Editor;
  html = '';
  readyForSave = false;
  xmlFragement: YXmlFragment | undefined;
  baseUrl = '';
  fileUrl = '';
  sharedKey = '';
  errorMsg = '';
  provider!: WebrtcProvider;
  ydoc!: Y.Doc;
  autoSave = true;
  sharedFile = false;
  fileLoaded = false;
  fileType = 'text/plain';

  constructor(
    private profileService: ProfileService,
    private directoryService: DirectoryStructureService,
    private fileEncryptionService: FileEncryptionService,
    private solidFileHandlerService: SolidFileHandlerService,
    private keyService: KeyService,
    private route: ActivatedRoute,
    private router: Router,
    private dialog: MatDialog,
    private sanitizer: DomSanitizer,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    this.setupBaseUrl();
  }

  setupBaseUrl(): void {
    this.directoryService.getRootDirectory().then((rootUrl) => {
      this.baseUrl = rootUrl;
      this.setupSharedFileKey();
      this.setupFilenameFromParams();
      this.setSharedFile();
    });
  }

  setupFilenameFromParams(): void {
    this.route.queryParams.subscribe(async (params) => {
      this.fileUrl = params['file'];

      const fileToCreate = params['fileToCreate'];
      if (fileToCreate) {
        this.fileUrl = fileToCreate;
        await this.saveFile();
      }

      if (!this.fileUrl) {
        this.closeEditor();
        this.notificationService.error({
          title: '',
          message: 'No Filename given. Select a file to edit it.',
        });
        this.router.navigate(['/files']);
      } else {
        this.setupEditor();
      }
    });
  }

  setupSharedFileKey(): void {
    this.route.queryParams.subscribe((params) => {
      const key = params['key'];
      if (key) {
        this.sharedKey = atob(key);
      }
    });
  }

  /**
   * prepares the editor for the current file
   * https://github.com/yjs/y-prosemirror#utilities
   */
  async setupEditor(): Promise<void> {
    this.closeEditor();
    this.ydoc = new Y.Doc();
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    this.provider = new WebrtcProvider(this.getRoomName(), this.ydoc, {
      password: await this.getRoomPassword(),
    });

    this.profileService.getUserName().then((value) => {
      this.setUsername(value);
    });

    this.xmlFragement = this.ydoc.getXmlFragment('prosemirror');

    this.editor = new Editor({
      history: false, // include the history plugin manually
      plugins: [
        ySyncPlugin(this.xmlFragement),
        yCursorPlugin(this.provider.awareness),
        yUndoPlugin(),
        keymap({
          'Mod-z': undo,
          'Mod-y': redo,
          'Mod-Shift-z': redo,
        }),
      ],
    });

    fromEvent(this.ydoc, 'update')
      .pipe(
        debounceTime(1000),
        filter(() => this.readyForSave && this.autoSave)
      )
      .subscribe(() => this.saveFile());

    this.loadFile();
  }

  /**
   * saves the current file that is open in editor
   */
  async saveFile(): Promise<void> {
    const url = this.fileUrl;
    const data = this.sanitizeHtmlContent(this.html);
    const blob = new Blob([data], { type: this.fileType });
    await this.fileEncryptionService.writeAndEncryptFile(blob, url);
  }

  handleReadFile(blob: Blob): void {
    this.fileType = blob.type;
    if (this.fileType === '' || this.fileType === 'application/octet-stream') {
      this.fileType =
        this.solidFileHandlerService.guessContentType(this.fileUrl) ??
        'text/plain';
    }
    blob.text().then((text) => {
      text = marked(text);
      this.html = this.sanitizeHtmlContent(text);
      this.readyForSave = true;
      this.fileLoaded = true;
      this.editor.commands.focus().exec();
    });
  }

  handleReadFileError(reason: Error): void {
    if (reason instanceof NotFoundException) {
      console.debug('file not found, creating file');
      this.readyForSave = true;
      this.saveFile();
      return;
    } else {
      this.errorMsg = 'Error while opening your file: ' + reason;
    }
    console.error('couldnt load file', reason);
  }

  setUsername(username: string): void {
    const colorHash = new ColorHash();
    const color = colorHash.hex(username);
    this.provider.awareness.setLocalStateField('user', {
      color: color,
      name: username,
    });
  }

  /**
   * loads the current file that is open in editor
   */
  loadFile(): void {
    if (this.sharedKey) {
      this.fileEncryptionService
        .readAndDecryptFileWithKey(this.fileUrl, this.sharedKey)
        .then(
          (blob) => {
            this.fileType = blob.type;
            this.handleReadFile(blob);
          },
          (reason) => {
            this.handleReadFileError(reason);
          }
        );
    } else {
      this.fileEncryptionService.readAndDecryptFile(this.fileUrl).then(
        (blob) => {
          this.handleReadFile(blob);
        },
        (reason) => {
          this.handleReadFileError(reason);
        }
      );
    }
  }

  /**
   * closes the current file with saving it
   */
  async closeFile(saveFile: boolean): Promise<void> {
    this.fileLoaded = false;
    this.readyForSave = false;
    if (saveFile) {
      await this.saveFile();
      this.notificationService.success({ title: '', message: 'File saved!' });
    }
    this.closeEditor();
    this.html = '';
    //this.router.navigate(['/editor'], { queryParams: { filename: '' } });
    this.router.navigate(['/preview'], { queryParams: { url: this.fileUrl } });
  }

  async shareFile() {
    this.dialog.open(FileShareComponent, {
      data: {
        fileUrl: this.fileUrl,
      },
    });
  }

  /**
   * closes editor and ydoc
   */
  closeEditor(): void {
    this.errorMsg = '';
    this.provider?.disconnect();
    this.ydoc?.destroy();
    this.editor?.destroy();
  }

  /**
   * @return the room name for the current opened file
   */
  getRoomName(): string {
    return 'room-' + this.fileUrl;
  }

  /**
   * @return the room pw for the current opened file
   */
  getRoomPassword(): Promise<string> {
    return this.keyService.getKey(this.fileUrl);
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

  setSharedFile(): void {
    this.sharedFile = !this.fileUrl.includes(this.baseUrl);
  }

  ngOnDestroy(): void {
    this.closeEditor();
  }
}
