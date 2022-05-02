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
  filename = '';
  provider!: WebrtcProvider;
  ydoc!: Y.Doc;

  constructor(
    private profileService: ProfileService,
    private fileService: SolidFileHandlerService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe((params) => {
      this.filename = params['file'];
      if (
        this.filename === null ||
        this.filename === undefined ||
        this.filename === ''
      ) {
        console.debug('no filename given');
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
    this.ydoc = new Y.Doc();
    this.provider = new WebrtcProvider(this.getRoomName(), this.ydoc);

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

    this.profileService.getPodUrls().then((podUrls) => {
      this.baseUrl = podUrls[0];
      console.debug('using URL:  ' + this.getUrl());

      const updateYdoc = fromEvent(this.ydoc, 'update');
      const result = updateYdoc.pipe(debounceTime(1000));
      result.subscribe(() => {
        if (!this.readyForSave) {
          return;
        }
        this.saveFile();
      });

      this.loadFile();
    });
  }

  /**
   * saves the current file that is open in editor
   */
  saveFile(): void {
    console.debug('saving file');
    const data = this.html;
    const blob = new Blob([data], { type: 'text/plain' });
    this.fileService.writeAndEncryptFile(blob, this.getUrl());
  }

  /**
   * loads the current file that is open in editor
   */
  loadFile(): void {
    this.fileService.readAndDecryptFile(this.getUrl()).then(
      (blob) => {
        blob.text().then((text) => {
          this.html = text;
          this.readyForSave = true;
        });
      },
      (reason) => {
        if (reason instanceof NotFoundException) {
          console.debug('file not found, creating file');
          this.readyForSave = true;
          this.saveFile();
          return;
        }
        console.error('couldnt load file: ' + reason);
      }
    );
  }

  /**
   * closes the current file with saving it
   */
  closeFile(): void {
    this.readyForSave = false;
    this.saveFile();
    this.closeEditor();
    this.html = '';
    this.router.navigate(['/editor'], { queryParams: { filename: '' } });
  }

  /**
   * closes editor and ydoc
   */
  closeEditor(): void {
    this.provider?.disconnect();
    this.ydoc?.destroy();
    this.editor?.destroy();
  }

  /**
   * @return the url for the current opened file
   */
  getUrl(): string {
    return this.baseUrl + 'private/solidcryptpad/' + this.filename;
  }

  /**
   * @return the room name for the current opened file
   */
  getRoomName(): string {
    return 'room-' + this.getUrl();
  }

  /**
   * @return the room pw for the current opened file
   */
  getRoomPassword(): string {
    return 'pw-' + this.getUrl(); //TODO generate room pw
  }

  ngOnDestroy(): void {
    this.closeEditor();
  }
}
