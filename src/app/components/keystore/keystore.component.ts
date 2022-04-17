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
    this.keystoreService.setMasterPassword('testPassword182617042022');
    const fileID = 'test' + Math.floor(Math.random() * 100);
    this.keystoreService.storeKey(
      fileID,
      this.keystoreService.generateNewKey()
    );

    console.log(
      `The Key of ${fileID} is: ${this.keystoreService.getKey(fileID)}`
    );
  }
}
