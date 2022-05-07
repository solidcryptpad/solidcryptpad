import {
  CollectionViewer,
  DataSource,
  SelectionChange,
} from '@angular/cdk/collections';
import { FlatTreeControl } from '@angular/cdk/tree';
import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { BehaviorSubject, merge, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { setErrorContext } from 'src/app/exceptions/error-options';
import { SolidFileHandlerService } from 'src/app/services/file_handler/solid-file-handler.service';

/**
 * represents an element in the tree
 */
export class Node {
  constructor(
    public item: string, //link to the folder in a pod
    public short_name: string, // name displayed in the frontend
    public level: number = 1, // how deep is it from root
    public expandable: boolean = true, // is it a folder and therefor can it be opened
    public isLoading: boolean = false // is that object currently busy loading data
  ) {}
}

export class FolderDataSource implements DataSource<Node> {
  dataChange = new BehaviorSubject<Node[]>([]);

  get data(): Node[] {
    return this.dataChange.value;
  }

  constructor(
    private treeControl: FlatTreeControl<Node>,
    public solidFileHandlerService: SolidFileHandlerService,
    public root?: string
  ) {
    if (root != undefined) {
      solidFileHandlerService.getContainerContent(root).then((x) => {
        const data: Node[] = [];
        x.forEach((element) => {
          data.push(new Node(element, this.prepareName(element)));
        });
        this.dataChange.next(data);
      });
    }
  }

  /**
   * registers the event handler that takes care of opening and closing folders
   */
  connect(collectionViewer: CollectionViewer): Observable<Node[]> {
    this.treeControl.expansionModel.changed.subscribe((event) => {
      //this is correct that way, if the event is not supposed to open/close anything event will hold an empty list in added or removed, therefor the foreach won't do anything
      this.openFolder(event);
      this.closeFolder(event);
    });

    return merge(collectionViewer.viewChange, this.dataChange).pipe(
      map(() => this.data)
    );
  }

  /**
   * handles the opening of the folder
   * @param event the change that occured in the tree
   */
  //todo check if node is actually openable
  async openFolder(event: SelectionChange<Node>): Promise<void> {
    event.added.forEach(async (node) => {
      try {
        const index = this.data.indexOf(node);
        node.isLoading = true;

        const children = await this.solidFileHandlerService.getContainerContent(
          node.item
        );

        const new_children: Node[] = [];
        children.forEach(async (child) => {
          const is_container = await this.solidFileHandlerService.isContainer(
            child
          );
          new_children.push(
            new Node(
              child,
              this.prepareName(child),
              node.level + 1,
              is_container
            )
          );
          this.data.splice(index + 1, 0, ...new_children);
          node.isLoading = false;
          this.dataChange.next(this.data);
        });
      } catch (error) {
        setErrorContext('Error while loading Foldercontent')(error as Error);
      } finally {
        // make sure the loading animation stops at the end even if some error occured
        node.isLoading = false;
        this.dataChange.next(this.data);
      }
    });
  }

  /**
   * handles closing the folders
   * @param event the change that occured in the folder
   */
  async closeFolder(event: SelectionChange<Node>): Promise<void> {
    event.removed
      .slice()
      .reverse()
      .forEach((node) => {
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
      });
  }

  // is required for the interface but eslint does not like empty functions
  // eslint-disable-next-line
  disconnect(collectionViewer: CollectionViewer): void {}

  /**
   * cuts down the url to the part that should in the end be displayed in the folder structure
   * @param name full url of the node
   * @returns the name to display
   */
  private prepareName(name: string): string {
    if (name.endsWith('/')) {
      name = name.substring(0, name.length - 1);
    }

    name = name.substring(name.lastIndexOf('/') + 1);
    return name;
  }
}

@Component({
  selector: 'app-tree-nested-explorer',
  templateUrl: './tree-nested-explorer.component.html',
  styleUrls: ['./tree-nested-explorer.component.scss'],
})
export class TreeNestedExplorerComponent {
  root_path?: string;

  constructor(
    public solidFileHandlerService: SolidFileHandlerService,
    private route: ActivatedRoute
  ) {
    this.treeControl = new FlatTreeControl<Node>(
      this.getLevel,
      this.isExpandable
    );
    this.dataSource = new FolderDataSource(
      this.treeControl,
      solidFileHandlerService,
      this.root_path
    );

    this.route.queryParams.subscribe((params) => {
      this.root_path = params['url'];

      this.treeControl = new FlatTreeControl<Node>(
        this.getLevel,
        this.isExpandable
      );
      this.dataSource = new FolderDataSource(
        this.treeControl,
        solidFileHandlerService,
        this.root_path
      );
    });
  }

  treeControl: FlatTreeControl<Node>;

  dataSource: FolderDataSource;

  getLevel(node: Node): number {
    return node.level;
  }

  isExpandable(node: Node): boolean {
    return node.expandable;
  }

  hasChild(_: number, nodeData: Node) {
    return nodeData.expandable;
  }
}
