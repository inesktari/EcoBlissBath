import { faker } from "@faker-js/faker";

const username = Cypress.env("username");
const password = Cypress.env("password");
const baseURL = Cypress.env("baseURL");
const apiURL = Cypress.env("apiURL");
const invalidToken = faker.string.alphanumeric(100);

describe("API reviews", () => {
  it("should / shouldn't", () => {
    cy.request({
      method: "GET",
      url: apiURL + "reviews",
      failOnStatusCode: false,
    }).then((response) => {
      expect(response.status).to.eq(200);
    });
  });
});
