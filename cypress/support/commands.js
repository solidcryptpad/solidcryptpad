// ***********************************************
// For comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************

const {
  createDpopHeader,
  generateDpopKeyPair,
  buildAuthenticatedFetch,
} = require("@inrupt/solid-client-authn-core");

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
  /** TODO (depends on #17)
   *  this gives the app time to process the credentials from the redirect
   *  in the future: use a visual indicator of being loggedin
   *  like checking if a logout button exists instead
   */
  cy.wait(1000);
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

  // putting file which recursively creates parent containers
  const tempFileUrl = url + ".test.keep";
  cy.authenticatedRequest(user, {
    url,
    method: "PUT",
    headers: {
      "content-type": "text/plain",
    },
  });
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

/**
 * requests tokens from CSS that can be used to make authenticated requests
 * and returns a fetch wrapper which uses these tokens
 */
const getAuthenticatedRequest = (user) => {
  // uses https://github.com/CommunitySolidServer/CommunitySolidServer/blob/main/documentation/client-credentials.md
  return getAuthenticationToken(user).then(async ({ accessToken, dpopKey }) => {
    const authFetchWrapper = await buildAuthenticatedFetch(
      cyFetchWrapper,
      accessToken,
      { dpopKey }
    );
    const authRequest = cyUnwrapFetch(authFetchWrapper);
    return cy.wrap(authRequest);
  });
};

/**
 * this is used to get the valid authentication headers from buildAuthenticatedFetch
 *
 * pretends to be a normal fetch
 * this can be passed to buildAuthenticatedFetch
 * and it will resolve with { options }
 */
const cyFetchWrapper = (url, options = {}) => {
  // mock response
  return {
    // buildAUthenticatedFetch relies on response.ok to be true. Else it checks for unauthorized errors
    ok: true,
    options,
  };
};

/**
 * return a function that looks like cy.request
 * uses the wrappedFetch to get the authentication headers
 * and makes an authenticated cy.request with it
 */
const cyUnwrapFetch = (wrappedFetch) => {
  return async (...cyRequestArgs) => {
    const options = parseCyRequestArgs(...cyRequestArgs);
    const pseudoResponse = await wrappedFetch(options.url, options);
    // setup options for cy.request format
    options.method ??= "GET";
    options.headers = {
      ...Object.fromEntries(pseudoResponse.options.headers.entries()),
      ...options.headers,
    };
    return cy.request(options);
  };
};

const getAuthenticationCredentials = (user) => {
  const credentialsEndpoint = `${Cypress.config().cssUrl}/idp/credentials/`;
  return cy
    .request("POST", credentialsEndpoint, {
      email: user.email,
      password: user.password,
      name: "cypress-login-token",
    })
    .then(async (response) => {
      const { id, secret } = response.body;
      const dpopKey = await generateDpopKeyPair();
      return cy.wrap({ id, secret, dpopKey });
    });
};

const getAuthenticationToken = (user) => {
  return getAuthenticationCredentials(user).then(
    async ({ id, secret, dpopKey }) => {
      const authString = `${encodeURIComponent(id)}:${encodeURIComponent(
        secret
      )}`;
      const tokenEndpoint = `${Cypress.config().cssUrl}/.oidc/token`;
      return cy
        .request({
          method: "POST",
          url: tokenEndpoint,
          headers: {
            authorization: `Basic ${Buffer.from(authString).toString(
              "base64"
            )}`,
            "content-type": "application/x-www-form-urlencoded",
            dpop: await createDpopHeader(tokenEndpoint, "POST", dpopKey),
          },
          body: "grant_type=client_credentials&scope=webid",
        })
        .then((response) => {
          const { access_token: accessToken } = response.body;
          return cy.wrap({ dpopKey, accessToken });
        });
    }
  );
};

/**
 * parse cy.request arguments into a single options object
 *
 * @param  {...any} cyRequestArgs
 * @returns {object} options for cy.request
 */
const parseCyRequestArgs = (...cyRequestArgs) => {
  /** cy.request has multiple ways to call it
      cy.request(url)
      cy.request(url, body)
      cy.request(method, url)
      cy.request(method, url, body)
      cy.request(options)
    */
  let options = {};
  cy.log(cyRequestArgs);
  switch (cyRequestArgs.length) {
    case 1:
      if (typeof cyRequestArgs[0] === "string") options.url = cyRequestArgs[0];
      else options = cyRequestArgs[0];
      break;

    case 2:
      if (cyRequestArgs[0].startsWith("http")) {
        options.url = cyRequestArgs[0];
        options.body = cyRequestArgs[1];
      } else {
        options.method = cyRequestArgs[0];
        options.url = cyRequestArgs[1];
      }
      break;

    case 3:
      options.method = cyRequestArgs[0];
      options.url = cyRequestArgs[1];
      options.body = cyRequestArgs[2];
      break;
    default:
      throw new Error(
        "Tried to parse invalid cy.request arguments: " +
          JSON.stringify(cyRequestArgs)
      );
  }
  return options;
};
