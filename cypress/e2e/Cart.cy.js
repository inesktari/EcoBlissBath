const username = Cypress.env("username");
const password = Cypress.env("password");
const baseURL = Cypress.env("baseURL");
const apiURL = Cypress.env("apiURL");

describe("Display of the add to cart button on the sheets product", () => {
  before(() => {
    Cypress.env("token", null);
  });

  it("Shouldn't be visible if the value of the stock is < 1", () => {
    const problematicProducts = [];

    cy.visit(baseURL + "login");
    cy.getBySel("login-input-username").type(username);
    cy.getBySel("login-input-password").type(password);
    cy.getBySel("login-submit").click();
    cy.wait(2000);
    cy.visit(baseURL + "products");
    cy.wait(2000);

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

describe("Adding a product to the cart", () => {
  before(() => {
    Cypress.env("token", null);
  });

  it("The product should be added to the cart, exist on the cart, and the stock is correctly updated", () => {
    cy.visit(baseURL + "login");
    cy.getBySel("login-input-username").type(username);
    cy.getBySel("login-input-password").type(password);
    cy.getBySel("login-submit").click();
    cy.wait(2000);

    cy.visit(baseURL + "products");
    cy.wait(2000);

    cy.get(".list-products")
      .find("article.mini-product")
      .first()
      .find('[data-cy="product-link"]')
      .click();

    cy.wait(800);

    // Récupérer le nom et le stock initial du produit
    cy.get('[data-cy="detail-product-name"]')
      .invoke("text")
      .then((productName) => {
        cy.get('[data-cy="detail-product-stock"]')
          .invoke("text")
          .then((stockText) => {
            const match = stockText.match(/-?\d+/); // Récupérer la quantité initiale, y compris les valeurs négatives
            const initialStock = match ? Number(match[0]) : null;

            if (initialStock !== null) {
              cy.get('[data-cy="detail-product-add"]').click();
              cy.wait(800);
              cy.log("The product is correctly added on the cart");

              cy.visit(baseURL + "cart");
              cy.wait(800);

              cy.get("#cart-content")
                .find(".product")
                .contains(productName)
                .should("be.visible");
              cy.log("The product is present in the cart");

              // Retourner à la fiche produit pour vérifier la diminution du stock
              cy.visit(baseURL + "products");
              cy.wait(1000);
              cy.get(".list-products")
                .find("article.mini-product")
                .first()
                .find('[data-cy="product-link"]')
                .click();
              cy.wait(800);

              cy.get('[data-cy="detail-product-stock"]')
                .invoke("text")
                .then((updatedStockText) => {
                  const updatedMatch = updatedStockText.match(/-?\d+/);
                  const updatedStock = updatedMatch
                    ? Number(updatedMatch[0])
                    : null;

                  expect(updatedStock).to.equal(initialStock - 1);
                  cy.log("The stock is correctly updated");

                  // Conformation du stock depuis l'API
                  cy.request({
                    method: "GET",
                    url: apiURL + "products",
                    failOnStatusCode: false,
                  }).then((response) => {
                    expect(response.status).to.eq(200);

                    const product = response.body.find(
                      (p) => p.name.trim() === productName.trim()
                    );

                    if (!product) {
                      throw new Error(
                        `Product with name "${productName}" not found in API response.`
                      );
                    }

                    // Vérifier que le stock disponible de l'API correspond au texte mis à jour
                    const availableStockFromAPI = product.availableStock;

                    // Vérifier le texte affiché dans l'interface utilisateur
                    cy.get('[data-cy="detail-product-stock"]')
                      .invoke("text")
                      .then(() => {
                        expect(availableStockFromAPI).to.eq(updatedStock);
                        cy.log("The result is corfirmed from the API");
                      });
                  });
                });
            } else {
              cy.log("Stock value is invalid, cannot add product to the cart.");
            }
          });
      });
  });
});

describe("Adding a product to cart under boundary conditions", () => {
  before(() => {
    Cypress.env("token", null);
  });

  it("Should not allow adding a negative quantity to the cart", () => {
    cy.visit(baseURL + "login");
    cy.getBySel("login-input-username").type(username);
    cy.getBySel("login-input-password").type(password);
    cy.getBySel("login-submit").click();
    cy.wait(2000);

    cy.visit(baseURL + "products");
    cy.wait(2000);

    cy.get(".list-products")
      .find("article.mini-product")
      .first()
      .find('[data-cy="product-link"]')
      .click();

    cy.wait(800);

    // Récupérer le nom du produit
    cy.get('[data-cy="detail-product-name"]')
      .invoke("text")
      .then((productName) => {
        // Ajouter une quantité négative
        cy.get('[data-cy="detail-product-quantity"]').clear().type("-5");
        cy.get('[data-cy="detail-product-add"]').click();
        cy.wait(800);

        // Vérifier que le produit n'est pas ajouté au panier
        cy.visit(baseURL + "cart");
        cy.wait(800);

        cy.get("#cart-content")
          .find(".product")
          .contains(productName)
          .should("not.exist");
      });
  });

  it("Shouldn't add a quantity of 21 to the cart", () => {
    cy.visit(baseURL + "login");
    cy.getBySel("login-input-username").type(username);
    cy.getBySel("login-input-password").type(password);
    cy.getBySel("login-submit").click();
    cy.wait(2000);

    cy.visit(baseURL + "products");
    cy.wait(2000);

    cy.get(".list-products")
      .find("article.mini-product")
      .first()
      .find('[data-cy="product-link"]')
      .click();

    cy.wait(800);

    cy.get('[data-cy="detail-product-name"]')
      .invoke("text")
      .then((productName) => {
        cy.get('[data-cy="detail-product-quantity"]').clear().type("21");
        cy.get('[data-cy="detail-product-add"]').click();
        cy.wait(800);

        cy.visit(baseURL + "cart");
        cy.wait(800);

        cy.get("#cart-content")
          .find(".product")
          .contains(productName)
          .then(($item) => {
            if ($item.length) {
              cy.wait(2000);
              cy.get(".product-quantity")
                .wait(1000)
                .find('[data-cy="cart-line-quantity"]')

                .invoke("val")
                .then((cartQuantity) => {
                  const quantity = Number(cartQuantity);
                  expect(quantity).to.be.lte(20);
                });
            } else {
              cy.log(
                "Product not added to the cart as the quantity exceeds the allowed limit."
              );
            }
          });
      });
  });
});
