import { faker } from "@faker-js/faker";

const username = Cypress.env("username");
const password = Cypress.env("password");
const apiURL = Cypress.env("apiURL");

describe("API products", () => {
  before(() => {
    Cypress.env("token", null);
  });

  it("should get products without authentification", () => {
    cy.request({
      method: "GET",
      url: apiURL + "products",
      failOnStatusCode: false,
    }).then((response) => {
      expect(response.status).to.eq(200);
    });
  });
});

describe("API product sheet", () => {
  let productId;
  before(() => {
    Cypress.env("token", null);
  });

  it("Should get a product sheet by id", () => {
    cy.request({
      method: "GET",
      url: apiURL + "products",
      failOnStatusCode: false,
    }).then((response) => {
      expect(response.status).to.eq(200);
      expect(response.body).to.be.an("array").and.not.be.empty;

      productId =
        response.body[Math.floor(Math.random() * response.body.length)].id;

      expect(productId).to.be.a("number");
      cy.request({
        method: "GET",
        url: apiURL + "products/" + `${productId}`,
        failOnStatusCode: false,
      }).then((sheetResponse) => {
        expect(sheetResponse.status).to.eq(200);
        expect(sheetResponse.body).exist;
      });
    });
  });
});

describe("API availableStock products", () => {
  let productId;
  before(() => {
    Cypress.env("token", null);
  });

  it("Should verify if all products have an positive availableStock", () => {
    cy.request({
      method: "GET",
      url: apiURL + "products",
      failOnStatusCode: false,
    }).then((response) => {
      expect(response.status).to.eq(200);
      expect(response.body).to.be.an("array").and.not.be.empty;

      response.body.forEach((product) => {
        const { id, availableStock } = product;
        if (availableStock < 0) {
        }
        expect(availableStock).to.be.gte(
          0,
          `Product ID ${id} has a negative availableStock: ${availableStock}`
        );
      });
    });
  });

  it("Should get the list of ID products, with availableStock equal to 0", () => {
    cy.request({
      method: "GET",
      url: apiURL + "products",
      failOnStatusCode: false,
    }).then((response) => {
      expect(response.status).to.eq(200);
      expect(response.body).to.be.an("array").and.not.be.empty;

      // Filtrer les produits ayant un availableStock égal à 0
      let outOfStockProducts = response.body.filter(
        (product) => product.availableStock === 0
      );

      let outOfStockIds = outOfStockProducts.map((product) => product.id);

      if (outOfStockIds.length === 0) {
        throw new Error("There are any product out of stock.");
      }

      cy.log(
        `There are ${
          outOfStockProducts.length
        } products which are out of stock, which their IDs are : ${outOfStockIds.join(
          ", "
        )}`
      );
    });
  });
});
