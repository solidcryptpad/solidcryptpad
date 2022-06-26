import { Component, OnInit } from '@angular/core';
import { SharedResource } from '../../models/shared-resource';
import { KeystoreService } from '../../services/encryption/keystore/keystore.service';
import { Router } from '@angular/router';
import { Clipboard } from '@angular/cdk/clipboard';
import { NotificationService } from '../../services/notification/notification.service';

@Component({
  selector: 'app-shared-by-me',
  templateUrl: './shared-by-me.component.html',
  styleUrls: ['./shared-by-me.component.scss'],
})
export class SharedByMeComponent implements OnInit {
  resourcesSharedByMe: SharedResource[] = [];

  constructor(
    private keystoreService: KeystoreService,
    private router: Router,
    private clipboard: Clipboard,
    private notificationService: NotificationService
  ) {}
  displayedColumns: string[] = ['key', 'fileName', 'url'];

  async ngOnInit(): Promise<void> {
    const linksKeystore = await this.keystoreService.getLinksKeystore();

    const allKeysArray = Object.entries(await linksKeystore.getKeysAll());

    allKeysArray.map((row) => {
      let data;
      try {
        data = JSON.parse(row[0]);
      } catch {
        return;
      }
      if (data === {}) {
        return;
      }
      console.log(data);
      const offset = data.object.includes('https') ? 8 : 7;
      const splitUrlString = data.object.substring(offset).split('/');

      this.resourcesSharedByMe.push({
        ownerPod: splitUrlString[0],
        resourceName:
          splitUrlString[splitUrlString.length - 1] ||
          splitUrlString[splitUrlString.length - 2],
        url: data.url,
        key: data.type,
        isFolder: data.object.substring(offset).endsWith('/'),
      });
    });
  }

  async copyUrl(fileUrl: string, filename: string) {
    this.clipboard.copy(fileUrl);
    this.notificationService.success({
      title: '',
      message: 'Copied url for ' + filename,
    });
  }
}
