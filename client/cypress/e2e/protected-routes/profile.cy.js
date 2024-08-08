import user from "../../fixtures/user.json";

describe("Profile page tests", () => {
  beforeEach(() => {
    cy.visit("/");
    cy.db_reset_test();
    cy.signupUser(user);
    cy.signinUser(user);
  });

  afterEach(() => {
    cy.signoutUser();
  });

  it("Profile page is displayed", () => {
    cy.get("header").should("exist");
    cy.get('[data-cy="user-avatar-header"]')
      .should("have.attr", "alt", "Not user image")
      .and("have.attr", "src", "/user.png");
    cy.get("h2").should("have.text", "@" + user.name);
    cy.location("pathname").should("include", "dashboard");
    cy.get('[data-cy="nav-menu"] > li:nth-child(2) > a')
      .should("contain", "Profile")
      .click();
    cy.location("pathname").should("include", "profile");
    cy.get('[data-cy="avatar-form"]').should("exist");
    cy.get('[data-cy="profile-form"]').should("exist");
  });

  it("Profile page display profile form with valid username and email values, password and confirm password empty", () => {
    cy.get('[data-cy="nav-menu"] > li:nth-child(2) > a')
      .should("contain", "Profile")
      .click();
    cy.get('[data-cy="profile-form"]').should("exist");
    cy.get('input[placeholder="Name..."]')
      .should("exist")
      .and("have.value", user.name);
    cy.get('input[placeholder="Email..."]')
      .should("exist")
      .and("have.value", user.email);
    cy.get('input[placeholder="Password..."]')
      .should("exist")
      .and("have.value", "");
    cy.get('input[placeholder="Confirm Password..."]')
      .should("exist")
      .and("have.value", "");
  });

  describe("Profile page submit avatar form", () => {
    it("Submit avatar form", () => {
      const path = "/Users/alanI/Desktop/mern_react/client/public/avatar2.jpg";
      cy.get('[data-cy="nav-menu"] > li:nth-child(2) > a')
        .should("contain", "Profile")
        .click();
      cy.get("input[type=file]").selectFile(path);
      cy.get('[data-cy="user-avatar-header"]').should(
        "have.attr",
        "alt",
        user.name
      );
      cy.get('[data-cy="nav-menu"] > li:nth-child(3) > a')
        .should("contain", "Signout")
        .click();
      cy.signinUser(user);
      cy.location("pathname").should("include", "/dashboard");
      cy.get('[data-cy="user-avatar-header"]').should(
        "have.attr",
        "alt",
        user.name
      );
      cy.get("h2").should("have.text", "@" + user.name);
      cy.get('[data-cy="user-avatar-dashboard"]').should(
        "have.attr",
        "alt",
        user.name
      );
      cy.get(".user-info > h3").should("have.text", user.name);
      cy.get(".user-info > h4").should("have.text", user.email);
    });
  });

  describe("Profile page submit profile form with valid data", () => {
    it("Submit profile form with valid passwords (6 length)", () => {
      cy.get('[data-cy="nav-menu"] > li:nth-child(2) > a')
        .should("contain", "Profile")
        .click();
      cy.get('input[placeholder="Name..."]')
        .should("exist")
        .and("have.value", user.name);
      cy.get('input[placeholder="Email..."]')
        .should("exist")
        .and("have.value", user.email);
      cy.get('input[placeholder="Password..."]').should("exist").type("123456");
      cy.get('input[placeholder="Confirm Password..."]')
        .should("exist")
        .type("123456");
      cy.get(".btn").should("contain", "Update").click();
      cy.get('[data-cy="nav-menu"] > li:nth-child(3) > a')
        .should("contain", "Signout")
        .click();
      cy.signinUser({ ...user, password: "123456" });
      cy.location("pathname").should("include", "/dashboard");
      cy.get('[data-cy="user-avatar-dashboard"]').should(
        "have.attr",
        "alt",
        "Default User avatar"
      );
      cy.get(".user-info > h3").should("have.text", user.name);
      cy.get(".user-info > h4").should("have.text", user.email);
    });

    it("Submit profile form with valid passwords (12 length)", () => {
      cy.get('[data-cy="nav-menu"] > li:nth-child(2) > a')
        .should("contain", "Profile")
        .click();
      cy.get('input[placeholder="Name..."]')
        .should("exist")
        .and("have.value", user.name);
      cy.get('input[placeholder="Email..."]')
        .should("exist")
        .and("have.value", user.email);
      cy.get('input[placeholder="Password..."]')
        .should("exist")
        .type("123456789012");
      cy.get('input[placeholder="Confirm Password..."]')
        .should("exist")
        .type("123456789012");
      cy.get(".btn").should("contain", "Update").click();
      cy.get('[data-cy="nav-menu"] > li:nth-child(3) > a')
        .should("contain", "Signout")
        .click();
      cy.signinUser({ ...user, password: "123456789012" });
      cy.location("pathname").should("include", "/dashboard");
      cy.get('[data-cy="user-avatar-dashboard"]').should(
        "have.attr",
        "alt",
        "Default User avatar"
      );
      cy.get(".user-info > h3").should("have.text", user.name);
      cy.get(".user-info > h4").should("have.text", user.email);
    });

    it("submit profile form with same email and new name, email ", () => {
      cy.get('[data-cy="nav-menu"] > li:nth-child(2) > a')
        .should("contain", "Profile")
        .click();
      cy.get('input[placeholder="Name..."]')
        .should("exist")
        .clear()
        .type("other name");
      cy.get('input[placeholder="Email..."]')
        .should("exist")
        .and("have.value", user.email);
      cy.get('input[placeholder="Password..."]')
        .should("exist")
        .clear()
        .type("123456789012");
      cy.get('input[placeholder="Confirm Password..."]')
        .should("exist")
        .clear()
        .type("123456789012");
      cy.get(".btn").should("contain", "Update").click();
      cy.get('[data-cy="nav-menu"] > li:nth-child(3) > a')
        .should("contain", "Signout")
        .click();
      cy.signinUser({
        ...user,
        password: "123456789012",
      });
      cy.location("pathname").should("include", "/dashboard");
      /* cy.get('[data-cy="user-avatar-header"]').should("have.attr", "alt", user.name); */
      cy.get('[data-cy="user-avatar-header"]')
        .should("have.attr", "alt", "Not user image")
        .and("have.attr", "src", "/user.png");
      cy.get("h2").should("have.text", "@" + "other name");
      cy.get('[data-cy="user-avatar-dashboard"]').should(
        "have.attr",
        "alt",
        "Default User avatar"
      );
      cy.get(".user-info > h3").should("have.text", "other name");
      cy.get(".user-info > h4").should("have.text", user.email);
    });

    it("submit profile form with all new data", () => {
      cy.get('[data-cy="nav-menu"] > li:nth-child(2) > a')
        .should("contain", "Profile")
        .click();
      cy.get('input[placeholder="Name..."]')
        .should("exist")
        .clear()
        .type("other name");
      cy.get('input[placeholder="Email..."]')
        .should("exist")
        .clear()
        .type("otherEmail@gmail.com");
      cy.get('input[placeholder="Password..."]')
        .should("exist")
        .clear()
        .type("123456789012");
      cy.get('input[placeholder="Confirm Password..."]')
        .should("exist")
        .clear()
        .type("123456789012");
      cy.get(".btn").should("contain", "Update").click();
      cy.get('[data-cy="nav-menu"] > li:nth-child(3) > a')
        .should("contain", "Signout")
        .click();
      cy.signinUser({
        email: "otherEmail@gmail.com",
        password: "123456789012",
      });
      cy.location("pathname").should("include", "/dashboard");
      cy.get('[data-cy="user-avatar-header"]')
        .should("have.attr", "alt", "Not user image")
        .and("have.attr", "src", "/user.png");
      cy.get("h2").should("have.text", "@" + "other name");
      cy.get('[data-cy="user-avatar-dashboard"]').should(
        "have.attr",
        "alt",
        "Default User avatar"
      );
      cy.get(".user-info > h3").should("have.text", "other name");
      cy.get(".user-info > h4").should("have.text", "otherEmail@gmail.com");
    });
  });

  describe("Profile page submit avatar and profile form", () => {
    it("Update all Data", () => {
      //avatar
      const path = "/Users/alanI/Desktop/mern_react/client/public/avatar2.jpg";
      cy.get('[data-cy="nav-menu"] > li:nth-child(2) > a')
        .should("contain", "Profile")
        .click();
      cy.location("pathname").should("include", "/profile");
      cy.get("input[type=file]").selectFile(path);
      cy.get('[data-cy="user-avatar-header"]').should(
        "have.attr",
        "alt",
        user.name
      );
      //end avatar
      //profile
      cy.get('input[placeholder="Name..."]')
        .should("exist")
        .clear()
        .type("other name");
      cy.get('input[placeholder="Email..."]')
        .should("exist")
        .clear()
        .type("otherEmail@gmail.com");
      cy.get('input[placeholder="Password..."]')
        .should("exist")
        .clear()
        .type("123456789012");
      cy.get('input[placeholder="Confirm Password..."]')
        .should("exist")
        .clear()
        .type("123456789012");
      cy.get(".btn").should("contain", "Update").click();
      //end profile
      //signout
      cy.get('[data-cy="nav-menu"] > li:nth-child(3) > a')
        .should("contain", "Signout")
        .click();
      //signin
      cy.signinUser({
        email: "otherEmail@gmail.com",
        password: "123456789012",
      });
      cy.location("pathname").should("include", "/dashboard");
      cy.get('[data-cy="user-avatar-header"]').should(
        "have.attr",
        "alt",
        "other name"
      );
      cy.get("h2").should("have.text", "@" + "other name");
      cy.get('[data-cy="user-avatar-dashboard"]').should(
        "have.attr",
        "alt",
        "other name"
      );
      cy.get(".user-info > h3").should("have.text", "other name");
      cy.get(".user-info > h4").should("have.text", "otherEmail@gmail.com");
    });
  });

  describe("Profile page submit profile form without data", () => {
    it("submit profile form without data", () => {
      cy.get('[data-cy="nav-menu"] > li:nth-child(2) > a')
        .should("contain", "Profile")
        .click();
      cy.get('input[placeholder="Name..."]')
        .should("exist")
        .and("have.value", user.name)
        .clear();
      cy.get('input[placeholder="Email..."]')
        .should("exist")
        .and("have.value", user.email)
        .clear();
      cy.get('input[placeholder="Password..."]').should("exist").clear();
      cy.get('input[placeholder="Confirm Password..."]')
        .should("exist")
        .clear();
      cy.get(".btn").should("contain", "Update").click();
      cy.get("small").should("have.text", "All fields are required");
    });

    it("submit profile form without confirm password input value", () => {
      cy.get('[data-cy="nav-menu"] > li:nth-child(2) > a')
        .should("contain", "Profile")
        .click();
      cy.get('input[placeholder="Name..."]')
        .should("exist")
        .and("have.value", user.name);
      cy.get('input[placeholder="Email..."]')
        .should("exist")
        .and("have.value", user.email);
      cy.get('input[placeholder="Password..."]').should("exist").type("123asd");
      cy.get('input[placeholder="Confirm Password..."]')
        .should("exist")
        .clear();
      cy.get(".btn").should("contain", "Update").click();
      cy.get("small").should("have.text", "All fields are required");
    });

    it("submit profile form without password input value", () => {
      cy.get('[data-cy="nav-menu"] > li:nth-child(2) > a')
        .should("contain", "Profile")
        .click();
      cy.get('input[placeholder="Name..."]')
        .should("exist")
        .and("have.value", user.name);
      cy.get('input[placeholder="Email..."]')
        .should("exist")
        .and("have.value", user.email);
      cy.get('input[placeholder="Password..."]').should("exist").clear();
      cy.get('input[placeholder="Confirm Password..."]')
        .should("exist")
        .type("123asd");
      cy.get(".btn").should("contain", "Update").click();
      cy.get("small").should("have.text", "All fields are required");
    });

    it("submit profile form without email input value", () => {
      cy.get('[data-cy="nav-menu"] > li:nth-child(2) > a')
        .should("contain", "Profile")
        .click();
      cy.get('input[placeholder="Name..."]')
        .should("exist")
        .and("have.value", user.name);
      cy.get('input[placeholder="Email..."]')
        .should("exist")
        .and("have.value", user.email)
        .clear();
      cy.get('input[placeholder="Password..."]').should("exist").type("123asd");
      cy.get('input[placeholder="Confirm Password..."]')
        .should("exist")
        .type("123asd");
      cy.get(".btn").should("contain", "Update").click();
      cy.get("small").should("have.text", "All fields are required");
    });

    it("submit profile form without name input value", () => {
      cy.get('[data-cy="nav-menu"] > li:nth-child(2) > a')
        .should("contain", "Profile")
        .click();
      cy.get('input[placeholder="Name..."]')
        .should("exist")
        .and("have.value", user.name)
        .clear();
      cy.get('input[placeholder="Email..."]')
        .should("exist")
        .and("have.value", user.email);
      cy.get('input[placeholder="Password..."]').should("exist").type("123asd");
      cy.get('input[placeholder="Confirm Password..."]')
        .should("exist")
        .type("123asd");
      cy.get(".btn").should("contain", "Update").click();
      cy.get("small").should("have.text", "All fields are required");
    });
  });

  describe("Profile page submit profile form with invalid data", () => {
    it("Submit profile form with email bad format", () => {
      cy.get('[data-cy="nav-menu"] > li:nth-child(2) > a')
        .should("contain", "Profile")
        .click();
      cy.get('input[placeholder="Name..."]')
        .should("exist")
        .clear()
        .type("other name");
      cy.get('input[placeholder="Email..."]')
        .should("exist")
        .clear()
        .type(".email@example.com");
      cy.get('input[placeholder="Password..."]')
        .should("exist")
        .clear()
        .type("123456789012");
      cy.get('input[placeholder="Confirm Password..."]')
        .should("exist")
        .clear()
        .type("123456789012");
      cy.get(".btn").should("contain", "Update").click();
      cy.get("small").should("have.text", "Invalid Email");
    });

    it("Profile page submit profile form with diferent passwords", () => {
      cy.get('[data-cy="nav-menu"] > li:nth-child(2) > a')
        .should("contain", "Profile")
        .click();
      cy.get('input[placeholder="Name..."]')
        .should("exist")
        .clear()
        .type("other name");
      cy.get('input[placeholder="Email..."]')
        .should("exist")
        .clear()
        .type("email@example.com");
      cy.get('input[placeholder="Password..."]')
        .should("exist")
        .clear()
        .type("123456789101");
      cy.get('input[placeholder="Confirm Password..."]')
        .should("exist")
        .clear()
        .type("123456789012");
      cy.get(".btn").should("contain", "Update").click();
      cy.get("small").should("have.text", "Passwords not equals");
    });
  });
});
