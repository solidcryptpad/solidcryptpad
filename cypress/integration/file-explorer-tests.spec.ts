describe('File-Explorer Test', function () {
  beforeEach(function () {
    cy.createRandomAccount().then(cy.loginMocked).as('user');
  });

  it('Open podUrl and show root folder', function () {
    cy.contains('Files').click();
    cy.contains('solidcryptpad');
  });

  it('creates /solidcryptpad folder if root is not given and /solidcryptpad does not exist', function () {
    const solidcryptpadUrl = `${this.user.podUrl}/solidcryptpad/`;
    cy.intercept('GET', solidcryptpadUrl).as('getSolidcryptpadFolder');
    cy.intercept('PUT', solidcryptpadUrl).as('putSolidcryptpadFolder');

    // checks if it does exist and creates it
    cy.contains('Files').click();
    cy.wait('@getSolidcryptpadFolder')
      .its('response.statusCode')
      .should('eq', 404);
    cy.wait('@putSolidcryptpadFolder')
      .its('response.statusCode')
      .should('eq', 201);
  });

  it('automatically shows contents of the root folder', function () {
    cy.givenFile(this.user, `${this.user.podUrl}/solidcryptpad/file.txt`);

    cy.contains('Files').click();
    cy.contains('file.txt');
  });

  it('Open PodUrl and show new folder', function () {
    const folderUrl = 'test-folder';
    cy.givenFolder(
      this.user,
      this.user.podUrl + '/solidcryptpad/' + folderUrl + '/'
    );
    cy.contains('Files').click();

    cy.contains(folderUrl);
  });

  it('Open PodUrl and show new File', function () {
    const fileUrl = 'file.txt';
    const fileContent = 'some random text content';
    cy.givenFile(
      this.user,
      this.user.podUrl + '/solidcryptpad/' + fileUrl,
      fileContent
    );
    cy.contains('Files').click();
    cy.contains(fileUrl);
  });

  it('Open PodUrl and show new nested folder', function () {
    const folderName = 'testFolder';
    const nestedFolderName = 'nested';
    cy.givenFolder(
      this.user,
      this.user.podUrl + '/solidcryptpad/' + nestedFolderName + '/' + folderName
    );
    cy.contains('Files').click();
    cy.contains(nestedFolderName);

    cy.get('#nested_expand').click();
    cy.contains(folderName);
  });

  it('Open PodUrl and show new file in nested folder', function () {
    const fileName = 'testFile.txt';
    const folderName = 'TestFolder';
    cy.givenFile(
      this.user,
      this.user.podUrl + '/solidcryptpad/' + folderName + '/' + fileName
    );
    cy.contains('Files').click();
    cy.contains(folderName);

    cy.get('[id=TestFolderNode] button:first').click();
    cy.contains(fileName);
  });
});
