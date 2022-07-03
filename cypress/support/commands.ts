// ***********************************************
// For comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************

import {
  getAuthenticatedFetch,
  getAuthenticatedRequest,
} from './css-authentication';
import * as uuid from 'uuid';
import * as cryptoJS from 'crypto-js';

// page load usually takes a lot of time, hence it should have a longer timeout
const PAGE_LOAD_TIMEOUT = 30000;

export interface UserConfig {
  idp: string;
  podUrl: string;
  webId: string;
  username: string;
  password: string;
  masterPassword: string;
  email: string;
}

Cypress.Commands.add(
  'explorerCreateFolderIn',
  (parentFolderName: string, folderName: string) => {
    cy.explorerOpenMenu(parentFolderName);
    cy.contains('Create Folder').click();
    cy.get('#create-folder').type(folderName);
    cy.contains('button', 'Create').click();
  }
);

Cypress.Commands.add('openNewFileInEditor', (fileUrl) => {
  cy.visit('/editor', {
    qs: {
      fileToCreate: fileUrl,
    },
  });
  // creating file and switching page can take a lot of time
  cy.contains(fileUrl, { timeout: 30000 });
});

Cypress.Commands.add('openFileInPreview', (fileUrl) => {
  cy.visit('/preview', {
    qs: {
      url: fileUrl,
    },
  });
  cy.contains(fileUrl, { timeout: 30000 });
});

Cypress.Commands.add('openFileInEditor', (fileUrl) => {
  cy.visit('/editor', {
    qs: {
      file: fileUrl,
    },
  });
  cy.contains(fileUrl, { timeout: 30000 });
});

Cypress.Commands.add('getSharingLink', () => {
  cy.get('[data-cy=sharing-link]').then((el) => {
    const link = el.contents().text().trim();
    return cy.wrap(link);
  });
});

Cypress.Commands.add(
  'createRandomAccount',
  function (): Cypress.Chainable<UserConfig> {
    const username = 'test-' + uuid.v4();
    const password = '12345';
    const masterPassword = 'master password';
    const email = username + '@example.org';
    const config = {
      idp: Cypress.env('cssUrl') + '/',
      podUrl: Cypress.env('cssUrl') + '/' + username,
      webId: Cypress.env('cssUrl') + '/' + username + '/profile/card#me',
      username: username,
      password: password,
      masterPassword: masterPassword,
      email: email,
    };
    const registerEndpoint = Cypress.env('cssUrl') + '/idp/register/';
    cy.request('POST', registerEndpoint, {
      createWebId: 'on',
      webId: '',
      register: 'on',
      createPod: 'on',
      podName: username,
      email: email,
      password: password,
      confirmPassword: password,
    });

    // replace default card, because it does not contain a name and pod urls
    // which we assume to exist in the pod
    const cardUrl = config.webId.substring(0, config.webId.lastIndexOf('#'));
    cy.intercept(cardUrl, { fixture: 'profile-card.ttl' });

    return cy.wrap(config);
  }
);

Cypress.Commands.add('loginViaUI', function (user) {
  const typeFastConfig = {
    delay: 0,
  };
  cy.log('login', user);
  cy.visit('/');

  cy.get('#provider').type(Cypress.env('cssUrl') + '/');
  cy.contains('LOGIN').click();

  cy.url({ timeout: PAGE_LOAD_TIMEOUT }).should('include', user.idp);

  cy.get('label').contains('Email').click().type(user.email, typeFastConfig);
  cy.get('label')
    .contains('Password')
    .click()
    .type(user.password, typeFastConfig);
  cy.contains('button', 'Log in').click();

  cy.url({ timeout: PAGE_LOAD_TIMEOUT }).should('include', '/consent');
  cy.contains('button', 'Consent').click();

  // wait until app processed login credentials
  cy.url({ timeout: PAGE_LOAD_TIMEOUT }).should(
    'include',
    Cypress.config().baseUrl + '/'
  );
  cy.contains('Welcome to your personal area');

  // return user for convenient chaining
  return cy.wrap(user);
});

Cypress.Commands.add('loginMocked', function (user) {
  getAuthenticatedFetch(user).then((authFetch) => {
    cy.on('window:before:load', (win) => {
      win.cypress = {
        authenticationMock: {
          use: true,
          fetch: authFetch,
          webId: user.webId,
        },
      };
    });
  });
  cy.visit('/');
  return cy.wrap(user);
});

