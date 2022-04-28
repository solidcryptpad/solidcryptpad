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

@Component({
  selector: 'app-text-editor',
  templateUrl: './text-editor.component.html',
  styleUrls: ['./text-editor.component.scss'],
})
export class TextEditorComponent implements OnInit, OnDestroy {
  editor!: Editor;
  html = '';
  readyForSave = false;

  constructor(
    private profileService: ProfileService,
    private fileService: SolidFileHandlerService
  ) {}

  onChange(html: object) {
    console.log(html);
  }

  ngOnInit(): void {
    const ydoc = new Y.Doc();
    // clients connected to the same room-name share document updates
    const provider = new WebrtcProvider('your-room-name', ydoc);
    //const yarray = ydoc.get('array', Y.Array);

    const type = ydoc.getXmlFragment('prosemirror');

    //https://github.com/yjs/y-prosemirror#utilities zum speichern

    this.editor = new Editor({
      history: false, // include the history plugin manually
      plugins: [
        ySyncPlugin(type),
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
      const url = podUrls[0] + 'private/solidcryptpad/' + 'doc0.txt';
      console.log('using URL:  ' + url);

      ydoc.on('update', () => {
        if (!this.readyForSave) {
          return;
        }
        console.log('saving file');
        console.log(this.html);
        //const data = type.toJSON(); TODO save/load via Yjs data structes
        const data = this.html;
        const blob = new Blob([data], { type: 'text/plain' });
        this.fileService.writeFile(blob, url);
      });

      this.fileService.readFile(url).then(
        (blob) => {
          blob.text().then((text) => {
            console.log('loading file: ' + text);
            console.log(type.length);
            //const yText = new Y.Text(text);
            //const yxmlText = new Y.XmlText(text)

            //const yxmlEle = new Y.XmlElement(text);
            // type.insert(0, [yxmlText]);
            //this.editor.commands.insertHTML(text).exec();
            this.html = text;
            this.readyForSave = true;
          });
        },
        (reason) => {
          console.log('couldnt load file: ' + reason);
          this.readyForSave = true;
        }
      );
    });
  }

  ngOnDestroy(): void {
    this.editor.destroy();
  }
}
