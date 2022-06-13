import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FileEncryptionService } from 'src/app/services/encryption/file-encryption/file-encryption.service';
import { ProfileService } from 'src/app/services/profile/profile.service';

@Component({
  selector: 'app-file-explorer',
  templateUrl: './file-explorer.component.html',
  styleUrls: ['./file-explorer.component.scss'],
})
export class FileExplorerComponent implements OnInit {
  public currentUrl = '';
  public moveUrl = '';

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private fileEncryptionService: FileEncryptionService,
    private profileService: ProfileService
  ) {}
  async ngOnInit(): Promise<void> {
    this.route.queryParams.subscribe(async (params) => {
      this.currentUrl = params['url'];
      if (!this.currentUrl) {
        const baseUrl = (await this.profileService.getPodUrls())[0];
        this.currentUrl =
          this.fileEncryptionService.getDefaultCryptoDirectoryUrl(baseUrl);
      }
    });
  }

  async goToFolder(link: string): Promise<void> {
    this.router.navigateByUrl(`files?url=${link}`);
  }
}
