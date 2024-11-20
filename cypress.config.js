const { defineConfig } = require("cypress");

module.exports = defineConfig({
  e2e: {
    setupNodeEvents(on, config) {
      // implement node event listeners here
    },
    env: {
      baseURL: "http://localhost:8080/#/",
      apiURL: "http://localhost:8081/",
      username: "test2@test.fr",
      password: "testtest",
    },
  },
});
