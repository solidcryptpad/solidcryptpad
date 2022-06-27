import { SharedResource } from './shared-resource';

export interface SharedWithMeResource extends SharedResource {
  ownerPod: string;
}
