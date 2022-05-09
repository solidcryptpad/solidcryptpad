// ***********************************************
// For comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************

import { getAuthenticatedRequest } from "./css-authentication";

Cypress.Commands.add("createRandomAccount", function () {
  const uuid = require("uuid");
  const username = "test-" + uuid.v4();
  const password = "12345";
  const email = username + "@example.org";
  const config = {
    idp: Cypress.config().cssUrl + "/",
    podUrl: Cypress.config().cssUrl + "/" + username,
    webId: Cypress.config().cssUrl + "/" + username + "/profile/card#me",
    username: username,
    password: password,
    email: email,
  };
  const registerEndpoint = Cypress.config().cssUrl + "/idp/register/";
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

  // replace default card, because it does not contain a name and pod urls
  // which we assume to exist in the pod
  const cardUrl = config.webId.substring(0, config.webId.lastIndexOf("#"));
  cy.intercept(cardUrl, { fixture: "profile-card.ttl" });

  return cy.wrap(config);
});

/**
 * Manually logins the user
 * Assumes it is previously not logged in
 */
Cypress.Commands.add("login", function (user) {
  const typeFastConfig = {
    delay: 0,
  };
  //cy.clearLocalStorage()
  cy.log("login", user);
  cy.visit("/");

  cy.get("#provider").type(Cypress.config().cssUrl + "/");
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

  // wait until app processed login credentials
  cy.url().should("include", Cypress.config().baseUrl + "/");
  cy.contains("Welcome to your personal area");
});

/**
 * Requests new tokens for user and makes an authenticated cy.request with it
 *
 * @param {object} user
 * @param {any[]} args cy.request args
 */
Cypress.Commands.add("authenticatedRequest", (user, ...args) => {
  return getAuthenticatedRequest(user).then((request) => request(...args));
});

/**
 * create a folder by creating a .test.keep file in it
 *
 * @param {object} user the user who has permissions to create this folder
 * @param {string} url the url of the new folder
 */
Cypress.Commands.add("givenFolder", (user, url) => {
  if (!url.endsWith("/")) url += "/";
  return cy.givenFile(user, `${url}.test.keep`, "");
});

/**
 * @param {object} user the user who has permissions to create this file
 * @param {string} url the url of the new file
 * @param {string|blob} content content of the new file
 * @param {object} options
 */
Cypress.Commands.add("givenFile", (user, url, content, options = {}) => {
  const contentType =
    options.contentType ??
    (typeof content === "string" ? "text/plain" : "application/octet-stream");
  cy.authenticatedRequest(user, {
    url,
    method: "PUT",
    headers: {
      "content-type": contentType,
    },
    body: content,
  });
});
