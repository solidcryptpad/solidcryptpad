describe('Text-Editor Test', function () {
  beforeEach(function () {
    cy.createRandomAccount()
      .then(cy.loginMocked)
      .then(cy.storeMasterPassword)
      .as('user');

    cy.intercept('GET', '*/solidcryptpad/ExampleFile0.txt').as(
      'fetchedExample0'
    );
    cy.intercept('PUT', '*/solidcryptpad/ExampleFile0.txt').as('savedExample0');
  });

  /**
   Open the editor without a file and check display of error msg and redirect to files
   **/
  it('open editor without files and redirect', function () {
    cy.visit('/editor', {
      qs: {
        filename: '',
      },
    });
    cy.wait(500);
    cy.contains('No Filename given');
    cy.url().should('contain', '/files');
  });

  /**
   Open a example file and check the correct state of editor.
   **/
  it('open example file and display editor', function () {
    cy.openNewFileInEditor(
      this.user.podUrl + '/solidcryptpad/ExampleFile0.txt'
    );
    cy.contains('solidcryptpad/ExampleFile0.txt');
    cy.contains('You are editing');
    cy.contains('Save and close');
  });

  /**
  Open a file, edit the content and save it.
  Then reopen the file and check the content.
   **/
  it('Edit file content and save it and reopen it', function () {
    cy.openNewFileInEditor(
      this.user.podUrl + '/solidcryptpad/ExampleFile0.txt'
    );
    cy.contains('solidcryptpad/ExampleFile0.txt');
    cy.wait('@savedExample0');
    cy.get('.NgxEditor').type('Hello world!');
    cy.wait('@savedExample0');
    cy.contains('Save and close file').click();
    cy.wait('@savedExample0');
    cy.openFileInEditor(this.user.podUrl + '/solidcryptpad/ExampleFile0.txt');
    cy.contains('Hello world!');
  });

  /**
   Open a file without auto save and edit the content and close it.
   Then reopen the file and check that the file response is the same as before.
   **/
  it('Edit file content and save it and reopen it', function () {
    cy.openNewFileInEditor(
      this.user.podUrl + '/solidcryptpad/ExampleFile0.txt'
    );
    cy.wait('@fetchedExample0').its('response.body').as('initialResponseBody');
    cy.contains('Auto-Save').click();
    cy.contains('solidcryptpad/ExampleFile0.txt');
    cy.get('.NgxEditor').type('ABCDEFG');
    cy.contains('Close file without saving').click();

    cy.openNewFileInEditor(
      this.user.podUrl + '/solidcryptpad/ExampleFile0.txt'
    );
    cy.get('@initialResponseBody').then((initialResponseBody) =>
      cy
        .wait('@fetchedExample0')
        .its('response.body')
        .should('deep.equal', initialResponseBody)
    );
  });
});
