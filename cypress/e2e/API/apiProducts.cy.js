import { faker } from "@faker-js/faker";

const username = Cypress.env("username");
const password = Cypress.env("password");
const baseURL = Cypress.env("baseURL");
const apiURL = Cypress.env("apiURL");
const invalidToken = faker.string.alphanumeric(100);

describe("API products", () => {
  it("should / shouldn't", () => {
    cy.request({
      method: "GET",
      url: apiURL + "products",
      failOnStatusCode: false,
    }).then((response) => {
      expect(response.status).to.eq(200);
    });
  });
});
