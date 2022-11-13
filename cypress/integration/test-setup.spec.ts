describe('Test setup', function () {
  it('can use createRandomAccount', function () {
    cy.createRandomAccount();
  });

  it('can use cy.login and restore session functionality', function () {
    cy.createRandomAccount().then(cy.loginViaUI);
    cy.contains('Home').click();
    cy.contains('Welcome to your personal area.');

    cy.visit('/'); // using a different path so we can be sure the reload finished
    cy.location('pathname').should('equals', '/');
    cy.location('pathname').should('equals', '/home');
    cy.contains('Hello user');
  });

  it('can use cy.mockLogin to use logged in features', function () {
    cy.createRandomAccount().then(cy.loginMocked);
    cy.contains('Hello user');
  });
});
