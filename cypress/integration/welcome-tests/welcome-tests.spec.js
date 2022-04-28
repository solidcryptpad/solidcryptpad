describe("Welcome Page Tests", function () {
  beforeEach(function () {
    cy.visit("http://localhost:4200/welcome");
  });

  it("Welcome Page show Welcome Text", function () {
    cy.contains("Welcome to SolidCryptPad");
  });
  it("Welcome Page contains Login Button", function () {
    cy.contains("button", "LOGIN").click();
  });
});
