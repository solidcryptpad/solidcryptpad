import { Component, OnInit } from '@angular/core';
import { ProfileService } from '../../services/profile/profile.service';
import { from, Observable } from 'rxjs';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent implements OnInit {
  constructor(private profileService: ProfileService) {}

  name$: Observable<string> | undefined;

  ngOnInit(): void {
    this.name$ = from(this.profileService.getUserName());
  }
}
