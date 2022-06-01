import {
  DataSource,
  CollectionViewer,
  SelectionChange,
} from '@angular/cdk/collections';
import { FlatTreeControl } from '@angular/cdk/tree';
import { BehaviorSubject, Observable, merge, map } from 'rxjs';
import { throwWithContext } from 'src/app/exceptions/error-options';
import { SolidFileHandlerService } from 'src/app/services/file-handler/solid-file-handler.service';

/**
 * represents an element in the tree
 */
export class Node {
  constructor(
    public link: string, //link to the folder in a pod
    public shortName: string, // name displayed in the frontend
    public level: number, // how deep is it from root
    public expandable: boolean, // is it a folder and therefor can it be opened
    public isLoading = false // is that object currently busy loading data
  ) {}
}

export class FolderDataSource implements DataSource<Node> {
  dataChange = new BehaviorSubject<Node[]>([]);

  get data(): Node[] {
    return this.dataChange.value;
  }

  constructor(
    private treeControl: FlatTreeControl<Node>,
    private solidFileHandlerService: SolidFileHandlerService,
    private root: string
  ) {}

  /**
   * registers the event handler that takes care of opening and closing folders
   */
  connect(collectionViewer: CollectionViewer): Observable<Node[]> {
    this.treeControl.expansionModel.changed.subscribe((event) => {
      // if the event is not supposed to open/close anything, event will hold an empty list in event.added or event.removed
      this.openFolder(event);
      this.closeFolder(event);
    });

    const rootNode = this.createNode(this.root);
    this.dataChange.next([rootNode]);
    this.treeControl.expand(rootNode);

    return merge(collectionViewer.viewChange, this.dataChange).pipe(
      map(() => this.data)
    );
  }

  /**
   * handles the opening of the folder
   * @param event the change that occured in the tree
   */
  private async openFolder(event: SelectionChange<Node>): Promise<void> {
    for (const node of event.added) {
      node.isLoading = true;
      try {
        await this.openNode(node);
      } catch (error) {
        throwWithContext(`could not open ${node.link}`)(error as Error);
      } finally {
        node.isLoading = false;
      }
    }
    this.dataChange.next(this.data);
  }

  private async openNode(node: Node): Promise<void> {
    const childUrls = await this.solidFileHandlerService.getContainerContent(
      node.link
    );
    const childNodes = childUrls.map((childUrl) =>
      this.createNode(childUrl, node.level + 1)
    );

    const index = this.data.indexOf(node);
    this.data.splice(index + 1, 0, ...childNodes);
    this.dataChange.next(this.data);
  }

  private createNode(url: string, level = 1): Node {
    const isContainer = this.solidFileHandlerService.isContainer(url);
    return new Node(url, this.toDisplayName(url), level, isContainer);
  }

  /**
   * closes and reloads node
   * @param node the node to reload
   */
  public reloadNode(node: Node) {
    this.closeNode(node);
    this.openNode(node);
  }

  /**
   * handles closing the folders
   * @param event the change that occured in the folder
   */
  private async closeFolder(event: SelectionChange<Node>): Promise<void> {
    event.removed
      .slice()
      .reverse()
      .forEach((node) => {
        this.closeNode(node);
      });
  }

  private closeNode(node: Node) {
    try {
      node.isLoading = true;

      const index = this.data.indexOf(node);
      let count = 0;

      // simply counts how many elements to remove, does not have to do anything in the body
      for (
        let i = index + 1;
        i < this.data.length && this.data[i].level > node.level;
        i++, count++
      ) {}

      this.data.splice(index + 1, count);
    } finally {
      // ensure loading animation stops on success and error
      this.dataChange.next(this.data);
      node.isLoading = false;
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-empty-function, unused-imports/no-unused-vars
  disconnect(collectionViewer: CollectionViewer): void {}

  /**
   * cuts down the url to the part that should in the end be displayed in the folder structure
   * @param url full url of the node
   * @returns the name to display
   */
  private toDisplayName(url: string): string {
    if (url.endsWith('/')) {
      url = url.substring(0, url.length - 1);
    }

    url = url.substring(url.lastIndexOf('/') + 1);
    return url;
  }
}
