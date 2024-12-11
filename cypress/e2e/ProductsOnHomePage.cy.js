const username = Cypress.env("username");
const password = Cypress.env("password");
const baseURL = Cypress.env("baseURL");

describe("Navigate to Home page", () => {
  it("Should load the page successfully", () => {
    cy.visit(baseURL);
    cy.getBySel("product-home").should("be.visible");
  });
});

describe("Mini-products on HomePage", () => {
  it("Every product should have an image, a name, ingredients, a price and and homelink", () => {
    cy.visit(baseURL);

    cy.get(".list-products")
      .find("article.mini-product")
      .should("have.length", 3);

    cy.get(".list-products")
      .find("article.mini-product")
      .each(($article) => {
        cy.wrap($article).getBySel("product-home-img").should("be.visible");
        cy.wrap($article).getBySel("product-home-name").should("be.visible");
        cy.wrap($article)
          .getBySel("product-home-ingredients")
          .should("be.visible");
        cy.wrap($article).getBySel("product-home-price").should("be.visible");
        cy.wrap($article).getBySel("product-home-link").should("be.visible");
      });
  });
});
