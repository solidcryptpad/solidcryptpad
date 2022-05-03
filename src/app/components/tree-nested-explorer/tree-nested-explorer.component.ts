import {
  CollectionViewer,
  DataSource,
} from '@angular/cdk/collections';
import { FlatTreeControl } from '@angular/cdk/tree';
import { Component } from '@angular/core';
import { BehaviorSubject, merge, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { SolidFileHandlerService } from 'src/app/services/file_handler/solid-file-handler.service';

export class DynamicFlatNode {
  constructor(
    public item: string,
    public level = 1,
    public expandable = false,
    public isLoading = false
  ) {}
}

export class DynamicDataSource implements DataSource<DynamicFlatNode> {
  dataChange = new BehaviorSubject<DynamicFlatNode[]>([]);
  root = 'https://hed.solidweb.org/';
  constructor(
    private treeControl: FlatTreeControl<DynamicFlatNode>,
    public solidFileHandlerService: SolidFileHandlerService
  ) {
    solidFileHandlerService.getContainerContent(this.root).then((x) => {
      const data: DynamicFlatNode[] = [];
      x.forEach((element) => {
        data.push(new DynamicFlatNode(element.substring(this.root.length)));
      });
      this.dataChange.next(data);
    });
  }

  connect(collectionViewer: CollectionViewer): Observable<DynamicFlatNode[]> {
    this.treeControl.expansionModel.changed.subscribe((change) =>
      console.log(change)
    );

    return merge(collectionViewer.viewChange, this.dataChange).pipe(
      map(() => this.dataChange.value)
    );
  }

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
    this.treeControl = new FlatTreeControl<DynamicFlatNode>(
      this.getLevel,
      this.isExpandable
    );
    this.dataSource = new DynamicDataSource(
      this.treeControl,
      solidFileHandlerService
    );
  }

  treeControl: FlatTreeControl<DynamicFlatNode>;

  dataSource: DynamicDataSource;

  getLevel = (node: DynamicFlatNode) => node.level;

  isExpandable = (node: DynamicFlatNode) => node.expandable;

  hasChild = (_: number, _nodeData: DynamicFlatNode) => _nodeData.expandable;
}
