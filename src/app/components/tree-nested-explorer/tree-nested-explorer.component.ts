import { FlatTreeControl } from '@angular/cdk/tree';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { SolidFileHandlerService } from 'src/app/services/file-handler/solid-file-handler.service';
import { MatDialog } from '@angular/material/dialog';
import { FileUploadComponent } from '../dialogs/file-upload/file-upload.component';
import { FolderDataSource, Node } from './folder-data-source.class';

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
      this.router.navigate(['files'], { queryParams: { url: node.link } });
    } else {
      this.router.navigate(['preview'], { queryParams: { url: node.link } });
    }
  }

  upload(node: Node) {
    this.dialog.open(FileUploadComponent, {
      data: {
        folder: {
          url: node.link,
        },
      },
    });
  }
}
