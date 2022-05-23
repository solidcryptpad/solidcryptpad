// ***********************************************************
// This example support/index.js is processed and
// loaded automatically before your test files.
//
// This is a great place to put global configuration and
// behavior that modifies Cypress.
//
// You can change the location of this file or turn off
// automatically serving support files with the
// 'supportFile' configuration option.
//
// You can read more here:
// https://on.cypress.io/configuration
// ***********************************************************

// When a command from ./commands is ready to use, import with `import './commands'` syntax
import './commands';
import { UserConfig } from './commands';

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Cypress {
    interface Chainable {
      createRandomAccount(): Chainable<UserConfig>;
      login(user: UserConfig): Chainable<UserConfig>;
      givenFolder(user: UserConfig, url: string): Chainable<void>;
      givenFile(
        user: UserConfig,
        url: string,
        content?: Cypress.RequestBody,
        options?: { contentType?: string }
      ): Chainable<void>;
      enterMasterPassword(user: UserConfig): Chainable<void>;
      authenticatedRequest(
        user: UserConfig,
        ...args: Parameters<Cypress.Chainable['request']>
      ): Chainable<void>;
    }
  }
}
