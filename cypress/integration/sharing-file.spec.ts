describe('File sharing', function () {
  beforeEach(function () {
    cy.createRandomAccount()
      .then(cy.loginMocked)
      .then(cy.storeMasterPassword)
      .as('owner');
    cy.createRandomAccount().as('friend');
  });

  it('can view file after sharing read-only link', function () {
    // creating file
    const fileName = 'test.txt';
    const fileContent = 'some file content';
    cy.contains('Files').click();
    cy.contains('Folder URL');
    cy.get('mat-tree-node')
      .contains('solidcryptpad')
      .closest('[data-cy=tree-node]')
      .find('[data-cy=folder-menu]')
      .as('solidcryptpad-menu');
    cy.get('@solidcryptpad-menu').click();
    cy.contains('Upload Files').click();
    cy.get('input[type=file]').selectFile({
      contents: Cypress.Buffer.from(fileContent),
      fileName,
    });
    cy.contains(fileName);
    cy.get('.mat-dialog-actions').contains('button', 'Upload').click();
    // wait until dialog closed
    cy.contains('File Upload').should('not.exist');

    cy.contains(fileName);
    cy.get('[data-cy="open-node"]').click();
    cy.contains('Preview from ');
    cy.contains(fileName);
    cy.contains('open in Editor').click();
    cy.contains(fileContent);

    cy.contains('Share').click();
    cy.contains('Create Link').click();
    cy.contains('freshly baked');

    // save link for later
    cy.get('code')
      .then((el) => {
        const link = el.contents().text();
        return cy.wrap(link);
      })
      .as('link');

    // Use shared link
    cy.loginMocked(this.friend);
    cy.get('@link').then((link) => {
      cy.log(link);
      cy.visit(link as string);
    });
    cy.contains(fileContent);
    cy.contains('You can not edit this file');
  });

  it('can edit file after sharing read-write link');
});
