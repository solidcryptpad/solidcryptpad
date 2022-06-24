import { Component, OnInit } from '@angular/core';
import { KeystoreService } from '../../services/encryption/keystore/keystore.service';
import { SharedWithMe } from './shared-with-me';
import { Router } from '@angular/router';

@Component({
  selector: 'app-shared-with-me',
  templateUrl: './shared-with-me.component.html',
  styleUrls: ['./shared-with-me.component.scss'],
})
export class SharedWithMeComponent implements OnInit {
  filesSharedWithMe: SharedWithMe[] = [];
  foldersSharedWithMe: SharedWithMe[] = [];

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
      const sharedFoldersKeystore =
        await this.keystoreService.getSharedFoldersKeystore();

      const sharedFoldersAllKeys = Object.entries(
        await sharedFoldersKeystore.getKeysAll()
      );

      this.mapKeysToObjects(sharedFoldersAllKeys, true);
    }

    this.loading = false;
  }

  private mapKeysToObjects(
    sharedFilesAllKeys: [string, string][],
    isFolder = false
  ) {
    sharedFilesAllKeys.map((row) => {
      console.log(row);
      const url = row[0];
      const key = row[1];

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
        key: key,
        isFolder: isFolder,
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
