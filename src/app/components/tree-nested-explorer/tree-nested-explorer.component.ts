import { FlatTreeControl } from '@angular/cdk/tree';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { SolidFileHandlerService } from 'src/app/services/file-handler/solid-file-handler.service';
import { MatDialog } from '@angular/material/dialog';
import { FileUploadComponent } from '../dialogs/file-upload/file-upload.component';
import { FolderCreateComponent } from '../dialogs/folder-create/folder-create.component';
import { FileCreateComponent } from '../dialogs/file-create/file-create.component';
import { ProfileService } from 'src/app/services/profile/profile.service';
import { FolderDataSource, Node } from './folder-data-source.class';
import { NotificationService } from 'src/app/services/notification/notification.service';
import { NotACryptpadUrlException } from 'src/app/exceptions/not-a-cryptpad-url-exception';

/**
 * represents an element in the tree
 */
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
    private solidFileHandlerService: SolidFileHandlerService,
    private profileService: ProfileService,
    private route: ActivatedRoute,
    private router: Router,
    private dialog: MatDialog,
    private notification: NotificationService
  ) {}

  ngOnInit(): void {
    // this exists in case of no path is given, todo: remove but without the tests fail
    this.treeControl = new FlatTreeControl<Node>(
      this.getLevel,
      this.isExpandable
    );
    this.dataSource = new FolderDataSource(
      this.treeControl,
      this.solidFileHandlerService,
      ''
    );
    this.dataSource.init();

    this.route.queryParams.subscribe(async (params) => {
      // check if url is valid
      if (
        params['url'] != undefined &&
        !this.solidFileHandlerService.isCryptoDirectory(params['url'])
      ) {
        throw new NotACryptpadUrlException(
          'the given url is not a solidcryptpad url'
        );
      }

      // get rootPath
      this.rootPath =
        (params['url'] ??
          (await this.profileService.getPodUrls().then((urls) => urls[0])) +
            'solidcryptpad/') + ''; //todo make dependent on value in solidfilehandler

      // create solidcryptpad folder if not exists
      if (
        !(await this.solidFileHandlerService.containerExists(this.rootPath))
      ) {
        this.rootPath = await this.solidFileHandlerService.createCryptoDirctory(
          // workaround, because it createCryptoDirectory already appends /solidcryptpad
          this.rootPath.substring(0, this.rootPath.indexOf('/solidcryptpad'))
        );
        this.notification.info({
          title: 'Created',
          message: 'a solidcryptpad folder was created for you',
        });
      }

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

  create_folder(node: Node) {
    const dialogRef = this.dialog.open(FolderCreateComponent, {
      data: node,
    });
    dialogRef.afterClosed().subscribe((result) => {
      console.log('folder created', result);
    });
  }

  create_file(node: Node) {
    const dialogRef = this.dialog.open(FileCreateComponent, {
      data: node,
    });
    dialogRef.afterClosed().subscribe((result) => {
      console.log('file created', result);
    });
  }
}
