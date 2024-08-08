import user from "../../fixtures/user.json";

describe("Dashboard page tests", () => {
  beforeEach(() => {
    cy.visit("/signin");
    cy.db_reset_test();
    cy.signupUser(user);
    cy.signinUser(user);
  });

  afterEach(() => {
    cy.signoutUser();
  })

  it("Dashboard page is displayed", () => {
    cy.get("header").should("exist");
    cy.get("h2").should("have.text", "@" + user.name);
    cy.location("pathname").should("include", "/dashboard");
  });
  
  it("Dashboard page display protected menu with options (dashboard, profile, signup)", () => {
    cy.get('[data-cy="nav-menu"] > li').eq(0).should("have.text", "Dashboard");
    cy.get('[data-cy="nav-menu"] > li').eq(1).should("have.text", "Profile");
    cy.get('[data-cy="nav-menu"] > li').eq(2).should("have.text", "Signout");
    cy.get('[data-cy="nav-menu"] > li').eq(3).should("have.text", "@"+user.name);
  })

  it("Dashborad page click to Dashboard link on nav", () => {
    cy.get('[data-cy="nav-menu"] > li').eq(0).should("have.text", "Dashboard").click();
    cy.location("pathname").should("include", "/dashboard");
  })

  it("Dashborad page click to Profile link on nav", () => {
    cy.get('[data-cy="nav-menu"] > li').eq(1).should("have.text", "Profile").click();
    cy.location("pathname").should("include", "/profile")
  })

  it("Dashborad page click to Profile icon (only with auth) on nav", () => {
    cy.get('[data-cy="nav-menu"] > li').eq(3).should("have.text", "@"+user.name).click();
    cy.location("pathname").should("include", "/profile");
  });
});
