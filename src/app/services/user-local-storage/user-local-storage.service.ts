import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class UserLocalStorage implements Storage {
  private keys: string[] = [];
  private static readonly USER_KEYS_KEY: string = 'USER_STORAGE_KEYS';

  constructor() {
    const keys = localStorage.getItem(UserLocalStorage.USER_KEYS_KEY);

    if (keys == null) {
      this.keys = [];
    } else {
      this.keys = JSON.parse(keys);
    }
  }

  get length(): number {
    return this.keys.length;
  }

  clear(): void {
    for (const i of this.keys) {
      localStorage.removeItem(i);
      this.keys = [];
    }
    localStorage.removeItem(UserLocalStorage.USER_KEYS_KEY);
  }

  getItem(key: string): string | null {
    if (!this.keys.includes(key)) return null;

    return localStorage.getItem(key);
  }

  key(index: number): string | null {
    if (index < this.keys.length) return this.keys[index];
    else {
      return null;
    }
  }

  removeItem(key: string): void {
    if (!this.keys.includes(key)) return;

    this.keys = this.keys.filter((value) => {
      return value != key;
    });
    localStorage.setItem(
      UserLocalStorage.USER_KEYS_KEY,
      JSON.stringify(this.keys)
    );

    localStorage.removeItem(key);
  }

  setItem(key: string, value: string): void {
    if (!this.keys.includes(key)) {
      this.keys.push(key);
      localStorage.setItem(
        UserLocalStorage.USER_KEYS_KEY,
        JSON.stringify(this.keys)
      );
    }

    localStorage.setItem(key, value);
  }
}
