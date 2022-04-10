import { Component, OnInit } from '@angular/core';
import { KeystoreService } from 'src/app/services/keystore.service';

@Component({
  selector: 'app-keystore',
  templateUrl: './keystore.component.html',
  styleUrls: ['./keystore.component.scss'],
})
export class KeystoreComponent implements OnInit {
  constructor(private keystoreService: KeystoreService) {}

  ngOnInit(): void {
    this.keystoreService.storeKey(
      'test',
      this.keystoreService.generateNewKey()
    );
  }
}
