import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormControl } from '@angular/forms';
import { DirectoryStructureService } from 'src/app/services/directory-structure/directory-structure.service';

@Component({
  selector: 'app-file-explorer',
  templateUrl: './file-explorer.component.html',
  styleUrls: ['./file-explorer.component.scss'],
})
export class FileExplorerComponent implements OnInit {
  public currentUrl = '';
  public directoryFullPathSplitBySlash: string[] = [];
  changeDirectoryToFormControl = new FormControl(this.currentUrl);
  changingDirectory = false;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private directoryService: DirectoryStructureService
  ) {}
  async ngOnInit(): Promise<void> {
    this.route.queryParams.subscribe(async (params) => {
      this.currentUrl = params['url'];
      if (!this.currentUrl) {
        this.currentUrl =
          await this.directoryService.getDefaultStorageDirectory();
      }
      this.updateUrlSplit(this.currentUrl);
    });
  }

  async goToFolder(link: string): Promise<void> {
    await this.router.navigateByUrl(`files?url=${link}`);
    this.updateUrlSplit(link);
    this.toggleChangingDirectory();
  }

  private updateUrlSplit(url: string) {
    const offset = url.includes('https') ? 8 : 7;
    this.directoryFullPathSplitBySlash = url.substring(offset).split('/');
  }

  toggleChangingDirectory() {
    this.changingDirectory = !this.changingDirectory;
  }
}
