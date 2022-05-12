import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-file-explorer',
  templateUrl: './file-explorer.component.html',
  styleUrls: ['./file-explorer.component.scss'],
})
export class FileExplorerComponent {
  public currentUrl = '';
  public moveUrl = '';

  constructor(private router: Router, private route: ActivatedRoute) {
    this.route.queryParams.subscribe((params) => {
      this.currentUrl = params['url'];
    });
  }

  async goToFolder(link: string): Promise<void> {
    this.router.navigateByUrl(`files?url=${link}`);
  }
}
