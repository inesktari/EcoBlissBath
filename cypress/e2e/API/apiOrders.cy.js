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
