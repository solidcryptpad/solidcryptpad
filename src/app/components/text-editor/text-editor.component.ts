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

  constructor(
    private profileService: ProfileService,
    private fileService: SolidFileHandlerService
  ) {}

  ngOnInit(): void {
    const ydoc = new Y.Doc();
    // clients connected to the same room-name share document updates
    const provider = new WebrtcProvider('your-room-name', ydoc);

    this.xmlFragement = ydoc.getXmlFragment('prosemirror');

    //https://github.com/yjs/y-prosemirror#utilities zum speichern

    this.editor = new Editor({
      history: false, // include the history plugin manually
      plugins: [
        ySyncPlugin(this.xmlFragement),
        yCursorPlugin(provider.awareness),
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

      const updateYdoc = fromEvent(ydoc, 'update');
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
    //const data = type.toJSON(); TODO save/load via Yjs data structes
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
        console.error('couldnt load file: ' + reason);
      }
    );
  }

  /**
   * @return the url for the current opened file
   */
  getUrl(): string {
    return this.baseUrl + 'private/solidcryptpad/' + 'doc0.txt';
  }

  ngOnDestroy(): void {
    this.editor.destroy();
  }
}
