import { DragAndDropDirective } from './drag-and-drop.directive';

describe('DragAndDropDirective', () => {
  let directive: DragAndDropDirective;

  const toDataTransfer = (files: File[]): DataTransfer => {
    const dataTransfer = new DataTransfer();
    files.forEach((file) => dataTransfer.items.add(file));
    return dataTransfer;
  };

  beforeEach(() => {
    directive = new DragAndDropDirective();
  });

  it('should create an instance', () => {
    expect(directive).toBeTruthy();
  });

  it('changes fileOver to true on dragover', () => {
    directive.fileOver = false;

    directive.onDragOver(new DragEvent('dragover'));

    expect(directive.fileOver).toBeTrue();
  });

  it('changes fileOver to false on dragleave', () => {
    directive.fileOver = true;

    directive.onDragLeave(new DragEvent('dragleave'));

    expect(directive.fileOver).toBeFalse();
  });

  it('emits files on file drop', () => {
    const dataTransfer = toDataTransfer([
      new File([], 'foo'),
      new File([], 'bar'),
    ]);
    spyOn(directive.fileDropped, 'emit');

    directive.onDrop(new DragEvent('drop', { dataTransfer }));

    expect(directive.fileDropped.emit).toHaveBeenCalledWith(dataTransfer.files);
  });

  it('stops fileOver on file drop', () => {
    const dataTransfer = toDataTransfer([
      new File([], 'foo'),
      new File([], 'bar'),
    ]);
    directive.fileOver = true;

    directive.onDrop(new DragEvent('drop', { dataTransfer }));

    expect(directive.fileOver).toBeFalse();
  });
});
