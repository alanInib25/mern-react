import user from "../../fixtures/user.json";

describe("Signout test", () => {
  before(() => {
    cy.visit("/")
  });

  beforeEach(() => {
    cy.db_reset_test();
    cy.signupUser(user);
    cy.signinUser({email: user.email, password: user.password});
  });

  it("Click on signput link on nav", () => {
    cy.get('[data-cy="nav-menu"] > li').eq(2).should("have.text", "Signout").click();
    cy.location("pathname").should("include", "/signin" );
    cy.getCookie("accessToken").should("be.null");
  })
})