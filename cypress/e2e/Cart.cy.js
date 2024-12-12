const username = Cypress.env("username");
const password = Cypress.env("password");
const baseURL = Cypress.env("baseURL");

describe("Navigate to Products page", () => {
  it("The stock value of a product should be >= 1 and no 'Add to cart' button should appear if stock < 1", () => {
    const problematicProducts = [];

    cy.visit(baseURL + "login");
    cy.getBySel("login-input-username").type(username);
    cy.getBySel("login-input-password").type(password);
    cy.getBySel("login-submit").click();
    cy.wait(1000);
    cy.visit(baseURL + "products");
    cy.wait(1000);

    cy.get(".list-products")
      .find("article.mini-product")
      .its("length")
      .then((length) => {
        for (let i = 0; i < length; i++) {
          cy.get(".list-products")
            .find("article.mini-product")
            .eq(i)
            .find('[data-cy="product-link"]')
            .click();

          cy.wait(800);
          cy.get('[data-cy="detail-product-name"]').should("be.visible");

          cy.wait(800);
          cy.get("p.stock")
            .invoke("text")
            .then((text) => {
              const match = text.match(/-?\d+/); // Récupère le nombre dans le texte
              const stockValue = match ? Number(match[0]) : null;

              cy.wait(800);
              cy.get('[data-cy="detail-product-name"]')
                .invoke("text")
                .then((productName) => {
                  if (stockValue === null) {
                    problematicProducts.push({
                      productName,
                      reason: "Stock not displayed",
                    });
                  } else if (stockValue < 1) {
                    cy.wait(800);
                    cy.get('[data-cy="detail-product-add"]').then(($btn) => {
                      if ($btn.is(":visible")) {
                        problematicProducts.push({
                          productName,
                          reason: "Add to cart button visible with stock < 1",
                        });
                      }
                    });
                  }
                });
            });

          cy.wait(600);
          cy.visit(baseURL + "products");

          cy.wait(800);
          cy.get(".list-products").should("be.visible");
          cy.wait(800);
        }
      })
      .then(() => {
        if (problematicProducts.length > 0) {
          cy.log("Produits avec un problème :");
          problematicProducts.forEach((product) => {
            cy.log(`${product.productName} - ${product.reason}`);
          });
          throw new Error(
            `List of products which mistakenly contains the add to cart button : ${problematicProducts
              .map((p) => `${p.productName} (${p.reason})`)
              .join(", ")}`
          );
        } else {
          cy.log(
            "The add to cart button is displayed correctly in the sheet of all products."
          );
        }
      });
  });
});
