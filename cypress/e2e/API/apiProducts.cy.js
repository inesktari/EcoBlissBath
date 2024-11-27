const username = Cypress.env("username");
const password = Cypress.env("password");
const apiURL = Cypress.env("apiURL");

describe("API products", () => {
  before(() => {
    Cypress.env("token", null);
  });

  it("shouldn't get products before authentification", () => {
    cy.request({
      method: "GET",
      url: apiURL + "products",
      failOnStatusCode: false,
    }).then((response) => {
      expect(response.status).to.not.eq(200);
    });
  });

  it("should get products after authentification", () => {
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
        url: apiURL + "products",
        headers: {
          Authorization: "Bearer " + Cypress.env("token"),
        },
        failOnStatusCode: false,
      }).then((productsResponse) => {
        expect(productsResponse.status).to.eq(200);
        expect(productsResponse.body).exist;
      });
    });
  });
});

describe("API product sheet", () => {
  let productId;
  before(() => {
    Cypress.env("token", null);

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
      Cypress.env("token", loginResponse.body.token);
    });
  });

  it("Should get a product sheet by id", () => {
    cy.request({
      method: "GET",
      url: apiURL + "products",
      headers: {
        Authorization: "Bearer " + Cypress.env("token"),
      },
      failOnStatusCode: false,
    }).then((response) => {
      expect(response.status).to.eq(200);
      expect(response.body).to.be.an("array").and.not.be.empty;

      productId =
        response.body[Math.floor(Math.random() * response.body.length)].id;
      cy.log("id du produit sélectionné : ", productId);

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
