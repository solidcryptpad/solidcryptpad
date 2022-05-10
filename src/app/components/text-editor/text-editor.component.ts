import { Component, OnDestroy, OnInit } from '@angular/core';
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
import { SolidFileHandlerService } from '../../services/file_handler/solid-file-handler.service';
import { YXmlFragment } from 'yjs/dist/src/types/YXmlFragment';
import { fromEvent, debounceTime } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { NotFoundException } from '../../exceptions/not-found-exception';

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
  errorMsg = '';
  provider!: WebrtcProvider;
  ydoc!: Y.Doc;
  autoSave = true;

  constructor(
    private profileService: ProfileService,
    private fileService: SolidFileHandlerService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.setupBaseUrl();
  }

  setupBaseUrl(): void {
    this.profileService.getPodUrls().then((podUrls) => {
      this.baseUrl = podUrls[0];
      console.debug('using base url:  ' + this.baseUrl);
      this.setupFilenameFromParams();
    });
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
        this.closeEditor();
      } else {
        this.setupEditor();
      }
    });
  }

  /**
   * prepares the editor for the current file
   * https://github.com/yjs/y-prosemirror#utilities
   */
  setupEditor(): void {
    this.closeEditor();
    console.debug('setting up editor...');
    this.ydoc = new Y.Doc();
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    this.provider = new WebrtcProvider(this.getRoomName(), this.ydoc, {
      password: this.getRoomPassword(),
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

    const updateYdoc = fromEvent(this.ydoc, 'update');
    const result = updateYdoc.pipe(debounceTime(1000));
    result.subscribe(() => {
      if (!this.readyForSave || !this.autoSave) {
        return;
      }
      this.saveFile();
    });

    this.loadFile();
  }

  /**
   * saves the current file that is open in editor
   */
  saveFile(): void {
    console.debug('saving file to file url: ' + this.fileUrl);
    const data = this.html;
    const blob = new Blob([data], { type: 'text/plain' });
    this.fileService.writeAndEncryptFile(blob, this.fileUrl);
  }

  /**
   * loads the current file that is open in editor
   */
  loadFile(): void {
    this.fileService.readAndDecryptFile(this.fileUrl).then(
      (blob) => {
        blob.text().then((text) => {
          this.html = text;
          this.readyForSave = true;
          this.editor.commands.focus().exec();
        });
      },
      (reason) => {
        if (reason instanceof NotFoundException) {
          console.debug('file not found, creating file');
          this.readyForSave = true;
          this.saveFile();
          return;
        } else {
          this.errorMsg = 'Error while opening your file: ' + reason;
        }
        console.error('couldnt load file: ' + reason);
      }
    );
  }

  /**
   * closes the current file with saving it
   */
  closeFile(saveFile: boolean): void {
    this.readyForSave = false;
    if (saveFile) {
      this.saveFile();
    }
    this.closeEditor();
    this.html = '';
    this.router.navigate(['/editor'], { queryParams: { filename: '' } });
  }

  /**
   * closes editor and ydoc
   */
  closeEditor(): void {
    this.errorMsg = '';
    console.debug('resting editor...');
    this.provider?.disconnect();
    this.ydoc?.destroy();
    this.editor?.destroy();
  }

  /**
   * adds the default example directory
   * @param filename the file it should use
   * @returns string with the example directory addes to the beginning
   */
  getExampleUrl(filename: string): string {
    return this.baseUrl + 'private/cryptopad/' + filename;
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
  getRoomPassword(): string {
    return 'pw-' + this.fileUrl; //TODO generate room pw
  }

  ngOnDestroy(): void {
    this.closeEditor();
  }
}
