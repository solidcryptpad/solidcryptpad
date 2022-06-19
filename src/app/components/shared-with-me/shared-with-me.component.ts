import { Component, OnInit } from '@angular/core';
import { KeystoreService } from '../../services/encryption/keystore/keystore.service';
import { SharedFile } from './shared-file';
import { Router } from '@angular/router';

@Component({
  selector: 'app-shared-with-me',
  templateUrl: './shared-with-me.component.html',
  styleUrls: ['./shared-with-me.component.scss'],
})
export class SharedWithMeComponent implements OnInit {
  filesSharedWithMe: SharedFile[] = [];

  constructor(
    private keystoreService: KeystoreService,
    private router: Router
  ) {}
  displayedColumns: string[] = ['fileName', 'owner'];

  async ngOnInit(): Promise<void> {
    const sharedFilesKeystore =
      await this.keystoreService.getSharedFilesKeystore();

    const allKeysArray = Object.entries(await sharedFilesKeystore.getKeysAll());

    allKeysArray.map((row) => {
      const offset = row[0].includes('https') ? 8 : 7;
      const splitUrlString = row[0].substring(offset).split('/');
      this.filesSharedWithMe.push({
        ownerPod: splitUrlString[0],
        fileName: splitUrlString[splitUrlString.length - 1],
        url: row[0],
        key: row[1],
      });
    });
  }

  async openFile(fileUrl: string) {
    await this.router.navigate(['preview'], {
      queryParams: { url: fileUrl },
    });
  }
}
