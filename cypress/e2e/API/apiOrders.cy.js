import { faker } from "@faker-js/faker";

const username = Cypress.env("username");
const password = Cypress.env("password");
const apiURL = Cypress.env("apiURL");
const invalidToken = faker.string.alphanumeric(100);

describe("API orders", () => {
  it("shouldn't get user orders withount authentification", () => {
    cy.request({
      method: "GET",
      url: apiURL + "orders",
      failOnStatusCode: false,
    }).then((response) => {
      expect(response.status).to.eq(401);
    });
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
      }).then((meResponse) => {
        expect(meResponse.status).to.eq(200);
        expect(meResponse.body).to.have.property("orderLines");
      });
    });
  });

  it("shouldn't get user orders, without authentification", () => {
    cy.request({
      method: "POST",
      url: apiURL + "login",
      headers: {
        Authorization: "Bearer " + `${invalidToken}`,
      },
      failOnStatusCode: false,
    }).then((response) => {
      console.log(response);
      expect(response.status).to.not.eq(200);
      expect(response.status).to.eq(401); //non spécifié dans la documentation
    });
  });
});
