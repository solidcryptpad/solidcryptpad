describe("File-Handler Test", function () {
  beforeEach(function () {
    cy.visit("http://localhost:4200/");
    cy.createRandomAccount().as("user");
    cy.get("@user").then(function (user) {
      cy.login(user);
    });
    cy.contains("Files").click();
    cy.contains("Folder URL");
  });

  it("Open podUrl and show standard files, folders and open-Button", function () {
    cy.get("[id=currentFolderLink]").type(this.user.podUrl + "/");
    cy.contains("change Directory").click();

    cy.contains("open");
    cy.contains("profile");
    cy.contains("README");
  });

  it("Open PodUrl and show new folder", function () {
    var folderUrl = "test-folder";
    cy.givenFolder(this.user, this.user.podUrl + "/" + folderUrl + "/");

    cy.get("[id=currentFolderLink]").type(this.user.podUrl + "/");
    cy.contains("change Directory").click();

    cy.contains(folderUrl);
  });

  it("Open PodUrl and show new File", function () {
    var fileUrl = "file.txt";
    var fileContent = "some random text content";
    cy.givenFile(this.user, this.user.podUrl + "/" + fileUrl, fileContent);

    cy.get("[id=currentFolderLink]").type(this.user.podUrl + "/");
    cy.contains("change Directory").click();

    cy.contains(fileUrl);
  });

  it("Open File Hanlder and show new nested folder", function () {
    var folderUrl = "test-folder";
    cy.givenFolder(this.user, this.user.podUrl + "/nested/" + folderUrl + "/");

    cy.get("[id=currentFolderLink]").type(this.user.podUrl + "/");

    cy.contains("change Directory").click();
    cy.contains("nested");

    cy.contains("open").first().click(); //Permission denied
  });
});
