describe('File sharing', function () {
  beforeEach(function () {
    cy.createRandomAccount()
      .then(cy.storeMasterPassword)
      .then(cy.loginMocked)
      .as('owner');
    cy.createRandomAccount().as('friend');
  });

  it('can view file after sharing read-only link', function () {
    // creating file
    const fileName = 'test.txt';
    const fileContent = 'some file content';
    cy.contains('Files').click();
    cy.explorerUploadFileIn('solidcryptpad', fileName, new Blob([fileContent]));

    cy.explorerOpenMenu(fileName);
    cy.contains('Share File').click();
    cy.contains('Create Link').click();
    cy.contains('freshly baked', { timeout: 60000 });

    // save link for later
    cy.getSharingLink().as('link');

    // Use shared link
    cy.loginMocked(this.friend);
    cy.get('@link').then((link) => {
      cy.log(link);
      cy.visit(link as string);
    });
    cy.contains(fileContent);
    cy.contains('You can not edit this file');
  });

  it('can edit file after sharing read-write link', function () {
    // creating file
    const fileName = 'test.txt';
    const fileUrl = `${this.owner.podUrl}/solidcryptpad/${fileName}`;
    const fileContent = 'some file content';
    cy.contains('Files').click();
    cy.explorerUploadFileIn('solidcryptpad', fileName, new Blob([fileContent]));

    cy.explorerOpenMenu(fileName);
    cy.contains('Share File').click();
    cy.contains('Write').click();
    cy.contains('Create Link').click();
    cy.contains('freshly baked', { timeout: 60000 });

    // save link for later
    cy.getSharingLink().as('link');

    // Use shared link
    cy.loginMocked(this.friend);
    cy.get('@link').then((link) => {
      cy.log(link);
      cy.visit(link as string);
    });
    cy.contains(fileContent);

    // modifying file
    const modifiedFileContent = 'this is the modified version';
    cy.openFileInEditor(fileUrl);
    cy.get('ngx-editor [contenteditable]').clear().type(modifiedFileContent);
    cy.contains('Save and close').click();
    cy.contains('saved');

    // creator can see the changes
    cy.loginMocked(this.owner);
    cy.openFileInPreview(fileUrl);
    cy.contains('Preview from');
    cy.contains(modifiedFileContent);
  });
});
