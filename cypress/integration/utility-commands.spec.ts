describe('utility commands work as expected', () => {
  beforeEach(() => {
    cy.createRandomAccount().as('user');
  });

  it('cy.givenFolder creates a top level folder', function () {
    const folderUrl = `${this.user.podUrl}/test-folder/`;
    cy.givenFolder(this.user, folderUrl);
    cy.authenticatedRequest(this.user, folderUrl);
  });

  it('cy.givenFolder creates a top level folder', function () {
    const folderUrl = `${this.user.podUrl}/some/nested/test-folder/`;
    cy.givenFolder(this.user, folderUrl);
    cy.authenticatedRequest(this.user, folderUrl);
  });

  it('cy.givenFile creates a text file with content', function () {
    const fileUrl = `${this.user.podUrl}/some/nested/folder/file.txt`;
    const fileContent = 'some random text content';
    cy.givenFile(this.user, fileUrl, fileContent);
    cy.authenticatedRequest(this.user, fileUrl)
      .its('body')
      .should('equal', fileContent);
  });

  it('cy.givenFile creates binary file', function () {
    const fileUrl = `${this.user.podUrl}/some/nested/folder/file.bin`;
    // generate some data
    const uintArray = new Uint8Array(new ArrayBuffer(512));
    for (let i = 0; i < uintArray.length; i++) {
      uintArray[i] = i % 256;
    }
    const fileContent = new Blob([uintArray]);
    cy.givenFile(this.user, fileUrl, fileContent);
    cy.authenticatedRequest(this.user, fileUrl)
      .its('headers.content-type')
      .should('equal', 'application/octet-stream');
  });
});
