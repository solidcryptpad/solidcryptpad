describe('File-Explorer Test', function () {
  beforeEach(function () {
    cy.createRandomAccount().as('user');
    cy.get('@user').then(function (user) {
      cy.login(user);
    });
  });

  it('Open podUrl and show standard files, folders and open-Button', function () {
    cy.contains('Files').click();

    cy.contains('open');
    cy.contains('profile');
    cy.contains('README');
  });

  it('Open PodUrl and show new folder', function () {
    const folderUrl = 'test-folder';
    cy.givenFolder(this.user, this.user.podUrl + '/' + folderUrl + '/');
    cy.contains('Files').click();

    cy.contains(folderUrl);
  });

  it('Open PodUrl and show new File', function () {
    const fileUrl = 'file.txt';
    const fileContent = 'some random text content';
    cy.givenFile(this.user, this.user.podUrl + '/' + fileUrl, fileContent);
    cy.contains('Files').click();

    cy.contains(fileUrl);
  });

  it('Open PodUrl and show new nested folder', function () {
    const folderName = 'testFolder';
    const nestedFolderName = 'nested';
    cy.givenFolder(
      this.user,
      this.user.podUrl + '/' + nestedFolderName + '/' + folderName
    );
    cy.contains('Files').click();

    cy.contains(nestedFolderName);

    cy.contains('nested')
      .closest('[data-cy=tree-node]')
      .find('[data-cy=folder-menu]')
      .click();
    cy.contains('Open Folder').click();
    cy.contains(folderName);
  });

  it('Open PodUrl and show new file in nested folder', function () {
    const fileName = 'testFile.txt';
    const folderName = 'TestFolder';
    cy.givenFile(
      this.user,
      this.user.podUrl + '/' + folderName + '/' + fileName
    );
    cy.contains('Files').click();

    cy.contains(folderName);

    cy.get('[id=TestFolderNode] button:first').click();
    cy.contains(fileName);
  });
});
