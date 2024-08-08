import user from "../../fixtures/user.json";

describe("Signup page tests", () => {
  beforeEach(() => {
    cy.visit("/signup");
    cy.db_reset_test();
  });

  it("Signup page is displayed", () => {
    cy.get("header").should("exist");
    cy.get("h2").should("have.text", "Signup User");
    cy.get("[data-cy = form-auth]").should("be.visible");
    cy.get("p").should("have.text", "Your have an account?Signin");
  });

  it("Signup page click signin link", () => {
    cy.get("p > a").should("contain", "Signin").click();
    cy.location("pathname").should("include", "signin");
  })

  //signup form with valid data
  describe("Signup with valid data", () => {
    //submit
    it("Signup form submit", () => {
      cy.get('input[placeholder = "Name..."]')
        .should("be.visible")
        .type(user.name);
      cy.get('input[placeholder = "Email..."]')
        .should("be.visible")
        .type(user.email);
      cy.get('input[placeholder = "Password..."]')
        .should("be.visible")
        .type(user.password);
      cy.get("[data-cy=form-auth]").submit();
      cy.get("small").should("have.text", "User registered");
      //verifica signup con login
      cy.signinUser(user);
      cy.signoutUser();
    });

    it("Signup form submit with password 12 length", () => {
      cy.get('input[placeholder = "Name..."]')
        .should("be.visible")
        .type("test2");
      cy.get('input[placeholder = "Email..."]')
        .should("be.visible")
        .type("test2@test2.cl");
      cy.get('input[placeholder = "Password..."]')
        .should("be.visible")
        .type("123456789012");
      cy.get("[data-cy=form-auth]").submit();
      cy.get("small").should("have.text", "User registered");
      //verifica signup con login
      cy.signinUser({email: "test2@test2.cl", password: "123456789012"});
      cy.signoutUser();
    });
  });

  //signup form with invalid data
  describe("Signup with invalid data", () => {
    //without data
    it("Signup without valid data", () => {
      cy.get('input[placeholder = "Name..."]').should("be.visible").clear();
      cy.get('input[placeholder = "Email..."]').should("be.visible").clear();
      cy.get('input[placeholder = "Password..."]').should("be.visible").clear();
      cy.get("[data-cy=form-auth]").submit();
      cy.get("small").should("have.text", "All fields are required");
    });

    //without name
    it("Signup without name", () => {
      cy.get('input[placeholder = "Name..."]').should("be.visible").clear();
      cy.get('input[placeholder = "Email..."]')
        .should("be.visible")
        .type(user.email);
      cy.get('input[placeholder = "Password..."]')
        .should("be.visible")
        .type(user.password);
      cy.get("[data-cy=form-auth]").submit();
      cy.get("small").should("have.text", "All fields are required");
    });

    //without email
    it("Signup without email", () => {
      cy.get('input[placeholder = "Name..."]')
        .should("be.visible")
        .type(user.name);
      cy.get('input[placeholder = "Email..."]').should("be.visible").clear();
      cy.get('input[placeholder = "Password..."]')
        .should("be.visible")
        .type(user.password);
      cy.get("[data-cy=form-auth]").submit();
      cy.get("small").should("have.text", "All fields are required");
    });

    //without password
    it("Signup without valid name", () => {
      cy.get('input[placeholder = "Name..."]')
        .should("be.visible")
        .type(user.name);
      cy.get('input[placeholder = "Email..."]')
        .should("be.visible")
        .type(user.email);
      cy.get('input[placeholder = "Password..."]').should("be.visible").clear();
      cy.get("[data-cy=form-auth]").submit();
      cy.get("small").should("have.text", "All fields are required");
    });

    //invalid format email
    it("Signup with bad format email", () => {
      cy.get('input[placeholder = "Name..."]')
        .should("be.visible")
        .type(user.name);
      cy.get('input[placeholder = "Email..."]')
        .should("be.visible")
        .type("asda.cl");
      cy.get('input[placeholder = "Password..."]')
        .should("be.visible")
        .type(user.password);
      cy.get("[data-cy=form-auth]").submit();
      cy.get("small").should("have.text", "Invalid Email");
    });

    //password 5 charc length Qtest limit)
    it("Signup with password length 5", () => {
      cy.get('input[placeholder = "Name..."]')
        .should("be.visible")
        .type(user.name);
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
    it("Signup with password length 13", () => {
      cy.get('input[placeholder = "Name..."]')
        .should("be.visible")
        .type(user.name);
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
  });
});
