import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { KeystoreStorageService } from 'src/app/services/encryption/keystore/keystore-storage.service';
import { KeystoreService } from 'src/app/services/encryption/keystore/keystore.service';
import { LinkShareService } from '../../services/link-share/link-share.service';
import { InvalidSharingLinkException } from '../../exceptions/invalid-sharing-link-exception';
import { SharedFolderKeystore } from '../../services/encryption/keystore/shared-folder-keystore.class';

@Component({
  selector: 'app-share',
  templateUrl: './share.component.html',
  styleUrls: ['./share.component.scss'],
})
export class ShareComponent implements OnInit {
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private linkShareService: LinkShareService,
    private keystoreService: KeystoreService,
    private keystoreStorageService: KeystoreStorageService
  ) {}

  error = false;

  ngOnInit(): void {
    this.route.queryParams.subscribe(async (params) => {
      if (params['file']) {
        await this.processShareFile(
          params['file'],
          params['key'],
          params['group']
        );
      } else if (params['group']) {
        await this.processShareFolder(
          params['folder'],
          params['group'],
          params['keystore'],
          params['keystoreEncryptionKey']
        );
      } else {
        this.error = true;
        throw new InvalidSharingLinkException(
          'Your link is incomplete or corrupted. Please check with the owner of the file.'
        );
      }
    });
  }

  private async processShareFile(fileUrl: string, key: string, group: string) {
    await this.linkShareService.addWebIdToGroup(group);

    const sharedFilesKeystore =
      await this.keystoreService.getSharedFilesKeystore();
    await sharedFilesKeystore.addKey(fileUrl, atob(key));
    await this.router.navigate(['preview'], {
      queryParams: { url: fileUrl },
    });
  }

  private async processShareFolder(
    folderUrl: string,
    group: string,
    keystoreUrl: string,
    keystoreEncryptionKey: string
  ) {
    await this.linkShareService.addWebIdToGroup(group);
    const storage = this.keystoreStorageService.createSecureStorage(
      keystoreEncryptionKey
    );
    await this.keystoreService.addKeystore(
      new SharedFolderKeystore(keystoreUrl, folderUrl, storage)
    );

    await this.router.navigate(['files'], {
      queryParams: {
        url: folderUrl,
      },
    });
  }
}
