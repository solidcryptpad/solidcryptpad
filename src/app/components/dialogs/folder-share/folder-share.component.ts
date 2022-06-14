import { Component, Inject } from '@angular/core';
import { FormBuilder, FormControl } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { throwWithContext } from 'src/app/exceptions/error-options';
import { LinkShareService } from 'src/app/services/link-share/link-share.service';

@Component({
  selector: 'app-folder-share',
  templateUrl: './folder-share.component.html',
  styleUrls: ['./folder-share.component.scss'],
})
export class FolderShareComponent {
  access = this.formBuilder.group({
    read: new FormControl({ value: true, disabled: true }),
    write: false,
  });
  loading = false;
  link: string | undefined = undefined;

  constructor(
    private formBuilder: FormBuilder,
    public dialogRef: MatDialogRef<FolderShareComponent>,
    private linkSharingService: LinkShareService,
    @Inject(MAT_DIALOG_DATA) public data: { folderUrl: string }
  ) {}

  async createLink(): Promise<void> {
    const url = this.data.folderUrl;
    const permissions = this.access.getRawValue();
    this.loading = true;
    try {
      this.link = await this.linkSharingService.createFolderSharingLink(
        url,
        permissions
      );
    } catch (error) {
      throwWithContext('Error creating link')(error as Error);
    } finally {
      this.loading = false;
    }
  }

  cancel(): void {
    this.dialogRef.close();
  }
}
