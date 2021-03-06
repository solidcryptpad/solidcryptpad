describe('Welcome Page Tests', function () {
  beforeEach(function () {
    cy.visit('http://localhost:4200/');
  });

  it('Welcome page has a basic description of SolidCryptPad', function () {
    cy.contains('Your secure decentralized collaboration tool.');
  });

  it('Welcome Page contains Login Button', function () {
    cy.contains('button', 'LOGIN');
  });

  it('Can initiate login on welcome page', function () {
    cy.get('#provider').type(Cypress.env('cssUrl'));
    cy.contains('button', 'LOGIN').click();
    cy.url({ timeout: 30000 }).should('include', Cypress.env('cssUrl'));
  });

  it('Can logout', function () {
    cy.createRandomAccount().then(cy.storeMasterPassword).then(cy.loginViaUI);

    cy.get('[data-cy=nav-account-icon]').click();
    cy.contains('Logout').click();

    cy.location('pathname').should('equal', '/');
    cy.contains('LOGIN');
  });
});
