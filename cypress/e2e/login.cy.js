const username = Cypress.env("username");
const password = Cypress.env("password");
const baseURL = Cypress.env("baseURL");

describe("login page", () => {
  it("should successfully log in with valid ID", () => {
    cy.visit(baseURL + "login");
    cy.getBySel("login-input-username").type(username);
    cy.getBySel("login-input-password").type(password);
    cy.getBySel("login-submit").click();
    cy.get("nav").should("contain", "Déconnexion");
  });

  it("shouldn't log in with invalid email, invalid password, and display error message", () => {
    cy.visit(baseURL + "login");
    cy.getBySel("login-input-username").type("invalidUsername@username.com");
    cy.getBySel("login-input-password").type("invalidPassword");
    cy.getBySel("login-submit").click();
    cy.get("nav").should("contain", "Connexion");
    cy.getBySel("login-errors").should("exist");
    cy.get("form").should("contain", "Identifiants incorrects");
  });

  it("shouldn't log in with a username different of an email adress, invalid password, and display error message", () => {
    cy.visit(baseURL + "login");
    cy.getBySel("login-input-username").type("invalidUsername");
    cy.getBySel("login-input-password").type("invalidPassword");
    cy.getBySel("login-submit").click();
    cy.get("nav").should("contain", "Connexion");
    cy.getBySel("login-errors").should("exist");
    cy.get("form").should(
      "contain",
      "Merci de remplir correctement tous les champs"
    );
  });
});
