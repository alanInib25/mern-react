describe("Protected routes", () => {
  //visit routes withou login
  it("When visit dashboard withou signin, redirect to signin page", () => {
    cy.visit("/dashboard");
    cy.url().should("not.include", "/dashboard");
    cy.url().should("include", "/signin");
    cy.get("h2").should("have.text", "Signin User")
  });

  it("When visit profile withou signin, redirect to signin page", () => {
    cy.visit("/profile");
    cy.url().should("not.include", "/profile");
    cy.url().should("include", "/signin");
    cy.get("h2").should("have.text", "Signin User")
  });
})