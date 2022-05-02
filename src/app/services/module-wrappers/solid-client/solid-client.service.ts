import { Injectable } from '@angular/core';
import * as solidClient from '@inrupt/solid-client';

/**
 * Wraps @inrupt/solid-client, so it can be mocked in tests
 */
@Injectable({
  providedIn: 'root',
})
export class SolidClientService {
  constructor() {
    // return solid-client when creating a new instance
    return solidClient;
  }
}

// merge solid-client type with SolidClientService
type SolidClientType = typeof solidClient;
// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface SolidClientService extends SolidClientType {}
