describe('File-Preview Test', function () {
  beforeEach(function () {
    cy.createRandomAccount()
      .then(cy.storeMasterPassword)
      .then(cy.loginMocked)
      .as('user');
  });

  it('can upload text file to folder and show preview', function () {
    cy.contains('Files').click();
    cy.contains('solidcryptpad');
    const fileName = 'test.txt';
    const fileContent = 'some file content';
    cy.explorerUploadFileIn('solidcryptpad', fileName, new Blob([fileContent]));
    cy.get('[data-cy="open-node"]').click();
    cy.contains('Preview from ');
    cy.contains(fileName);
    cy.contains('Open in editor');
    cy.contains(fileContent);
  });

  it('can upload markdown file to folder and show preview', function () {
    cy.contains('Files').click();
    cy.contains('solidcryptpad');
    const fileName = 'mdTest.md';
    const fileContent = '## some file content\n1. hallo\n2. test';
    cy.explorerUploadFileIn('solidcryptpad', fileName, new Blob([fileContent]));

    cy.get('[data-cy="open-node"]').click();
    cy.contains('Preview from ');
    cy.contains(fileName);
    cy.contains('Open in editor');
    cy.contains('some file content');
    cy.contains('hallo');
    cy.contains('test');
  });

  it('Create file in Editor and show it in Preview', function () {
    const fileName = 'example.txt';
    const fileContent = 'some file content';
    const fileUrl = this.user.podUrl + '/solidcryptpad/' + fileName;
    cy.intercept('PUT', fileUrl).as('savedExample');

    cy.openNewFileInEditor(fileUrl);

    cy.get('ngx-editor').type(fileContent);

    // wait for all savings so far
    cy.wait('@savedExample');
    cy.wait('@savedExample');

    // close and wait for the final saving
    cy.contains('Save and close file').click();
    cy.wait('@savedExample');
    cy.url().should('not.include', 'Example');

    cy.contains('Files').click();

    cy.contains(fileName);
    cy.get('[data-cy="open-node"]').click();
    cy.contains('Preview from ');
    cy.contains(fileName);
    cy.contains('Open in editor');
    cy.contains(fileContent);
  });
});
