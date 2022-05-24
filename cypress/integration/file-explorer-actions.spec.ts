describe('FileExplorer menu actions', function () {
  beforeEach(function () {
    cy.createRandomAccount().then(cy.loginMocked).as('user');
    cy.contains('Files').click();
    cy.contains('Folder URL');
  });

  it('can upload files to folder', function () {
    cy.contains('profile')
      .closest('[data-cy=tree-node]')
      .find('[data-cy=folder-menu]')
      .as('profile-menu');
    cy.get('@profile-menu').click();
    cy.contains('Upload Files').click();

    const fileName = 'file.txt';
    cy.get('input[type=file]').selectFile({
      contents: Cypress.Buffer.from('some file content'),
      fileName,
    });
    cy.contains('file.txt');
    cy.get('.mat-dialog-actions').contains('button', 'Upload').click();
    cy.enterMasterPassword(this.user);
    // wait until dialog closed
    cy.contains('File Upload').should('not.exist');

    cy.get('@profile-menu').click();
    cy.contains('Open Folder').click();
    cy.contains(fileName);
  });

  it('can upload files using drag and drop', function () {
    cy.contains('profile')
      .closest('[data-cy=tree-node]')
      .find('[data-cy=folder-menu]')
      .as('profile-menu');
    cy.get('@profile-menu').click();
    cy.contains('Upload Files').click();

    const fileName = 'file.txt';
    cy.get('.dropzone input').selectFile({
      contents: Cypress.Buffer.from('some file content'),
      action: 'drag-drop',
      fileName,
    });
    cy.contains('file.txt');
    cy.get('.mat-dialog-actions').contains('button', 'Upload').click();
    cy.enterMasterPassword(this.user);
    // wait until dialog closed
    cy.contains('File Upload').should('not.exist');

    cy.get('@profile-menu').click();
    cy.contains('Open Folder').click();
    cy.contains(fileName);
  });
});
