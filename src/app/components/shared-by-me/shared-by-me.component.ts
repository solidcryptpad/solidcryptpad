import { Component, OnInit } from '@angular/core';
import { KeystoreService } from '../../services/encryption/keystore/keystore.service';
import { Router } from '@angular/router';
import { Clipboard } from '@angular/cdk/clipboard';
import { SharedResource } from '../../models/shared-resource';
import { LinkShareService } from '../../services/link-share/link-share.service';
import { NotificationService } from '../../services/notification/notification.service';
import { SharedByMeService } from '../../services/shared-by-me/shared-by-me.service';

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
    private notificationService: NotificationService,
    private linkShareService: LinkShareService,
    private sharedByMeService: SharedByMeService
  ) {}
  displayedColumns: string[] = ['type', 'fileName', 'url', 'deactivate'];

  async ngOnInit(): Promise<void> {
    const sharedByMe = await this.sharedByMeService.getAllSharedByMe();
    sharedByMe.links.map((el: { filename: string; link: string }) => {
      this.resourcesSharedByMe.push({
        ownerPod: 'me',
        resourceName: el.filename,
        url: el.link,
      });
    });
  }

  async copyUrl(link: string, filename: string) {
    this.clipboard.copy(link);
    this.notificationService.success({
      title: '',
      message: 'Copied url for ' + filename,
    });
  }
}
