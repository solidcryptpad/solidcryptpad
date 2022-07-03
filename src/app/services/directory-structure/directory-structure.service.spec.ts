import { TestBed } from '@angular/core/testing';
import { ProfileService } from '../profile/profile.service';

import { DirectoryStructureService } from './directory-structure.service';

describe('DirectoryStructureService', () => {
  let service: DirectoryStructureService;
  let profileServiceSpy: jasmine.SpyObj<ProfileService>;

  beforeEach(() => {
    const profileServiceSpyObj = jasmine.createSpyObj('ProfileServiceSpy', [
      'getPodUrl',
    ]);
    TestBed.configureTestingModule({
      providers: [{ provide: ProfileService, useValue: profileServiceSpyObj }],
    });
    service = TestBed.inject(DirectoryStructureService);

    // eslint-disable-next-line unused-imports/no-unused-vars
    profileServiceSpy = TestBed.inject(
      ProfileService
    ) as jasmine.SpyObj<ProfileService>;
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('isInEncryptedDirectory returns false for non-crypto-directory', () => {
    const result = service.isInEncryptedDirectory(
      'https://example.org/test/foo/'
    );
    expect(result).toBeFalse();
  });

  it('isInEncryptedDirectory returns true for crypto-directory', () => {
    const result = service.isInEncryptedDirectory(
      'https://example.org/solidcryptpad/foo/'
    );
    expect(result).toBeTrue();
  });
});
