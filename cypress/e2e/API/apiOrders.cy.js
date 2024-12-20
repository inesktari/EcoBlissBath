import { faker } from "@faker-js/faker";

const username = Cypress.env("username");
const password = Cypress.env("password");
const apiURL = Cypress.env("apiURL");
const invalidToken = faker.string.alphanumeric(100);

describe("API orders before authentification", () => {
  before(() => {
    Cypress.env("token", null);
  });

  it("shouldn't get user orders", () => {
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

  it("shouldn't place an orders", () => {
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

  it("should get user orders", () => {
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

        let nameOfProducts = ordersResponse.body.orderLines.map(
          (line) => line.product.name
        );

        if (nameOfProducts.length === 0) {
          throw new Error("The cart is empty.");
        }

        cy.log(
          `There are ${
            ordersResponse.body.orderLines.length
          } products in the cart, which are : ${nameOfProducts.join(", ")}`
        );
      });
    });
  });

  it("should get a product sheet from an order", () => {
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
        expect(ordersResponse.body.orderLines).to.be.an("array").and.not.to.be
          .empty;

        // Récupérer l'id d'un produit aléatoire du panier
        const randomOrderLine =
          ordersResponse.body.orderLines[
            Math.floor(Math.random() * ordersResponse.body.orderLines.length)
          ];
        const randomId = randomOrderLine.product.id;
        expect(randomId).to.be.a("number");

        cy.request({
          method: "GET",
          url: apiURL + "products/" + `${randomId}`,
          failOnStatusCode: false,
        }).then((sheetResponse) => {
          expect(sheetResponse.status).to.eq(200);
          expect(sheetResponse.body).exist;
        });
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

            expect(availableStockAfter).to.eq(
              availableStockBefore - fakeQuantity
            );
            expect(availableStockAfter).to.be.gte(0);
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

  it("should add to the cart, only products with availableStock > 0", () => {
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
