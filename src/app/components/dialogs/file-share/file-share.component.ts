import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { FormBuilder, FormControl } from '@angular/forms';
import { LinkShareService } from '../../../services/link-share/link-share.service';
import { throwWithContext } from '../../../exceptions/error-options';

@Component({
  selector: 'app-link-share',
  templateUrl: './file-share.component.html',
  styleUrls: ['./file-share.component.scss'],
})
export class FileShareComponent {
  access = this.formBuilder.group({
    read: new FormControl({ value: true, disabled: true }),
    write: false,
  });
  loading = false;
  link: string | undefined = undefined;

  constructor(
    private formBuilder: FormBuilder,
    public dialogRef: MatDialogRef<FileShareComponent>,
    private linkSharingService: LinkShareService,
    @Inject(MAT_DIALOG_DATA) public data: { fileUrl: string }
  ) {}

  async createLink(): Promise<void> {
    const url = this.data.fileUrl;
    const permissions = this.access.getRawValue();
    this.loading = true;
    try {
      this.link = await this.linkSharingService.createFileSharingLink(
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
