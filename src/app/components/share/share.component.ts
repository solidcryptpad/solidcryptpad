import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { UnknownException } from 'src/app/exceptions/unknown-exception';
import { FolderKeystore } from 'src/app/services/encryption/keystore/folder-keystore.class';
import { KeystoreService } from 'src/app/services/encryption/keystore/keystore.service';
import { LinkShareService } from '../../services/link-share/link-share.service';

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
    private keystoreService: KeystoreService
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe(async (params) => {
      if (params['file']) {
        this.processShareFile(params['file'], params['key'], params['group']);
      } else if (params['group']) {
        this.processShareFolder(
          params['folder'],
          params['group'],
          params['keystore'],
          params['keystoreEncryptionKey']
        );
      } else {
        // TODO: appropriate exception
        throw new UnknownException('Invalid sharing link');
      }
    });
  }

  private async processShareFile(fileUrl: string, key: string, group: string) {
    await this.linkShareService.addWebIdToGroup(group);

    await this.router.navigate(['preview'], {
      queryParams: { url: fileUrl, key, group },
    });
  }

  private async processShareFolder(
    folderUrl: string,
    group: string,
    keystoreUrl: string,
    keystoreEncryptionKey: string
  ) {
    await this.linkShareService.addWebIdToGroup(group);
    const storage = this.keystoreService.createSecureStorage(
      keystoreEncryptionKey
    );
    await this.keystoreService.addKeystore(
      new FolderKeystore(keystoreUrl, folderUrl, storage)
    );
    await this.router.navigate(['files'], {
      queryParams: {
        url: folderUrl,
      },
    });
  }
}
