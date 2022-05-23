import { Directive, EventEmitter, HostBinding, Output } from '@angular/core';

@Directive({
  selector: '[appDragAndDrop]',
})
export class MockDragAndDropDirective {
  @HostBinding('class.fileover') private fileOver = false;
  @Output() private fileDropped = new EventEmitter<FileList>();

  mockDragOver(): void {
    this.fileOver = true;
  }

  mockDragLeave(): void {
    this.fileOver = false;
  }

  mockFileDrop(files: FileList) {
    this.fileDropped.emit(files);
  }
}
