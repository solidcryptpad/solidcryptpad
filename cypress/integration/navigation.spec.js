describe("can navigate with navbar as logged in user", () => {
  beforeEach(() => {
    cy.createRandomAccount()
      .then((user) => cy.login(user))
      .as("user");
  });

  it("can navigate all links in navbar as logged in user", function () {
    cy.log(JSON.stringify(this.user));

    cy.contains("Home").click();
    cy.url().should("include", "home");

    cy.contains("Files").click();
    cy.url().should("include", "fileEditor");

    cy.contains("Editor").click();
    cy.url().should("include", "editor");
  });
});
