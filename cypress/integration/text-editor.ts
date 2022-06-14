describe('Text-Editor Test', function () {
  beforeEach(function () {
    cy.createRandomAccount().then(cy.loginMocked).as('user');
    cy.contains('Editor').click();
  });

  /**
   Open the editor without a file and check display of example files
   **/
  it('open editor without files and display example files', function () {
    cy.contains('No filename given. Open an example file');
    cy.contains('ExampleFile0.txt');
  });

  /**
   Open a example file and check the correct state of editor.
   **/
  it('open example file and display editor', function () {
    cy.contains('ExampleFile0.txt').click();
    cy.enterMasterPassword(this.user);
    cy.contains('solidcryptpad/ExampleFile0.txt');
    cy.contains('You are editing');
    cy.contains('Save and close');
  });

  /**
  Open a file, edit the content and save it.
  Then reopen the file and check the content.
   **/
  it('Edit file content and save it and reopen it', function () {
    cy.contains('Open ExampleFile0.txt').click();
    cy.enterMasterPassword(this.user);
    cy.contains('solidcryptpad/ExampleFile0.txt');
    cy.get('.NgxEditor').type('Hello world!');
    cy.contains('Save and close file').click();
    cy.contains('Open ExampleFile0.txt').click();
    cy.contains('Hello world!');
  });

  /**
   Open a file without auto save and edit the content and close it.
   Then reopen the file and check the content.
   **/
  it('Edit file content and save it and reopen it', function () {
    cy.contains('Open ExampleFile0.txt').click();
    cy.enterMasterPassword(this.user);
    cy.wait(500);
    cy.contains('Auto-Save').click();
    cy.contains('solidcryptpad/ExampleFile0.txt');
    cy.get('.NgxEditor').type('ABCDEFG');
    cy.contains('Close file without saving').click();
    cy.contains('Open ExampleFile0.txt').click();
    cy.get('.NgxEditor').should('not.contain', 'ABCDEFG');
  });
});
