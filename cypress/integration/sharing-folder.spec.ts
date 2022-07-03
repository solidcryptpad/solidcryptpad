describe('Folder sharing', function () {
  beforeEach(function () {
    cy.createRandomAccount()
      .then(cy.storeMasterPassword)
      .then(cy.loginMocked)
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
    cy.contains('Share Folder').click();
    cy.contains('Create Link').click();
    cy.contains('freshly baked');

    cy.getSharingLink().as('link');

    // opening link as other user
    cy.loginMocked(this.friend);
    cy.get('@link').then(cy.visit);

    // opening shared file
    cy.contains(folderName);
    cy.explorerOpenNode(fileName);
    cy.url().as('filePreviewUrl');
    cy.contains(fileContent);
    cy.contains('You can not edit this file');
  });

  // testing, because the logic is complex to give access to files which already have an ACL file
  it('given read-only link and file that already had an acl file, can view file', function () {
    const folderName = 'test';
    const fileName = 'file.txt';
    const fileContent = 'Hello World';
    const fileUrl = `${this.owner.podUrl}/solidcryptpad/${folderName}/${fileName}`;

    // file preparation
    cy.contains('Files').click();
    cy.explorerCreateFolderIn('solidcryptpad', folderName);
    cy.explorerUploadFileIn(folderName, fileName, new Blob([fileContent]));

    // set specific acl for this file
    cy.authenticatedRequest(this.owner, {
      method: 'PUT',
      url: fileUrl + '.acl',
      body: createAclForWebId(this.owner.webId, './' + fileName),
      headers: {
        'content-type': 'text/turtle',
      },
    });

    // sharing
    cy.explorerOpenMenu(folderName);
    cy.contains('Share Folder').click();
    cy.contains('Create Link').click();
    cy.contains('freshly baked');

    cy.getSharingLink().as('link');

    // opening link as other user
    cy.loginMocked(this.friend);
    cy.get('@link').then(cy.visit);

    // opening shared file
    cy.contains(folderName);
    cy.explorerOpenNode(fileName);
    cy.contains(fileContent);
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
    cy.contains('Share Folder').click();
    cy.contains('Write').click();
    cy.contains('Create Link').click();
    cy.wait(1000); // creating link sometimes takes longer on certain machines
    cy.contains('freshly baked');

    cy.getSharingLink().as('link');

    // opening link as other user
    cy.loginMocked(this.friend);
    cy.get('@link').then(cy.visit);

    // opening shared file
    cy.contains(folderName);
    cy.url().as('explorerSharedFolderUrl');
    cy.explorerOpenNode(fileName);
    cy.url().as('filePreviewUrl');
    cy.contains(fileContent);

    // modifying file
    const fileUrl = `${this.owner.podUrl}/solidcryptpad/${folderName}/${fileName}`;
    const modifiedFileContent = 'Goodbye World!';
    cy.openFileInEditor(fileUrl);
    cy.get('ngx-editor [contenteditable]').clear().type(modifiedFileContent);
    cy.contains('Save and close').click();
    cy.contains('saved');

    // creator can see the changes
    cy.loginMocked(this.owner);
    cy.get('@filePreviewUrl').then(cy.visit);
    cy.contains('Preview from');
    cy.contains(modifiedFileContent);

    // uploading a new file
    const newFileName = 'newFile.txt';
    const newFileContent = 'Hey there newbie';
    cy.loginMocked(this.friend);
    cy.get('@explorerSharedFolderUrl').then(cy.visit);
    cy.explorerUploadFileIn(
      folderName,
      newFileName,
      new Blob([newFileContent])
    );

    // creator can view new file
    cy.loginMocked(this.owner);
    cy.get('@explorerSharedFolderUrl').then(cy.visit);
    cy.explorerOpenNode(newFileName);
    cy.contains(newFileContent);
  });
});

function createAclForWebId(webId: string, relativeFileUrl: string) {
  return `@prefix acl: <http://www.w3.org/ns/auth/acl#>.
<#owner>
    a acl:Authorization;
    acl:agent <${webId}>;
    acl:accessTo <${relativeFileUrl}>;
    acl:mode acl:Read, acl:Write, acl:Control.`;
}
