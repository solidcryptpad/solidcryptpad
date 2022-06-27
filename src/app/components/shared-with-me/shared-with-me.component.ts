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
      const sharedFilesAllKeys = Object.entries(
        await sharedFilesKeystore.getKeysAll()
      );

      this.mapKeysToObjects(sharedFilesAllKeys);
    }

    const sharedFoldersKeystores =
      await this.keystoreService.getSharedFoldersKeystore();

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

    sharedFoldersKeystores.map((row) => {
      this.foldersSharedWithMe.push({
        ownerPod: row.getFolderUrl().split('/')[2],
        resourceName: row.getFolderUrl().split('/')[
          row.getFolderUrl().split('/').length - 2
        ],
        url: row.getFolderUrl(),
      });
    });
  }

  private mapKeysToObjects(
    sharedFilesAllKeys: [string, string][],
    isFolder = false
  ) {
    sharedFilesAllKeys.map((row) => {
      const url = row[0];

      const offset = url.includes('https') ? 8 : 7;

      const splitUrlString = url.substring(offset).split('/');
      const ownerPod = splitUrlString[0];

      const fileNameIndex = isFolder
        ? splitUrlString.length - 2
        : splitUrlString.length - 1;
      const resourceName = splitUrlString[fileNameIndex];

      this.filesSharedWithMe.push({
        ownerPod: ownerPod,
        resourceName: resourceName,
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
}
