import { Component, OnInit } from '@angular/core';
import { ProfileService } from '../../services/profile/profile.service';
import { ThingPersisted } from '@inrupt/solid-client';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent implements OnInit {
  constructor(private profileService: ProfileService) {}

  name: string | undefined;
  thing: ThingPersisted | undefined | null;

  ngOnInit(): void {
    this.profileService
      .getUserName()
      .then((username) => (this.name = username));
  }
}
