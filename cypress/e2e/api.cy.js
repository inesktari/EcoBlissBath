const username = Cypress.env("username");
const password = Cypress.env("password");
const baseURL = Cypress.env("baseURL");
const apiURL = Cypress.env("apiURL");
const token = "aaaaaaaaaaaaaaa";

describe("API orders", () => {
  it("test GET user orders", () => {
    cy.request({
      method: "GET",
      url: apiURL + "orders",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }).then((response) => {
      expect(response.status).to.eq(200);
    });
  });
});
