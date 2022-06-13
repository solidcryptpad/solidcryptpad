describe('Folder sharing', function () {
  beforeEach(function () {
    cy.createRandomAccount()
      .then(cy.loginMocked)
      .then(cy.storeMasterPassword)
      .as('owner');
    cy.createRandomAccount().as('friend');
  });

  it('given read-only link, can browse and view files, but not edit them', function () {
    const folderName = 'test';
    const fileName = 'file.txt';
    const fileContent = 'Hello World';

    // file preparation
    cy.contains('Files').click();
    cy.explorerCreateFolderIn('solidcryptpad', folderName);
    cy.explorerUploadFileIn(folderName, fileName, new Blob([fileContent]));

    // sharing
    cy.explorerOpenMenu(folderName);
    cy.contains('Share Folder (read only)').click();
    cy.contains('freshly baked');

    cy.get('code')
      .then((el) => cy.wrap(el.contents().text()))
      .as('link');

    // opening link as other user
    cy.loginMocked(this.friend);
    cy.get('@link').then(cy.visit);

    // opening shared file
    cy.contains(folderName);
    cy.explorerOpenNode(fileName);
    cy.url().as('filePreviewUrl');
    cy.contains(fileContent);

    const fileUrl = `${this.owner.podUrl}/solidcryptpad/${folderName}/${fileName}`;
    const newFileContent = 'Goodbye World!';
    cy.intercept('PUT', fileUrl).as('savedFile');
    cy.contains('open in Editor').click();
    cy.contains('You are editing');
    cy.contains(fileContent);
    cy.get('ngx-editor').clear().type(newFileContent);
    cy.wait('@savedFile');

    cy.contains('Permission denied');
  });

  it('can edit and upload files after sharing read-write link', function () {
    const folderName = 'test';
    const fileName = 'file.txt';
    const fileContent = 'Hello World';

    // file preparation
    cy.contains('Files').click();
    cy.explorerCreateFolderIn('solidcryptpad', folderName);
    cy.explorerUploadFileIn(folderName, fileName, new Blob([fileContent]));

    // sharing
    cy.explorerOpenMenu(folderName);
    cy.contains('Share Folder (read+write)').click();
    cy.contains('freshly baked');

    cy.get('code')
      .then((el) => cy.wrap(el.contents().text()))
      .as('link');

    // opening link as other user
    cy.loginMocked(this.friend);
    cy.get('@link').then(cy.visit);

    // opening shared file
    cy.contains(folderName);
    cy.explorerOpenNode(fileName);
    cy.url().as('filePreviewUrl');
    cy.contains(fileContent);

    const fileUrl = `${this.owner.podUrl}/solidcryptpad/${folderName}/${fileName}`;
    const newFileContent = 'Goodbye World!';
    cy.intercept('PUT', fileUrl).as('savedFile');
    cy.contains('open in Editor').click();
    cy.contains('You are editing');
    cy.contains(fileContent);
    cy.get('ngx-editor').clear().type(newFileContent);
    cy.wait('@savedFile');

    cy.get('@filePreviewUrl').then(cy.visit);
    cy.contains('Preview from');
    cy.contains(newFileContent);
  });

  // this should be tested, because this requires huge extra steps for the permission logic
  it(
    'can view file which already was shared as a single file, after sharing read-only folder link'
  );
});
