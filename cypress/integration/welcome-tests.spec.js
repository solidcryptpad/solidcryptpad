describe("Welcome Page Tests", function () {
  beforeEach(function () {
    cy.visit("http://localhost:4200/");
  });

  it("Welcome page has a basic description of SolidCryptPad", function () {
    cy.contains("Your secure decentralized collaboration tool.");
  });
  it("Welcome Page contains Login Button", function () {
    cy.contains("button", "LOGIN");
  });
});
