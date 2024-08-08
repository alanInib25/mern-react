Cypress.Commands.add("db_reset_test", function () {
  cy.request("POST", "http://localhost:4000/api/testing/reset").should(
    (response) => {
      expect(response.status).to.equal(204);
    }
  );
});

Cypress.Commands.add("signupUser", (userData) => {
  cy.request("POST", "http://localhost:4000/api/auth/signup", userData).should(
    (response) => {
      expect(response.status).to.equal(200);
      expect(response.body).to.have.property("_id");
      expect(response.body).to.have.property("email", userData.email);
      expect(response.body).to.not.have.property("password");
    }
  );
});

Cypress.Commands.add("clearAppStorage", () => {
  cy.clearCookies();
  cy.clearLocalStorage();
  cy.clearAllSessionStorage();
});

Cypress.Commands.add("signinUser", ({email, password}) => {
  cy.visit("/signin")
  cy.get('input[placeholder = "Email..."]').should("be.visible").type(email);
  cy.get('input[placeholder = "Password..."]')
    .should("be.visible")
    .type(password);
  cy.get(".btn").should("contain", "Send").click();
  cy.location("pathname").should("contains", "dashboard");
  cy.url().should("include", "dashboard");
  cy.getCookie("accessToken").should("exist");
});

Cypress.Commands.add("signoutUser", () => {
  cy.request("GET", "http://localhost:4000/api/auth/signout");
});
