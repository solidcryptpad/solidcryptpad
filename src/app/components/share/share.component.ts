import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { KeystoreStorageService } from 'src/app/services/encryption/keystore/keystore-storage.service';
import { KeystoreService } from 'src/app/services/encryption/keystore/keystore.service';
import { InvalidSharingLinkException } from '../../exceptions/invalid-sharing-link-exception';
import { SolidFileHandlerService } from 'src/app/services/file-handler/solid-file-handler.service';
import { SharedFolderKeystore } from '../../services/encryption/keystore/shared-folder-keystore.class';
import { Observable, throwError } from 'rxjs';
import { DirectoryStructureService } from 'src/app/services/directory-structure/directory-structure.service';

@Component({
  selector: 'app-share',
  templateUrl: './share.component.html',
  styleUrls: ['./share.component.scss'],
})
export class ShareComponent implements OnInit {
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private fileService: SolidFileHandlerService,
    private keystoreService: KeystoreService,
    private keystoreStorageService: KeystoreStorageService,
    private directoryService: DirectoryStructureService
  ) {}

  error = false;

  ngOnInit(): void {
    const params = this.route.queryParams;
    this.parseParamsAndCallProcessingMethod(params);
  }

  parseParamsAndCallProcessingMethod(params: Observable<Params>) {
    params.subscribe(async (params) => {
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
        throwError(
          () =>
            new InvalidSharingLinkException(
              'Your link is incomplete or corrupted. Please check with the owner of the file.'
            )
        );
      }
    });
  }

  private async processShareFile(fileUrl: string, key: string, group: string) {
    await this.fileService.addCurrentUserToGroup(group);

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
    await this.fileService.addCurrentUserToGroup(group);
    const storage = this.keystoreStorageService.createSecureStorage(
      keystoreEncryptionKey
    );
    await this.keystoreService.addKeystore(
      new SharedFolderKeystore(
        keystoreUrl,
        folderUrl,
        storage,
        this.directoryService
      )
    );

    await this.router.navigate(['files'], {
      queryParams: {
        url: folderUrl,
      },
    });
  }
}
