import { faker } from "@faker-js/faker";

const username = Cypress.env("username");
const password = Cypress.env("password");
const baseURL = Cypress.env("baseURL");
const apiURL = Cypress.env("apiURL");
const invalidToken = faker.string.alphanumeric(100);

describe("API reviews", () => {
  before(() => {
    Cypress.env("token", null);
  });

  it("should get reviews", () => {
    cy.request({
      method: "GET",
      url: apiURL + "reviews",
      failOnStatusCode: false,
    }).then((response) => {
      expect(response.status).to.eq(200);
    });
  });

  it("shouldn't post a review before authentification", () => {
    cy.request({
      method: "POST",
      url: apiURL + "reviews",
      failOnStatusCode: false,
    }).then((productResponse) => {
      expect(productResponse.status).to.eq(401);
    });
  });

  it("should post a review after authentification", () => {
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

      let review = {
        title: "J'adore !!",
        comment: "Je recommade ce produit.",
        rating: 5,
      };

      // Poster l'avis
      cy.request({
        method: "POST",
        url: apiURL + "reviews",
        headers: {
          Authorization: "Bearer " + Cypress.env("token"),
        },
        body: review,

        failOnStatusCode: false,
      }).then((reviewResponse) => {
        expect(reviewResponse.status).to.eq(200);
      });
    });
  });

  it("shouldn't authaurise injecting a scipt when posting a review", () => {
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

      // Contenu de l'avis avec un script XSS malveillant
      const scriptTest = {
        title: "<script>alert('XSS')</script>",
        comment:
          "This is a test for XSS vulnerability. <img src='x' onerror='alert(\"XSS\")'>",
        rating: 1,
      };

      cy.request({
        method: "POST",
        url: apiURL + "reviews",
        headers: {
          Authorization: "Bearer " + Cypress.env("token"),
        },
        body: scriptTest,
        failOnStatusCode: false,
      }).then((reviewResponse) => {
        expect(reviewResponse.status).to.eq(200);

        // Vérification que le contenu dangereux est neutralisé
        const { title, comment } = reviewResponse.body;
        expect(title).to.not.include("<script>");
        expect(comment).to.not.include("onerror");
        expect(comment).to.not.include("<img");

        cy.log("XSS test passed: Malicious content was sanitized.");
      });
    });
  });
});
