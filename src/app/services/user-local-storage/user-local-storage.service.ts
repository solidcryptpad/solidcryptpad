import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class UserLocalStorage implements Storage {
  private static readonly USER_KEYS_KEY: string = 'USER_STORAGE_KEYS';

  private get keys(): string[] {
    const keys = localStorage.getItem(UserLocalStorage.USER_KEYS_KEY);

    if (keys == null) {
      return [];
    } else {
      return JSON.parse(keys);
    }
  }

  private set keys(keys: string[]) {
    localStorage.setItem(UserLocalStorage.USER_KEYS_KEY, JSON.stringify(keys));
  }

  get length(): number {
    return this.keys.length;
  }

  clear(): void {
    const keys = this.keys;
    for (const i of keys) {
      localStorage.removeItem(i);
    }
    this.keys = [];
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

    const keys = this.keys;
    this.keys = keys.filter((value) => {
      return value != key;
    });

    localStorage.removeItem(key);
  }

  setItem(key: string, value: string): void {
    if (!this.keys.includes(key)) {
      const keys = this.keys;
      keys.push(key);

      this.keys = keys;
    }

    localStorage.setItem(key, value);
  }
}
