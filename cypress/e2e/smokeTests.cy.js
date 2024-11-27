const username = Cypress.env("username");
const password = Cypress.env("password");
const baseURL = Cypress.env("baseURL");
const apiURL = Cypress.env("apiURL");

describe("Login page", () => {
  it("navigate to login page and verify if the elements exist", () => {
    cy.visit(baseURL + "login");
    cy.getBySel("login-input-username").should("be.visible");
    cy.getBySel("login-input-password").should("be.visible");
    cy.getBySel("login-submit").should("be.visible");
  });
});

describe("Products page", () => {
  it("navigate to the products page and verify if the elements exist", () => {
    cy.visit(baseURL + "/products");
    cy.getBySel("product").should("be.visible");
    cy.getBySel("product-link").should("be.visible");
  });
});

describe("Product sheet", () => {
  it("navigate to a product sheet and verify if the elements exist", () => {
    cy.visit(baseURL + "/products");
    cy.getBySel("product-link").first().click();
    cy.getBySel("detail-product-add").should("be.visible");
    cy.getBySel("detail-product-stock").should("be.visible");
  });
});
