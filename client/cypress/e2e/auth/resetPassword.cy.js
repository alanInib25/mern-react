import data from "../../fixtures/user.json";

describe("Reset password page tests", () => {
  var forgotToken;
/*   before(() => {
    cy.db_reset_test();
    cy.signupUser(data);
    cy.request("POST", "http://localhost:4000/api/auth/forgot-password/", {
      email: data.email,
    }).should((response) => {
      expect(response.status).to.equal(200);
      forgotToken = response.body;
      console.log("dentro", forgotToken);
    });
    cy.visit(`/reset-password/${forgotToken}/`);
    console.log("fuera", forgotToken);
  }) */
 cy.intercept("POST", "http://localhost:4000/api/auth/forgot-password/").as("getForgotToken");

  beforeEach(() => {
    cy.db_reset_test();
    cy.setAppStorage();
    cy.signupUser(data);
    cy.request("POST", "http://localhost:4000/api/auth/forgot-password/", {
      email: data.email,
    }).should((response) => {
      expect(response.status).to.equal(200);
    });
    cy.wait("@getForgotToken").should((intercept) => {
      console.log(intercept)
     })
   /*  console.log("fuera", forgotToken);
    cy.visit(`/reset-password/${forgotToken}`); */
  });

  //Reset password is displayed
  it.skip("Reset password is displayed", () => {
    cy.wait("@getForgotToken").should((intercept) => {
      console.log(intercept)
     })
  })

  it.skip("smoke", () => {
    console.log("smoke", forgotToken)
    cy.visit("/");
  });
});
