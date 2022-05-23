import { Directive, EventEmitter, HostBinding, Output } from '@angular/core';

@Directive({
  selector: '[appDragAndDrop]',
})
export class MockDragAndDropDirective {
  @HostBinding('class.fileover') private fileOver = false;
  @Output() private fileDropped = new EventEmitter<FileList>();

  mockFileDrop(files: FileList) {
    this.fileDropped.emit(files);
  }
}
