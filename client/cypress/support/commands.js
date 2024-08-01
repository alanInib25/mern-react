Cypress.Commands.add("db_reset_test", function () {
  cy.request("POST", "http://localhost:4000/api/testing/reset").then(
    (response) => {
      expect(response.status).to.equal(204);
    }
  );
});

Cypress.Commands.add("signupUser", (userData) => {
  cy.request("POST", "http://localhost:4000/api/auth/signup", userData).then(
    (response) => {
      expect(response.status).to.equal(200);
      expect(response.body).to.have.property("_id");
      expect(response.body).to.have.property("email", userData.email);
      expect(response.body).to.not.have.property("password");
    }
  );
});
