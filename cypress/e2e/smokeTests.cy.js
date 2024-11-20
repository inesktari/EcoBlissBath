const username = Cypress.env("username");
const password = Cypress.env("password");
const baseURL = Cypress.env("baseURL");

describe("login page", () => {
  it("navigate to login page and verify if the elements exist", () => {
    cy.visit(baseURL + "login");
    cy.getBySel("login-input-username").should("exist");
    cy.getBySel("login-input-password").should("exist");
    cy.getBySel("login-submit").should("exist");
  });
});
