import { Component } from '@angular/core';
import { SolidFileHandlerService } from '../../services/file_handler/solid-file-handler.service';
import { NotificationService } from 'src/app/services/notification/notification.service';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-file-editor',
  templateUrl: './file-editor.component.html',
  styleUrls: ['./file-editor.component.scss'],
})
/**
 * This component is a simple example for uploading and downloading and will be replaced in the future
 */
export class FileEditorComponent {
  public currentUrl = '';
  public moveUrl = '';

  constructor(
    private solidFileHandler: SolidFileHandlerService,
    private notificationService: NotificationService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.route.queryParams.subscribe((params) => {
      this.currentUrl = params['url'];
    });
  }

  async goToFolder(link: string): Promise<void> {
    this.router.navigateByUrl(`fileEditor?url=${link}`);
  }
}
