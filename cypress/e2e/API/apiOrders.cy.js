import { faker } from "@faker-js/faker";

const username = Cypress.env("username");
const password = Cypress.env("password");
const apiURL = Cypress.env("apiURL");
const invalidToken = faker.string.alphanumeric(100);

describe("API orders before authentification", () => {
  before(() => {
    Cypress.env("token", null);
  });

  it("shouldn't get user orders before authentification", () => {
    cy.request({
      method: "GET",
      url: apiURL + "orders",
      failOnStatusCode: false,
    }).then((response) => {
      expect(response.status).to.eq(401);
    });
  });

  it("shouldn't place an orders, with a fake token", () => {
    cy.request({
      method: "POST",
      url: apiURL + "orders",
      headers: {
        Authorization: "Bearer " + `${invalidToken}`,
      },
      failOnStatusCode: false,
    }).then((response) => {
      expect(response.status).to.eq(401); //non spécifié dans la documentation
    });
  });

  it("shouldn't place an orders, before authentification", () => {
    cy.request({
      method: "POST",
      url: apiURL + "orders",
      failOnStatusCode: false,
    }).then((response) => {
      expect(response.status).to.eq(401); //non spécifié dans la documentation
    });
  });
});

describe("API orders after authentification", () => {
  before(() => {
    Cypress.env("token", null);
  });

  it("should get user orders, after authentification", () => {
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

      cy.request({
        method: "GET",
        url: apiURL + "orders",
        headers: {
          Authorization: "Bearer " + Cypress.env("token"),
        },
        failOnStatusCode: false,
      }).then((ordersResponse) => {
        expect(ordersResponse.status).to.eq(200);
        expect(ordersResponse.body).to.have.property("orderLines");
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

        let randomProduct =
          productResponse.body[
            Math.floor(Math.random() * productResponse.body.length)
          ];
        let productId = randomProduct.id;
        let availableStockBefore = randomProduct.availableStock;
        // Générer une quantité valide (1 =< fakeQuantity =< 20)
        let fakeQuantity = faker.number.int({
          min: 1,
          max: 20,
        });
        cy.log(`productId: ${productId}`);
        cy.log(`availableStockBefore: ${availableStockBefore}`);
        cy.log(`fakeQuantity: ${fakeQuantity}`);
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

          // Récupérer de nouveau le même produit, et vérifier l'update du stock
          cy.request({
            method: "GET",
            url: apiURL + "products/" + productId,
            headers: {
              Authorization: "Bearer " + Cypress.env("token"),
            },
            failOnStatusCode: false,
          }).then((productAfterResponse) => {
            let availableStockAfter = productAfterResponse.body.availableStock;

            console.log("availableStockBefore =", availableStockBefore);
            console.log("availableStockAfter =", availableStockAfter);

            expect(availableStockAfter).to.eq(
              availableStockBefore + fakeQuantity
            );
          });
        });
      });
    });
  });

  it("shouldn't add more than 20 of the same product to the cart", () => {
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

        let randomProduct =
          productResponse.body[
            Math.floor(Math.random() * productResponse.body.length)
          ];
        let productId = randomProduct.id;
        let availableStockBefore = randomProduct.availableStock;
        // Générer une quantité invalide
        let fakeQuantity = faker.number.int({
          min: 21,
          max: 50,
        });
        cy.log(`productId: ${productId}`);
        cy.log(`availableStockBefore: ${availableStockBefore}`);
        cy.log(`fakeQuantity: ${fakeQuantity}`);
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
          expect(response.status).not.to.eq(200);
        });
      });
    });
  });

  it("should add to the cart, only a products with availableStock > 0", () => {
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
        let availableProducts = "";
        availableProducts = productResponse.body.filter(
          (product) => product.availableStock > 0
        );

        if (availableProducts.length === 0) {
          // Interrempre le test dans ce cas
          throw new Error("No available products found.");
        }
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

        cy.log(`productId: ${productId}`);
        cy.log(`availableStock: ${availableStock}`);
        cy.log(`fakeQuantity: ${fakeQuantity}`);

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
