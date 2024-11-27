import { faker } from "@faker-js/faker";

const username = Cypress.env("username");
const password = Cypress.env("password");
const apiURL = Cypress.env("apiURL");

describe("API products", () => {
  before(() => {
    Cypress.env("token", null);
  });

  it("should get products before authentification", () => {
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

describe("API add product to cart", () => {
  before(() => {
    Cypress.env("token", null);
  });

  it("should add a product to the cart", () => {
    cy.request({
      method: "POST",
      url: apiURL + "login",
      body: {
        username: username,
        password: password,
      },
      failOnStatusCode: false,
    }).then((loginResponse) => {
      expect(loginResponse.status).to.eq(200);
      expect(loginResponse.body).to.have.property("token");
      Cypress.env("token", loginResponse.body.token);

      // Récupération des produits
      cy.request({
        method: "GET",
        url: apiURL + "products/",
        headers: {
          Authorization: "Bearer " + Cypress.env("token"),
        },
        failOnStatusCode: false,
      }).then((productResponse) => {
        expect(productResponse.status).to.eq(200);
        expect(productResponse.body).to.be.an("array").and.not.to.be.empty;

        // Filtrer les produits ayant un stock strictement positif
        const availableProducts = productResponse.body.filter(
          (product) => product.availableStock > 0
        );
        expect(availableProducts).to.not.be.empty;

        // Récupérer aléatoirement un produit dont la quantité en stock >= 0
        const randomProduct =
          availableProducts[
            Math.floor(Math.random() * availableProducts.length)
          ];
        const productId = randomProduct.id;
        const availableStock = randomProduct.availableStock;

        // Générer une quantité valide (1 =< fakeQuantity =< availableStock)
        const fakeQuantity = faker.number.int({
          min: 1,
          max: availableStock,
        });

        console.log(`productId: ${productId}`);
        console.log(`availableStock: ${availableStock}`);
        console.log(`fakeQuantity: ${fakeQuantity}`);

        cy.request({
          method: "PUT",
          url: apiURL + "orders/add",
          body: {
            product: productId,
            quantity: fakeQuantity,
          },
          headers: {
            Authorization: "Bearer " + Cypress.env("token"),
          },
          failOnStatusCode: false,
        }).then((response) => {
          expect(response.status).to.eq(200);
        });
      });
    });
  });
});
