import { faker } from "@faker-js/faker";

const username = Cypress.env("username");
const password = Cypress.env("password");
const apiURL = Cypress.env("apiURL");
const invalidToken = faker.string.alphanumeric(100);

describe("API User", () => {
  it("shouldn't get user informations without authentification != 200", () => {
    cy.request({
      method: "GET",
      url: apiURL + "me",
      failOnStatusCode: false,
    }).then((response) => {
      expect(response.status).to.not.eq(200);
      // expect(response.status).to.eq(401 or 403);                   // n'est pas spécifié dans la documentation de l'API
    });
  });

  it("shouldn't get user informations with fake token", () => {
    cy.request({
      method: "POST",
      url: apiURL + "login",
      headers: {
        Authorization: "Bearer " + `${invalidToken}`,
      },
      failOnStatusCode: false,
    }).then((response) => {
      expect(response.status).to.not.eq(200);
      expect(response.status).to.eq(404); // n'est pas spécifié dans la documentation de l'API
    });
  });

  it("should get user informations after authentification", () => {
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
        url: apiURL + "me",
        headers: {
          Authorization: "Bearer " + Cypress.env("token"),
        },
        failOnStatusCode: false,
      }).then((meResponse) => {
        expect(meResponse.status).to.eq(200);
        expect(meResponse.body).to.have.property("email");
      });
    });
  });
});
