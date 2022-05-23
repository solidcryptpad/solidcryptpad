// ***********************************************
// For comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************

import { getAuthenticatedRequest } from './css-authentication';
import * as uuid from 'uuid';

// page load usually takes a lot of time, hence it should have a longer timeout
const PAGE_LOAD_TIMEOUT = 30000;

Cypress.Commands.add('createRandomAccount', function () {
  const username = 'test-' + uuid.v4();
  const password = '12345';
  const masterPassword = 'master password';
  const email = username + '@example.org';
  const config = {
    idp: Cypress.config().cssUrl + '/',
    podUrl: Cypress.config().cssUrl + '/' + username,
    webId: Cypress.config().cssUrl + '/' + username + '/profile/card#me',
    username: username,
    password: password,
    masterPassword: masterPassword,
    email: email,
  };
  const registerEndpoint = Cypress.config().cssUrl + '/idp/register/';
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
});

/**
 * Manually logins the user
 * Assumes it is previously not logged in
 */
Cypress.Commands.add('login', function (user) {
  const typeFastConfig = {
    delay: 0,
  };
  cy.log('login', user);
  cy.visit('/');

  cy.get('#provider').type(Cypress.config().cssUrl + '/');
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
});

/**
 * Requests new tokens for user and makes an authenticated cy.request with it
 *
 * @param {object} user
 * @param {any[]} args cy.request args
 */
Cypress.Commands.add('authenticatedRequest', (user, ...args) => {
  return getAuthenticatedRequest(user).then((request) => request(...args));
});

/**
 * create a folder
 *
 * @param {object} user the user who has permissions to create this folder
 * @param {string} url the url of the new folder
 */
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

/**
 * @param {object} user the user who has permissions to create this file
 * @param {string} url the url of the new file
 * @param {string|blob} content content of the new file
 * @param {object} options
 */
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

/**
 * fills out and submits a master password dialog
 */
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

  cy.contains('Ok').click();
});
