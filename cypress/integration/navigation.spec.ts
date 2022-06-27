describe('can navigate with navbar as logged in user', () => {
  beforeEach(() => {
    cy.createRandomAccount()
      .then(cy.storeMasterPassword)
      .then(cy.loginMocked)
      .as('user');
  });

  it('can navigate all links in navbar as logged in user', function () {
    cy.contains('Home').click();
    cy.url().should('include', 'home');

    cy.contains('Files').click();
    cy.url().should('include', 'files');

    cy.contains('FAQ').click();
    cy.url().should('include', 'faq');
  });
});
