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

@Component({
  selector: 'app-text-editor',
  templateUrl: './text-editor.component.html',
  styleUrls: ['./text-editor.component.scss'],
})
export class TextEditorComponent implements OnInit, OnDestroy {
  editor!: Editor;
  html: '' = '';

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
  }

  ngOnDestroy(): void {
    this.editor.destroy();
  }
}
