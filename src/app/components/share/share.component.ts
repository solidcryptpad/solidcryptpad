import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { LinkShareService } from '../../services/link-share/link-share.service';

@Component({
  selector: 'app-share',
  templateUrl: './share.component.html',
  styleUrls: ['./share.component.scss'],
})
export class ShareComponent implements OnInit {
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private linkShareService: LinkShareService
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe(async (params) => {
      const group = params['group'];
      const key = params['key'];
      const file = params['file'];

      await this.linkShareService.addWebIdToGroup(group);

      await this.router.navigate(['preview'], {
        queryParams: { url: file, key: key, group: group },
      });
    });
  }
}
