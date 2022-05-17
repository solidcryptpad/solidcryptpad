import {
  CollectionViewer,
  DataSource,
  SelectionChange,
} from '@angular/cdk/collections';
import { FlatTreeControl } from '@angular/cdk/tree';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { BehaviorSubject, merge, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { setErrorContext } from 'src/app/exceptions/error-options';
import { PermissionException } from 'src/app/exceptions/permission-exception';
import { SolidFileHandlerService } from 'src/app/services/file-handler/solid-file-handler.service';
import {
  MatDialog,
} from '@angular/material/dialog';
import { FileUploadComponent } from '../dialogs/file-upload/file-upload.component';

/**
 * represents an element in the tree
 */
export class Node {
  constructor(
    public link: string, //link to the folder in a pod
    public shortName: string, // name displayed in the frontend
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
    private solidFileHandlerService: SolidFileHandlerService,
    private root: string | null
  ) {}

  public async init() {
    if (this.root != null) {
      const content = await this.solidFileHandlerService.getContainerContent(
        this.root
      );

      const data: Node[] = [];
      content.forEach((element) => {
        this.createNode(element);
        data.push(this.createNode(element));
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
  private async openFolder(event: SelectionChange<Node>): Promise<void> {
    event.added.forEach(async (node) => {
      try {
        const index = this.data.indexOf(node);
        node.isLoading = true;
        const children = await this.solidFileHandlerService.getContainerContent(
          node.link
        );

        const newChildren: Node[] = [];
        children.forEach(async (child) => {
          newChildren.push(this.createNode(child, node.level + 1));
        });

        this.data.splice(index + 1, 0, ...newChildren);
        node.isLoading = false;
        this.dataChange.next(this.data);
      } catch (error) {
        setErrorContext('Error while loading Foldercontent')(error as Error);

        if (error instanceof PermissionException) {
          throw error;
        }
      } finally {
        // make sure the loading animation stops at the end even if some error occured
        node.isLoading = false;
        this.dataChange.next(this.data);
      }
    });
  }

  private createNode(url: string, level = 1): Node {
    const isContainer = this.solidFileHandlerService.isContainer(url);
    return new Node(url, this.prepareName(url), level, isContainer);
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
export class TreeNestedExplorerComponent implements OnInit {
  rootPath: string | null = null;

  treeControl!: FlatTreeControl<Node>;

  dataSource!: FolderDataSource;

  constructor(
    public solidFileHandlerService: SolidFileHandlerService,
    private route: ActivatedRoute,
    private router: Router,
    public dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe(async (params) => {
      this.rootPath = params['url'];
      this.treeControl = new FlatTreeControl<Node>(
        this.getLevel,
        this.isExpandable
      );
      this.dataSource = new FolderDataSource(
        this.treeControl,
        this.solidFileHandlerService,
        this.rootPath
      );
      await this.dataSource.init();
    });
  }

  getLevel(node: Node): number {
    return node.level;
  }

  isExpandable(node: Node): boolean {
    return node.expandable;
  }

  hasChild(_: number, nodeData: Node) {
    return nodeData.expandable;
  }

  open(node: Node) {
    if (node.expandable) {
      this.router.navigateByUrl(`/files?url=${node.link}`);
    } else {
      this.router.navigateByUrl(`/editor?file=${node.link}`);
    }
  }

  upload(node: Node) {
    const dialogRef = this.dialog.open(FileUploadComponent, {
      data: {
        folder: {
          url: node.link,
        },
      },
    });
    dialogRef.afterClosed().subscribe((result) => {
      console.log('finished uploading', result);
    });
  }
}
