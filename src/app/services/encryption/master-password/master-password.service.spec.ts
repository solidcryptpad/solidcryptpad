import { TestBed } from '@angular/core/testing';
import { MatDialogModule, MAT_DIALOG_DATA } from '@angular/material/dialog';

import { MasterPasswordService } from './master-password.service';

describe('MasterPasswordService', () => {
  let service: MasterPasswordService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [MatDialogModule],
      providers: [
        { provide: MAT_DIALOG_DATA, useValue: {} },
        MasterPasswordService,
      ],
    });
    service = TestBed.inject(MasterPasswordService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should set master password', async () => {
    service.setMasterPassword('testpwd');
    expect(await service.getMasterPassword()).not.toEqual('');
  });

  it('should hash master password', async () => {
    service.setMasterPassword('testpwd');
    expect(await service.getMasterPassword()).not.toEqual('testpwd');
  });
});
