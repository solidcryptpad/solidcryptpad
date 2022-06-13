describe('Folder sharing', function () {
  beforeEach(function () {
    cy.createRandomAccount()
      .then(cy.loginMocked)
      .then(cy.storeMasterPassword)
      .as('owner');
    cy.createRandomAccount().as('friend');
  });

  // TODO: test with files that already had their own acl file before sharing
  it('can browse and view files after sharing read-only link', function () {
    const folderName = 'test';
    const fileName = 'file.txt';
    const fileContent = 'Hello World';

    // file preparation
    cy.contains('Files').click();
    cy.explorerCreateFolderIn('solidcryptpad', folderName);
    cy.explorerUploadFileIn(folderName, fileName, new Blob([fileContent]));

    // sharing
    cy.explorerOpenMenu(folderName);
    cy.contains('Share Folder').click();
    cy.contains('freshly baked');

    cy.get('code')
      .then((el) => cy.wrap(el.contents().text()))
      .as('link');

    // opening link as other user
    cy.loginMocked(this.friend);
    cy.get('@link').then((link) => {
      cy.log(link);
      cy.visit(link);
    });

    // opening shared file
    cy.contains(folderName);
    cy.explorerOpenNode(fileName);
    cy.contains(fileContent);
  });
});
