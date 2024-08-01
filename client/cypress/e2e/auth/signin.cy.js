import user from "../../fixtures/user.json";

describe("Signin page test", () => {
  beforeEach(() => {
    cy.db_reset_test();
    cy.signupUser(user);
    cy.visit("http://localhost:5173/signin");
  });

  it.skip("smoke", () => {
    cy.visit("http://localhost:5173/signin");
  })

  it("Signin page is displayed", () => {
    cy.get("header").should("exist");
    cy.get("h2").should("have.text", "Signin User");
    cy.get("[data-cy = form-auth]").should("be.visible");
  });

  //signin form with valid data
  describe.skip("Signin valid data", () => {
    //submit
    it("Signin form submit", () => {
      cy.get('input[placeholder = "Email..."]')
        .should("be.visible")
        .type(user.email);
      cy.get('input[placeholder = "Password..."]')
        .should("be.visible")
        .type(user.password);
      cy.get("[data-cy=form-auth]").submit();
      cy.location("pathname").should("contains", "dashboard");
      cy.url().should("include", "dashboard");
      cy.getCookie("accessToken").should("exist");
    });
  });

  //signin form with invalid data
  describe("Signin invalid data", () => {
    //submit
    it("Signin without data", () => {
      cy.get('input[placeholder="Email..."]').should("be.visible").clear();
      cy.get('input[placeholder = "Password..."]').should("be.visible").clear();
      cy.get("[data-cy=form-auth]").submit();
      cy.location("pathname").should("not.contains", "dashboard");
      cy.url().should("not.include", "dashboard");
      cy.getCookie("accessToken").should("be.null")
    });
  });
});
