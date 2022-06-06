import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { LinkShareService } from '../../services/link-share/link-share.service';
import { SolidAuthenticationService } from '../../services/authentication/solid-authentication.service';

@Component({
  selector: 'app-share',
  templateUrl: './share.component.html',
  styleUrls: ['./share.component.scss'],
})
export class ShareComponent implements OnInit {
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private linkShareService: LinkShareService,
    private authService: SolidAuthenticationService
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe(async (params) => {
      const groupKey = params['group'];
      //const key = params['key'];
      const file = params['file'];

      console.log('file ', file);
      console.log('group ', groupKey);

      await this.linkShareService.addWebIdToGroup(
        await this.authService.getWebId(),
        groupKey
      );

      this.router.navigate(['preview'], { queryParams: { url: file } });
    });
  }
}
