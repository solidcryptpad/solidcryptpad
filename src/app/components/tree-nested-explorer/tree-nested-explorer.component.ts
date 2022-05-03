import {
  CollectionViewer,
  DataSource,
  SelectionChange,
} from '@angular/cdk/collections';
import { FlatTreeControl } from '@angular/cdk/tree';
import { Component } from '@angular/core';
import { BehaviorSubject, merge, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { SolidFileHandlerService } from 'src/app/services/file_handler/solid-file-handler.service';

export class Node {
  constructor(
    public item: string, //link to the folder in a pod
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
    public root: string
  ) {
    solidFileHandlerService.getContainerContent(root).then((x) => {
      const data: Node[] = [];
      x.forEach((element) => {
        data.push(new Node(element));
      });
      this.dataChange.next(data);
    });
  }

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

  //todo check if node is actually openable
  openFolder(event: SelectionChange<Node>): void {
    event.added.forEach((node) => {
      const index = this.data.indexOf(node);
      node.isLoading = true;
      console.log(node.item);
      this.solidFileHandlerService
        .getContainerContent(node.item)
        .then((children) => {
          const new_children: Node[] = [];

          children.forEach((child) => {
            new_children.push(new Node(child, node.level + 1, true));
          });

          this.data.splice(index + 1, 0, ...new_children);
          node.isLoading = false;
          this.dataChange.next(this.data);
        });
    });
  }

  closeFolder(event: SelectionChange<Node>): void {
    event.removed
      .slice()
      .reverse()
      .forEach((node) => {
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

        this.dataChange.next(this.data);
        node.isLoading = false;
      });
  }

  // is required for the interface but eslint does not like empty functions
  // eslint-disable-next-line
  disconnect(collectionViewer: CollectionViewer): void {}
}

@Component({
  selector: 'app-tree-nested-explorer',
  templateUrl: './tree-nested-explorer.component.html',
  styleUrls: ['./tree-nested-explorer.component.scss'],
})
export class TreeNestedExplorerComponent {
  constructor(public solidFileHandlerService: SolidFileHandlerService) {
    this.treeControl = new FlatTreeControl<Node>(
      this.getLevel,
      this.isExpandable
    );
    this.dataSource = new FolderDataSource(
      this.treeControl,
      solidFileHandlerService,
      'https://hed.solidweb.org/' //todo make changeable, possibly read from pathvariable
    );
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
