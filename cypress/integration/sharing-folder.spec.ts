import { UserConfig } from 'cypress/support/commands';

describe('Folder sharing', function () {
  beforeEach(function () {
    cy.createRandomAccount()
      .then(cy.loginMocked)
      .then(cy.storeMasterPassword)
      .as('owner');
    cy.createRandomAccount().as('friend');
  });

  // TODO: test with files that already had their own acl file before sharing
  it('can browse files after sharing read-only link', function () {
    const urls = setupTestFolder(this.owner);

    cy.contains('Files').click();
    cy.contains('test');

    cy.contains('test')
      .closest('[data-cy=tree-node]')
      .find('[data-cy=folder-menu]')
      .click();
    cy.contains('Share Folder').click();
    cy.contains('freshly baked');

    cy.get('code')
      .then((el) => {
        const link = el.contents().text();
        return cy.wrap(link);
      })
      .as('link');
    /*
    cy.contains('Close').click();
    cy.get('[data-cy=nav-account-icon]').click();
    cy.contains('Logout').click();
*/
    cy.loginMocked(this.friend);
    cy.get('@link').then((link) => {
      cy.log(link);
      cy.visit(link as string);
    });
    cy.get('#nested_expand').click();

    cy.contains('test');
    cy.contains('file.txt');
    cy.contains('nested');
    cy.contains('nested.txt');
    cy.get('@link').then((link) => {
      const params = new URLSearchParams(new URL(link).search);
      const groupUrl = params.get('group');
      cy.authenticatedRequest(this.owner, {
        method: 'GET',
        url: groupUrl,
      });
      cy.authenticatedRequest(this.owner, {
        method: 'GET',
        url: urls.testFolder + '.acl',
      });
    });
  });
});

function setupTestFolder(user: UserConfig) {
  const testFolderUrl = user.podUrl + '/solidcryptpad/test/';
  const urls = {
    testFolder: testFolderUrl,
    testFile: testFolderUrl + 'file.txt',
    nestedFolder: testFolderUrl + 'nested/',
    nestedFile: testFolderUrl + 'nested/nested.txt',
  };
  cy.givenFolder(user, urls.testFolder);
  cy.givenFolder(user, urls.nestedFolder);
  cy.givenFile(user, urls.testFile, 'test');
  cy.givenFile(user, urls.nestedFile, 'nested test');

  return urls;
}
