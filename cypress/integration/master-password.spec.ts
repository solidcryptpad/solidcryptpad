import { UserConfig } from '../support/commands';

describe('MasterPassword', () => {
  beforeEach(() => {
    cy.createRandomAccount().then(cy.loginMocked).as('user');
    cy.get('@user').then((user) => {
      cy.intercept('PUT', `${user.podUrl}/solidcryptpad-data/keystores/*`).as(
        'savedKeystore'
      );
    });
  });

  it('requires password confirmation on decryption attempt', function () {
    triggerMasterPasswordPrompt(this.user);
    cy.contains('Master Password');
    cy.get('input[data-cy=master-password-input]');
    cy.get('input[data-cy=master-password-input-confirm]');
  });

  it('does not ask for master password a second time on reload', function () {
    triggerMasterPasswordPrompt(this.user);
    cy.enterMasterPassword(this.user);
    cy.wait('@savedKeystore');

    cy.reload();
    triggerMasterPasswordPrompt(this.user);
    cy.contains('Master Password').should('not.exist');
  });

  it('does not require password confirmation if it has been entered previously', function () {
    // first time entering master password
    triggerMasterPasswordPrompt(this.user);
    cy.enterMasterPassword(this.user);
    cy.wait('@savedKeystore');

    // forget stored master password
    cy.clearLocalStorage();

    // second time entering master password
    triggerMasterPasswordPrompt(this.user);
    cy.get('input[data-cy=master-password-input]');
    cy.get('input[data-cy=master-password-input-confirm]').should('not.exist');
    cy.enterMasterPassword(this.user);
  });

  it("does not prompt for master password when it's stored with cy.storeMasterPassword", function () {
    cy.storeMasterPassword(this.user);
    triggerMasterPasswordPrompt(this.user);
    cy.wait('@savedKeystore');
  });
});

function triggerMasterPasswordPrompt(user: UserConfig) {
  cy.visit('/editor', {
    qs: { file: `${user.podUrl}/solidcryptpad/give-me-master-password.txt` },
  });
  cy.contains('You are editing');
}
