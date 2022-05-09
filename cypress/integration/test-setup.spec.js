describe("Test setup", function () {
  it("can use createRandomAccount", function () {
    cy.createRandomAccount().then(console.log);
  });

  it("can use login command", function () {
    cy.createRandomAccount().as("user");
    //cy.visit('localhost:4200/')
    cy.get("@user").then(function (user) {
      cy.login(user);
    });
    cy.contains("Home").click();
    cy.contains("Welcome to your personal area.");
  });
});
