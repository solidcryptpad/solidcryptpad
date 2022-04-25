import { Injectable } from '@angular/core';
import * as solidClient from '@inrupt/solid-client';

@Injectable({
  providedIn: 'root',
})
export class SolidClientService {
  constructor() {
    return solidClient;
  }
}

type SolidClientType = typeof solidClient;
// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface SolidClientService extends SolidClientType {}