Cypress.Commands.add('authenticatedRequest', (user, ...args) => {
  return getAuthenticatedRequest(user).then((request) => request(...args));
});

Cypress.Commands.add('givenFolder', (user, url) => {
  if (!url.endsWith('/')) url += '/';
  // Solid allows PUT-ting containser, if the url ends with /
  cy.authenticatedRequest(user, {
    url,
    method: 'PUT',
    headers: {
      'content-type': 'text/turtle',
    },
  });
});

Cypress.Commands.add('givenFile', (user, url, content, options = {}) => {
  const contentType =
    options.contentType ??
    (typeof content === 'string' ? 'text/plain' : 'application/octet-stream');
  cy.authenticatedRequest(user, {
    url,
    method: 'PUT',
    headers: {
      'content-type': contentType,
    },
    body: content,
  });
});

const MASTER_PASSWORD_KEY = 'masterPasswordHash';
const USER_KEYS_KEY = 'USER_STORAGE_KEYS';

Cypress.Commands.add('enterMasterPassword', (user) => {
  /* when directly using cy.get(input...).type(masterPassword)
    it sometimes failed, I guess because the typing wasn't yet processed by the input
    Therefore this tries to make the input process the typing
    and ensures it's processed completely before continuing */
  cy.get('input[data-cy=master-password-input]').click();
  cy.wait(1000);
  cy.get('input[data-cy=master-password-input]').type(user.masterPassword);
  cy.get('input[data-cy=master-password-input]').should(
    'have.value',
    user.masterPassword
  );
  cy.get('body').then(($body) => {
    if ($body.find('input[data-cy=master-password-input-confirm]').length) {
      cy.get('input[data-cy=master-password-input-confirm]').click();
      cy.wait(1000);
      cy.get('input[data-cy=master-password-input-confirm]').type(
        user.masterPassword
      );
      cy.get('input[data-cy=master-password-input-confirm]').should(
        'have.value',
        user.masterPassword
      );
    }
  });

  cy.contains('Ok').click();
  cy.window()
    .its('localStorage')
    .should('satisfy', (ls) => ls.getItem(MASTER_PASSWORD_KEY) !== null);
});

Cypress.Commands.add('storeMasterPassword', (user) => {
  cy.window().then((win) => {
    // make the application aware that the masterpassword is set
    const userKeys = JSON.parse(
      win.localStorage.getItem(USER_KEYS_KEY) ?? '[]'
    );
    userKeys.push(MASTER_PASSWORD_KEY);
    win.localStorage.setItem(USER_KEYS_KEY, JSON.stringify(userKeys));
    // set the masterpassword
    win.localStorage.setItem(
      MASTER_PASSWORD_KEY,
      hashMasterPassword(user.masterPassword)
    );
  });
  return cy.wrap(user);
});

function hashMasterPassword(masterPassword: string): string {
  const salt = '1205sOlIDCryptPADsalt1502';
  return cryptoJS.SHA256(masterPassword + salt).toString();
}

Cypress.Commands.add('explorerOpenMenu', (itemName: string) => {
  cy.get('app-tree-nested-explorer')
    .contains(itemName)
    .closest('[data-cy=tree-node]')
    .find('[data-cy=folder-menu]')
    .click();
});

Cypress.Commands.add('explorerOpenNode', (itemName: string) => {
  cy.contains(itemName).find('[data-cy=open-node]').click();
});

Cypress.Commands.add(
  'explorerUploadFileIn',
  (parentFolderName: string, fileName: string, fileContent: Blob) => {
    cy.intercept('PUT', `/${parentFolderName}/${fileName}`).as('savedExample');
    cy.explorerOpenMenu(parentFolderName);
    cy.contains('Upload Files').click();
    cy.wrap(Cypress.Blob.blobToArrayBuffer(fileContent)).as(
      'fileContentBuffer'
    );
    cy.get('@fileContentBuffer').then((buffer) =>
      cy.get('input[type=file]').selectFile({
        contents: Cypress.Buffer.from(buffer),
        fileName,
      })
    );
    cy.contains(fileName);
    cy.get('.mat-dialog-actions').contains('button', 'Upload').click();

    // wait until dialog closed
    cy.contains('File Upload').should('not.exist');
    cy.contains(fileName);
  }
);
