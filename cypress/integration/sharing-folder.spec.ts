import { UserConfig } from 'cypress/support/commands';

describe('Folder sharing', function () {
  beforeEach(function () {
    cy.createRandomAccount()
      .then(cy.loginMocked)
      .then(cy.storeMasterPassword)
      .as('owner');
    cy.createRandomAccount().as('friend');
  });

  // this test case does not succeed, because our link sharing mechanism does not work with CSS currently
  it.skip('can browse files after sharing', function () {
    setupTestFolder(this.owner);

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

    cy.contains('Close').click();
    cy.get('[data-cy=nav-account-icon]').click();
    cy.contains('Logout').click();
    cy.loginMocked(this.friend);
    cy.get('@link').then((link) => {
      cy.log(link);
      cy.visit(link as string);
    });

    cy.contains('test');
    cy.contains('nested');
    cy.contains('file.txt');
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
