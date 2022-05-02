// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add('login', (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add('drag', { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add('dismiss', { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite('visit', (originalFn, url, options) => { ... })

Cypress.Commands.add("createRandomAccount", function () {
  var uuid = require("uuid");
  var username = "test-" + uuid.v4();
  var password = "12345";
  var email = username + "@example.org";
  var config = {
    idp: Cypress.config().cssUrl + "/",
    podUrl: Cypress.config().cssUrl + "/" + username,
    webId: Cypress.config().cssUrl + "/" + username + "/profile/card#me",
    username: username,
    password: password,
    email: email,
  };
  var registerEndpoint = Cypress.config().cssUrl + "/idp/register/";
  cy.request("POST", registerEndpoint, {
    createWebId: "on",
    webId: "",
    register: "on",
    createPod: "on",
    podName: username,
    email: email,
    password: password,
    confirmPassword: password,
  });

  return cy.wrap(config);
});

/**
 * Manually logins the user
 * Assumes it is previously not logged in
 */
Cypress.Commands.add("login", function (user) {
  var typeFastConfig = {
    delay: 0,
  };
  //cy.clearLocalStorage()
  cy.log("login", user);
  cy.visit("localhost:4200/");

  cy.get("input").type(Cypress.config().cssUrl + "/");
  cy.contains("LOGIN").click();

  cy.url().should("include", user.idp);

  cy.get("label").contains("Email").click().type(user.email, typeFastConfig);
  cy.get("label")
    .contains("Password")
    .click()
    .type(user.password, typeFastConfig);
  cy.contains("button", "Log in").click();

  cy.url().should("include", "/consent");
  cy.contains("button", "Consent").click();

  cy.url().should("include", Cypress.config().baseUrl + "/");
});
