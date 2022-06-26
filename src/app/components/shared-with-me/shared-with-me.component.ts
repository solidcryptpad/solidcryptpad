import { Component, OnInit } from '@angular/core';
import { KeystoreService } from '../../services/encryption/keystore/keystore.service';
import { SharedResource } from '../../models/shared-resource';
import { Router } from '@angular/router';
import { SharedFolderKeystore } from '../../services/encryption/keystore/shared-folder-keystore.class';

@Component({
  selector: 'app-shared-with-me',
  templateUrl: './shared-with-me.component.html',
  styleUrls: ['./shared-with-me.component.scss'],
})
export class SharedWithMeComponent implements OnInit {
  filesSharedWithMe: SharedResource[] = [];
  foldersSharedWithMe: SharedResource[] = [];

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

    if (await this.keystoreService.sharedFoldersKeystoreExists()) {
      const sharedFoldersKeystores =
        await this.keystoreService.getSharedFoldersKeystore();

      this.mapSharedFoldersToObjects(sharedFoldersKeystores);
    }
    this.loading = false;
  }

  private mapSharedFoldersToObjects(
    sharedFoldersKeystores: SharedFolderKeystore[]
  ) {
    sharedFoldersKeystores.map((row) => {
      console.log(row);
      this.foldersSharedWithMe.push({
        ownerPod: 'huuhu',
        resourceName: row
          .getFolderUrl()
          .substring(row.getFolderUrl().lastIndexOf('/')),
        url: row.getFolderUrl(),
      });
    });
  }

  private mapKeysToObjects(
    sharedFilesAllKeys: [string, string][],
    isFolder = false
  ) {
    sharedFilesAllKeys.map((row) => {
      console.log(row);
      const url = row[0];

      const offset = url.includes('https') ? 8 : 7;

      const splitUrlString = url.substring(offset).split('/');
      const ownerPod = splitUrlString[0];

      const fileNameIndex = isFolder
        ? splitUrlString.length - 2
        : splitUrlString.length - 1;
      const resourceName = splitUrlString[fileNameIndex];

      (isFolder ? this.foldersSharedWithMe : this.filesSharedWithMe).push({
        ownerPod: ownerPod,
        resourceName: resourceName,
        url: url,
      });
    });
  }

  async handleClick(url: string, isFolder: boolean) {
    if (isFolder) {
      await this.router.navigate(['files'], {
        queryParams: {
          url: url,
        },
      });
    } else {
      await this.router.navigate(['preview'], {
        queryParams: { url: url },
      });
    }
  }
}
