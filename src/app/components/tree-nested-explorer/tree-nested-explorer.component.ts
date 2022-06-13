import { FlatTreeControl } from '@angular/cdk/tree';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { SolidFileHandlerService } from 'src/app/services/file-handler/solid-file-handler.service';
import { LinkShareService } from 'src/app/services/link-share/link-share.service';
import { MatDialog } from '@angular/material/dialog';
import { FileUploadComponent } from '../dialogs/file-upload/file-upload.component';
import { FolderCreateComponent } from '../dialogs/folder-create/folder-create.component';
import { FileCreateComponent } from '../dialogs/file-create/file-create.component';
import { ProfileService } from 'src/app/services/profile/profile.service';
import { FolderDataSource, Node } from './folder-data-source.class';
import { NotificationService } from 'src/app/services/notification/notification.service';
import { NotACryptpadUrlException } from 'src/app/exceptions/not-a-cryptpad-url-exception';
import { firstValueFrom } from 'rxjs';
import { FolderShareComponent } from '../dialogs/folder-share/folder-share.component';
import { FileEncryptionService } from 'src/app/services/encryption/file-encryption/file-encryption.service';

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
    private fileEncryptionService: FileEncryptionService,
    private profileService: ProfileService,
    private linkShareService: LinkShareService,
    private route: ActivatedRoute,
    private router: Router,
    private dialog: MatDialog,
    private notification: NotificationService
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe(async (params) => {
      let rootPath: string | undefined = params['url'];
      // check if url is valid
      if (rootPath && !this.fileEncryptionService.isCryptoDirectory(rootPath)) {
        throw new NotACryptpadUrlException(
          `Not loading ${rootPath}, because it is not an encrypted directory`
        );
      }

      if (!rootPath) {
        const baseUrl = (await this.profileService.getPodUrls())[0];
        rootPath =
          this.fileEncryptionService.getDefaultCryptoDirectoryUrl(baseUrl);
        const created =
          await this.solidFileHandlerService.ensureContainerExists(rootPath);
        if (created) {
          this.notification.info({
            title: 'Created',
            message: 'a solidcryptpad folder was created for you',
          });
        }
      }
      this.rootPath = rootPath;

      this.treeControl = new FlatTreeControl<Node>(
        this.getLevel,
        this.isExpandable
      );
      this.dataSource = new FolderDataSource(
        this.treeControl,
        this.solidFileHandlerService,
        this.rootPath
      );
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

  async upload(node: Node) {
    const dialogRef = this.dialog.open(FileUploadComponent, {
      data: {
        folder: { url: node.link },
      },
    });
    await firstValueFrom(dialogRef.afterClosed());
    this.dataSource.reloadNode(node);
  }

  async createFolder(node: Node) {
    const dialogRef = this.dialog.open(FolderCreateComponent, {
      data: node,
    });
    await firstValueFrom(dialogRef.afterClosed());
    this.dataSource.reloadNode(node);
  }

  createFile(node: Node) {
    this.dialog.open(FileCreateComponent, {
      data: node,
    });
  }

  async deleteFolder(node: Node) {
    await this.solidFileHandlerService.deleteFolder(node.link);
    await this.dataSource.reloadNode(this.dataSource.getParent(node));
  }

  async deleteFile(node: Node) {
    await this.solidFileHandlerService.deleteFile(node.link);
    await this.dataSource.reloadNode(this.dataSource.getParent(node));
  }

  async shareFolder(node: Node) {
    const link = await this.linkShareService.createReadOnlyFolderLink(
      node.link
    );
    await this.dialog.open(FolderShareComponent, {
      data: link,
    });
  }
}
