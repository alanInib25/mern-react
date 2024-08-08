//user
import user from "../../fixtures/user.json";

describe("Forgot password page", () => {
  beforeEach(() => {
    cy.visit("/forgot-password");
    cy.db_reset_test();
    cy.signupUser(user);
  });

  it.skip("smoke", () => {
    cy.visit("/forgot-password/", { timeout: 15000 });
  });

  //forgot password is displayed
  it("Forgot password is displayed", () => {
    cy.get("header").should("exist");
    cy.get("h2").should("have.text", "Forgot Password");
    cy.get("[data-cy=form-forgot]").should("be.visible");
    cy.get('h2').should("have.text", "Forgot Password");
  })
  //forgot password valid data
  it("Forgot Password whith valid email", () => {
    cy.get("#email").should("be.visible").type(user.email);
    cy.get('[data-cy="btn-send"]').click();
    cy.get("small").should("have.text", "We send an email to your account");
  });

  //Forgot password with invalid data
  describe("Forgot password without valid data", () => {
    //without data
    it("Forgot password empty email", () => {
      cy.get("#email").should("be.visible").clear();
      cy.get('[data-cy="btn-send"]').click();
      cy.get("small").should("have.text", "All fields are required");
    });

    //email bad format
    it("Forgot password with bad format email", () => {
      cy.get("#email").should("be.visible").type("asda@asdasdcl");
      cy.get('[data-cy="btn-send"]').click();
      cy.get("small").should("have.text", "Invalid Email");
    });

    //email not registered
    it("forgot password with not registered email", () => {
      cy.get("#email").should("be.visible").type("reRegisterEmail@expl.com");
      cy.get('[data-cy="btn-send"]').click();
      cy.get("small").should("have.text", "Email not registered");
    });
  });
});
