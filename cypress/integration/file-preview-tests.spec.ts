describe('File-Preview Test', function () {
  beforeEach(function () {
    cy.createRandomAccount()
      .then(cy.loginMocked)
      .then(cy.storeMasterPassword)
      .as('user');
  });

  it('can upload text file to folder and show preview', function () {
    cy.contains('Files').click();
    cy.contains('Folder URL');
    const fileName = 'test.txt';
    const fileContent = 'some file content';
    cy.explorerUploadFileIn('solidcryptpad', fileName, new Blob([fileContent]));
    cy.get('[data-cy="open-node"]').click();
    cy.contains('Preview from ');
    cy.contains(fileName);
    cy.contains('open in Editor');
    cy.contains(fileContent);
  });

  it('can upload markdown file to folder and show preview', function () {
    cy.contains('Files').click();
    cy.contains('Folder URL');
    const fileName = 'mdTest.md';
    const fileContent = '## some file content\n1. hallo\n2. test';
    cy.explorerUploadFileIn('solidcryptpad', fileName, new Blob([fileContent]));

    cy.get('[data-cy="open-node"]').click();
    cy.contains('Preview from ');
    cy.contains(fileName);
    cy.contains('open in Editor');
    cy.contains('some file content');
    cy.contains('hallo');
    cy.contains('test');
  });

  it('Open ExampleFile in Editor and show it in Preview', function () {
    const fileName = 'ExampleFile1.txt';
    const fileContent = 'some file content';
    const fileUrl = this.user.podUrl + '/solidcryptpad/' + fileName;
    cy.intercept('PUT', fileUrl).as('savedExample');

    cy.contains('Editor').click();

    cy.contains(fileName).click();

    cy.get('ngx-editor').type(fileContent);

    // wait for all savings so far
    cy.wait('@savedExample');
    cy.wait('@savedExample');

    // close and wait for the final saving
    cy.contains('Save and close file').click();
    cy.wait('@savedExample');
    cy.url().should('not.include', 'Example');

    cy.contains('Files').click();
    //cy.get('#solidcryptpad_expand').click();

    cy.contains(fileName);
    cy.get('[data-cy="open-node"]').click();
    cy.contains('Preview from ');
    cy.contains(fileName);
    cy.contains('open in Editor');
    cy.contains(fileContent);
  });
});
