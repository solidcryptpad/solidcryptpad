import { Component, OnInit } from '@angular/core';
import { KeystoreService } from '../../services/encryption/keystore/keystore.service';
import { Router } from '@angular/router';
import { SharedFolderKeystore } from '../../services/encryption/keystore/shared-folder-keystore.class';
import { SharedWithMeResource } from '../../models/shared-with-me-resource';

@Component({
  selector: 'app-shared-with-me',
  templateUrl: './shared-with-me.component.html',
  styleUrls: ['./shared-with-me.component.scss'],
})
export class SharedWithMeComponent implements OnInit {
  filesSharedWithMe: SharedWithMeResource[] = [];
  foldersSharedWithMe: SharedWithMeResource[] = [];

  constructor(
    private keystoreService: KeystoreService,
    private router: Router
  ) {}
  displayedColumns: string[] = ['isFolder', 'fileName', 'owner'];
  loading = false;

  async ngOnInit(): Promise<void> {
    await this.keystoreService.loadKeystores();

    this.loading = true;

    if (await this.keystoreService.sharedFilesKeystoreExists()) {
      const sharedFilesKeystore =
        await this.keystoreService.getSharedFilesKeystore();
      const sharedFilesUrls = Object.keys(
        await sharedFilesKeystore.getKeysAll()
      );

      this.addFileUrls(sharedFilesUrls);
    }

    const sharedFoldersKeystores =
      await this.keystoreService.getSharedFolderKeystores();

    this.mapSharedFoldersToObjects(sharedFoldersKeystores);

    // TODO - deactivated links should be removed from keystore

    this.loading = false;
  }

  private mapSharedFoldersToObjects(
    sharedFoldersKeystores: SharedFolderKeystore[]
  ) {
    if (sharedFoldersKeystores.length === 0) {
      return;
    }

    sharedFoldersKeystores.map((keystore) => {
      const url = keystore.getFolderUrl();
      this.foldersSharedWithMe.push({
        ownerPod: new URL(url).host,
        resourceName: this.getResourceName(url),
        url: url,
      });
    });
  }

  private addFileUrls(sharedFilesUrls: string[]) {
    sharedFilesUrls.forEach((url) => {
      this.filesSharedWithMe.push({
        ownerPod: new URL(url).host,
        resourceName: this.getResourceName(url),
        url: url,
      });
    });
  }

  async clickFile(url: string) {
    await this.router.navigate(['preview'], {
      queryParams: { url: url },
    });
  }

  async clickFolder(url: string) {
    await this.router.navigate(['files'], {
      queryParams: {
        url: url,
      },
    });
  }

  private getResourceName(url: string): string {
    if (url.endsWith('/')) url = url.slice(0, -1);
    return url.substring(url.lastIndexOf('/') + 1);
  }
}
