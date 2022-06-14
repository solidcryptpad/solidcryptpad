import { TestBed } from '@angular/core/testing';

import { UserLocalStorage } from './user-local-storage.service';

describe('LocalStorageServiceService', () => {
  let service: UserLocalStorage;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(UserLocalStorage);

    localStorage.clear();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('setitems should save value to localstorage', () => {
    const old_length = localStorage.length;
    service.setItem('test', 'test');

    expect(localStorage.length).toBeGreaterThan(old_length);
  });

  it('getItem returns value', () => {
    service.setItem('test', 'test');

    expect(service.getItem('test')).toBe('test');
  });

  it('removeItem removes item', () => {
    service.setItem('test', 'test');
    service.removeItem('test');

    expect(service.getItem('test')).toBeNull();
  });

  it('key returns id of new key', () => {
    const old_length = localStorage.length;

    service.setItem('test', 'test');

    expect(service.key(old_length)).toBe('test');
  });

  it('key returns null on to big value', () => {
    expect(service.key(10000)).toBeNull();
  });

  it('clear clears all saved keys', () => {
    service.setItem('test', 'test');
    service.setItem('test1', 'test');

    service.clear();
    expect(service.getItem('test')).toBeNull();
    expect(service.getItem('test1')).toBeNull();
  });

  it('clear does not clear non user keys', () => {
    localStorage.setItem('test', 'test');
    service.setItem('test1', 'test');

    service.clear();
    expect(localStorage.getItem('test')).toBe('test');
  });
});
