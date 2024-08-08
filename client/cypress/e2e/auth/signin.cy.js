import user from "../../fixtures/user.json";

describe("Signin page test", () => {
  after(() => {
    cy.db_reset_test();
  });
  beforeEach(() => {
    cy.visit("http://localhost:5173/signin/");
    cy.db_reset_test();
    cy.clearCookies();
    cy.clearLocalStorage();
    cy.clearAllSessionStorage();
    cy.signupUser(user);
  });

  it.skip("smoke", () => {
    cy.visit("/signin");
  });

  it("Signin page is displayed", () => {
    cy.get("header").should("exist");
    cy.get("h2").should("have.text", "Signin User");
    cy.get("[data-cy = form-auth]").should("be.visible");
    cy.get("p").eq(0).should("have.text", "Your not have an account?Signup");
    cy.get("p").eq(1).should("have.text", "Forgot Password?Go");
  });

  it("Signin page click link Signup (Your not have an account?Signup)", () => {
    cy.get("p > a").eq(0).should("contain", "Signup").click();
    cy.url().should("include", "/signup");
    cy.get('h2').should("have.text", "Signup User");
  });

  it("Signin page click link Go (Forgot Password?Go)", () => {
    cy.get("p > a").eq(1).should("contain", "Go").click();
    cy.url().should("include", "/forgot-password");
    cy.get('h2').should("have.text", "Forgot Password")
  })

  //signin form with valid data
  describe("Signin valid data", () => {
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
      cy.signoutUser();
    });
  });

  //signin form with invalid data
  describe("Signin invalid data", () => {
    //without data
    it("Signin without data", () => {
      cy.get('input[placeholder="Email..."]').should("be.visible").clear();
      cy.get('input[placeholder = "Password..."]').should("be.visible").clear();
      cy.get("[data-cy=form-auth]").submit();
      cy.location("pathname").should("not.contains", "dashboard");
      cy.url().should("not.include", "dashboard");
      cy.getCookie("accessToken").should("be.null");
    });

    //without email
    it("Signin without email", () => {
      cy.get('input[placeholder = "Email..."]').should("be.visible").clear();
      cy.get('input[placeholder = "Password..."]')
        .should("be.visible")
        .type(user.password);
      cy.get("[data-cy=form-auth]").submit();
      cy.get("small").should("have.text", "All fields are required");
    });

    //without password
    it("Signin without valid name", () => {
      cy.get('input[placeholder = "Email..."]')
        .should("be.visible")
        .type(user.email);
      cy.get('input[placeholder = "Password..."]').should("be.visible").clear();
      cy.get("[data-cy=form-auth]").submit();
      cy.get("small").should("have.text", "All fields are required");
    });

    //invalid format email
    it("Signin with bad format email", () => {
      cy.get('input[placeholder = "Email..."]')
        .should("be.visible")
        .type("asda.cl");
      cy.get('input[placeholder = "Password..."]')
        .should("be.visible")
        .type(user.password);
      cy.get("[data-cy=form-auth]").submit();
      cy.get("small").should("have.text", "Invalid Email");
    });

    //password 5 charc length (test limit)
    it("Signin with password length 5", () => {
      cy.get('input[placeholder = "Email..."]')
        .should("be.visible")
        .type(user.email);
      cy.get('input[placeholder = "Password..."]')
        .should("be.visible")
        .type("12345");
      cy.get("[data-cy=form-auth]").submit();
      cy.get("small").should(
        "have.text",
        "Invalid Password between 6 and 12 charact"
      );
    });

    //password 13 charc length (test limit)
    it("Signin with password length 13", () => {
      cy.get('input[placeholder = "Email..."]')
        .should("be.visible")
        .type(user.email);
      cy.get('input[placeholder = "Password..."]')
        .should("be.visible")
        .type("1234567890123");
      cy.get("[data-cy=form-auth]").submit();
      cy.get("small").should(
        "have.text",
        "Invalid Password between 6 and 12 charact"
      );
    });

    //user not register
    it("Signin with user not registered", () => {
      cy.get('input[placeholder = "Email..."]')
        .should("be.visible")
        .type("otherTest_email@gmail.com");
      cy.get('input[placeholder = "Password..."]')
        .should("be.visible")
        .type("123456");
      cy.get("[data-cy=form-auth]").submit();
      cy.get("small").should("have.text", "Invalid credentials");
    });

    //Email registered and password not registerded
    it("Signin with email registerd and password not registered", () => {
      cy.get('input[placeholder = "Email..."]')
        .should("be.visible")
        .type(user.email);
      cy.get('input[placeholder = "Password..."]')
        .should("be.visible")
        .type("123456");
      cy.get("[data-cy=form-auth]").submit();
      cy.get("small").should("have.text", "Invalid credentials");
    });

    //Email not registered and password registerded
    it("Signin with email registerd and password not registered", () => {
      cy.get('input[placeholder = "Email..."]')
        .should("be.visible")
        .type("email_no_registered@algo.cl");
      cy.get('input[placeholder = "Password..."]')
        .should("be.visible")
        .type(user.password);
      cy.get("[data-cy=form-auth]").submit();
      cy.get("small").should("have.text", "Invalid credentials");
    });
  });
});
