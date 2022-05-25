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
      /**
       * Create a new account and returns a user config with info about it
       */
      createRandomAccount(): Chainable<UserConfig>;

      /**
       * Login via UI using user credentials. Only use this for tests related to the authentication service, else use loginMocked
       */
      loginViaUI(user: UserConfig): Chainable<UserConfig>;

      /**
       * Login by mocking the authentication service to skip the UI login
       */
      loginMocked(user: UserConfig): Chainable<UserConfig>;

      /**
       * Create a folder at given url using user credentials
       */
      givenFolder(user: UserConfig, url: string): Chainable<void>;

      /**
       * Create a file at given url using user credentials
       */
      givenFile(
        user: UserConfig,
        url: string,
        content?: Cypress.RequestBody,
        options?: { contentType?: string }
      ): Chainable<void>;

      /**
       * Fill out and submit the master password dialog with user credentials
       */
      enterMasterPassword(user: UserConfig): Chainable<void>;

      /**
       * Make an authenticated cy.request using user credentials
       */
      authenticatedRequest(
        user: UserConfig,
        ...args: Parameters<Cypress.Chainable['request']>
      ): Chainable<void>;
    }
  }
  interface Window {
    cypress?: CypressWindowTransfer;
  }
}

interface CypressWindowTransfer {
  authenticationMock:
    | {
        use: false;
      }
    | {
        use: true;
        fetch: typeof window['fetch'];
        webId: string;
      };
}