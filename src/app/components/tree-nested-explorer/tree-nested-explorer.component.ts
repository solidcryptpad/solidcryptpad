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
import { firstValueFrom } from 'rxjs';
import { FolderShareComponent } from '../dialogs/folder-share/folder-share.component';
import { FileEncryptionService } from 'src/app/services/encryption/file-encryption/file-encryption.service';
import * as JSZip from 'jszip';
import { SolidPermissionService } from 'src/app/services/solid-permission/solid-permission.service';
import { DeleteConfirmationComponent } from '../dialogs/delete-confirmation/delete-confirmation.component';
import { FileShareComponent } from '../dialogs/file-share/file-share.component';

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
    private route: ActivatedRoute,
    private router: Router,
    private dialog: MatDialog,
    private notification: NotificationService,
    private permissionService: SolidPermissionService
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
        this.permissionService,
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

  /**
   * Downloads blob as file
   *
   * Source: https://dev.to/nombrekeff/download-file-from-blob-21ho
   *
   * @param blob
   * @param name filename
   */
  downloadBlob(blob: Blob, name = 'file') {
    // Convert your blob into a Blob URL (a special url that points to an object in the browser's memory)
    const blobUrl = URL.createObjectURL(blob);

    // Create a link element
    const link = document.createElement('a');

    // Set link's href to point to the Blob URL
    link.href = blobUrl;
    link.download = name;

    // Append link to the body
    document.body.appendChild(link);

    // Dispatch click event on the link
    // This is necessary as link.click() does not work on the latest firefox
    link.dispatchEvent(
      new MouseEvent('click', {
        bubbles: true,
        cancelable: true,
        view: window,
      })
    );

    // Remove link from body
    document.body.removeChild(link);
  }

  async downloadFile(node: Node) {
    const encryptedBlob = await this.solidFileHandlerService.readFile(
      node.link
    );
    const decryptedBlob = await this.fileEncryptionService.decryptFile(
      encryptedBlob,
      node.link
    );
    this.downloadBlob(decryptedBlob);
  }

  async getFilesInFolder(nodeLink: string): Promise<string[]> {
    let filelist: string[] = [];
    const containerContent =
      await this.solidFileHandlerService.getContainerContent(nodeLink);
    for (const element of containerContent) {
      if (this.solidFileHandlerService.isContainer(element)) {
        filelist = filelist.concat(await this.getFilesInFolder(element));
      } else {
        filelist.push(element);
      }
    }
    return filelist;
  }

  async downloadFolder(node: Node) {
    const foldername = node.link.split('/')[node.link.split('/').length - 2];
    const allFiles = await this.getFilesInFolder(node.link);
    const zip = new JSZip();

    for (const element of allFiles) {
      if (!this.solidFileHandlerService.isContainer(element)) {
        const encryptedBlob = await this.solidFileHandlerService.readFile(
          element
        );
        const decryptedBlob = await this.fileEncryptionService.decryptFile(
          encryptedBlob,
          element
        );
        const filename = foldername + element.split(foldername)[1];
        zip.file(filename, decryptedBlob);
      }
    }
    this.downloadBlob(await zip.generateAsync({ type: 'blob' }), foldername);
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
    const dialogRef = this.dialog.open(DeleteConfirmationComponent, {
      data: { type: 'folder', url: node.link },
    });

    const ret = await firstValueFrom(dialogRef.afterClosed());

    if (ret) {
      await this.solidFileHandlerService.deleteFolder(node.link);
      await this.dataSource.reloadNode(this.dataSource.getParent(node));
    } else {
      this.notification.info({ title: 'delete', message: 'aborted' });
    }
  }

  async deleteFile(node: Node) {
    const dialogRef = this.dialog.open(DeleteConfirmationComponent, {
      data: { type: 'file', url: node.link },
    });

    const ret = await firstValueFrom(dialogRef.afterClosed());

    if (ret) {
      await this.solidFileHandlerService.deleteFile(node.link);
      await this.dataSource.reloadNode(this.dataSource.getParent(node));
    } else {
      this.notification.info({ title: 'delete', message: 'aborted' });
    }
  }

  async shareFolder(node: Node) {
    await this.dialog.open(FolderShareComponent, {
      data: {
        folderUrl: node.link,
      },
    });
  }

  async shareFile(node: Node) {
    await this.dialog.open(FileShareComponent, {
      data: {
        fileUrl: node.link,
      },
    });
  }
}
