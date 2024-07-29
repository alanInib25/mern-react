const mongoose = require("mongoose");
//dummys
const {data, saveUser } = require("./utils.js");
//model
const User = require("../models/users.model.js");
//app
const app = require("../app.js");
//supertest
const request = require("supertest");
const api = request(app);

beforeAll(async () => {
  mongoose
    .connect(`${process.env.DB_CONN_TEST}`)
    .then((res) => console.log("connect BD_TEST succeful"))
    .catch((error) => console.log(error));
});

afterAll(async () => {
  /*   await User.deleteMany(); */
  mongoose.connection.close();
});


describe.skip("Authentication User", () => {
  //sign up user
  describe("Sign up User", () => {
    //valid requires fields values
    describe("Given valid required fields", () => {
      afterAll(async () => await User.deleteMany());
      //add user
      test("should register a user", async () => {
        await api.post("/api/auth/signup").send(data.user).expect(200);
      });

      //add users
      test.each(data.users)("Should register users", async (user) => {
        await api.post("/api/auth/signup").send(user).expect(200);
      });
    });

    //invalid required fields values
    describe("Given an invalid fields", () => {
      afterAll(async () => await User.deleteMany());
      //Not user register
      afterEach(async () => {
        const users = await User.find({});
        expect(users).toEqual(expect.arrayContaining([]));
      });
      //without all required fields
      test("should not register without all required fields", async () => {
        const res = await api.post("/api/auth/signup").send({}).expect(400);
        expect(res.body).toEqual(
          expect.arrayContaining([
            "Invalid Name, Invalid Email, Invalid Password between 6 and 12 charact",
          ])
        );
      });

      //without values of required fields
      test("should not register without values of required field", async () => {
        const res = await api
          .post("/api/auth/signup")
          .send(data.notUsersValues)
          .expect(400);
        expect(res.body).toEqual(
          expect.arrayContaining([
            "Invalid Name, Invalid Email, Invalid Password between 6 and 12 charact",
          ])
        );
      });

      //without name required field
      test("should not register without name value required", async () => {
        const res = await api
          .post("/api/auth/signup")
          .send({ name: "", email: "emil@email.com", password: "asdasd" })
          .expect(400);
        expect(res.body).toEqual(expect.arrayContaining(["Invalid Name"]));
      });

      //without email required field
      test("Should not register without pasword required field", async () => {
        const res = await api
          .post("/api/auth/signup")
          .send({ name: "name", email: "", password: "asdasd" })
          .expect(400);
        expect(res.body).toEqual(expect.arrayContaining(["Invalid Email"]));
      });

      //without password required field
      test("Should not register withput email required field", async () => {
        const res = await api
          .post("/api/auth/signup")
          .send({ name: "name", email: "emil@email.com", password: "" })
          .expect(400);
        expect(res.body).toEqual(
          expect.arrayContaining(["Invalid Password between 6 and 12 charact"])
        );
      });

      //with password length 5 charact required field
      test("Should not register without email required field", async () => {
        const res = await api
          .post("/api/auth/signup")
          .send({ name: "name", email: "emil@email.com", password: "asdas" })
          .expect(400);
        expect(res.body).toEqual(
          expect.arrayContaining(["Invalid Password between 6 and 12 charact"])
        );
      });

      //with password length 13 charact required field
      test("Should not register user without email required field", async () => {
        const res = await api
          .post("/api/auth/signup")
          .send({ name: "name", email: "emil@email.com", password: "asdas" })
          .expect(400);
        expect(res.body).toEqual(
          expect.arrayContaining(["Invalid Password between 6 and 12 charact"])
        );
      });

      //user email duplicate
      describe("Duplicate Email field", () => {
        beforeEach(async () => {
          await saveUser(data.user);
        });
        //test
        test("Should not register user width duplicate email", async () => {
          const res = await api
            .post("/api/auth/signup")
            .send(data.user)
            .expect(400);
          expect(res.body).toEqual(expect.arrayContaining(["Email exists"]));
        });
      });
    });
  });

  //sign in user
  describe("Sign in User", () => {
    //valid requires fields values
    describe("Given valid required fields", () => {
      afterAll(async () => await User.deleteMany());
      //login user
      describe("login user", () => {
        //pre-req: signup
        beforeEach(async () => await saveUser(data.user));
        //login user
        test("should login user", async () => {
          const res = await api
            .post("/api/auth/signin")
            .send(data.user)
            .expect(200)
            .expect("Content-Type", /json/)
            .expect("set-cookie", /accessToken/);
          expect(res.body).toHaveProperty(["_id"]);
          expect(res.body).not.toHaveProperty(["password"]);
        });
      });
    });
    //invalid required fields values
    describe("Given invalid required fields", () => {
      afterAll(async () => await User.deleteMany());
      //without all required fields
      test("Should not login without required fields", async () => {
        const res = await api.post("/api/auth/signin").send({}).expect(400);
        expect(res.body).toEqual(
          expect.arrayContaining([
            "Invalid Email, Invalid Password between 6 and 12 charact",
          ])
        );
        expect(res.headers).not.toHaveProperty("set-cookie", /accessToken/);
      });
      //without values of required fields
      test("Should not login without required fields values", async () => {
        const res = await api
          .post("/api/auth/signin")
          .send({ email: "", password: "" })
          .expect(400);
        expect(res.body).toEqual(
          expect.arrayContaining([
            "Invalid Email, Invalid Password between 6 and 12 charact",
          ])
        );
        expect(res.headers).not.toHaveProperty("set-cookie", /accessToken/);
      });
      //without email required field
      test("Should not login without email required field value", async () => {
        const res = await api
          .post("/api/auth/signin")
          .send({ email: "", password: "asdasd" })
          .expect(400);
        expect(res.body).toEqual(expect.arrayContaining(["Invalid Email"]));
        expect(res.headers).not.toHaveProperty("set-cookie", /accessToken/);
      });
      //without password required field
      test("Should not login without password required fields values", async () => {
        const res = await api
          .post("/api/auth/signin")
          .send({ email: "email@email.cl", password: "" })
          .expect(400);
        expect(res.body).toEqual(
          expect.arrayContaining(["Invalid Password between 6 and 12 charact"])
        );
        expect(res.headers).not.toHaveProperty("set-cookie", /accessToken/);
      });
      //Invalid password
      describe("Given invalid password", () => {
        beforeAll(async () => await saveUser(data.user));
        afterAll(async () => await User.deleteMany());
        //with invalid password
        test("Should not login with invalid password", async () => {
          const res = await api
            .post("/api/auth/signin")
            .send({ ...data.user, password: "123123" })
            .expect(400);
          expect(res.body).toEqual(
            expect.arrayContaining(["Invalid credentials"])
          );
          expect(res.headers).not.toHaveProperty("set-cookie", /accessToken/);
        });
        //with invalid email
        test("Should not login with invalid email", async () => {
          const res = await api
            .post("/api/auth/signin")
            .send({ email: data.user.email, password: "123123" })
            .expect(400);
          expect(res.body).toEqual(
            expect.arrayContaining(["Invalid credentials"])
          );
          expect(res.headers).not.toHaveProperty("set-cookie", /accessToken/);
        });
      });
    });
  });

  //forgot passssword
  describe("Forgot password", () => {
    //valid email
    describe("Given valid email value", () => {
      afterAll(async () => await User.deleteMany());
      beforeEach(async () => await saveUser(data.user));
      test("should return 200 status code sending valid email", async () => {
        await api
          .post("/api/auth/forgot-password")
          .send({ email: data.user.email })
          .expect(200);
      });
    });
    //invalid email
    describe("Given invalid email value", () => {
      beforeAll(async () => await saveUser(data.user));
      afterAll(async () => await User.deleteMany());
      //sending invalid email
      test("Should return 404 code and error message when sending invalid email", async () => {
        const res = await api
          .post("/api/auth/forgot-password")
          .send({ email: "noTest@noTest.cl" })
          .expect(404);
        expect(res.body).toEqual(
          expect.arrayContaining(["Email not registered"])
        );
      });
      //not sending data
      test("Should return 404 code and error message when not sending data", async () => {
        const res = await api
          .post("/api/auth/forgot-password")
          .send({})
          .expect(400);
        expect(res.body).toEqual(expect.arrayContaining(["Invalid Email"]));
      });
      //sending email empty
      test("Should return 404 code and error message when sending empty email field", async () => {
        const res = await api
          .post("/api/auth/forgot-password")
          .send({email: ""})
          .expect(400);
        expect(res.body).toEqual(expect.arrayContaining(["Invalid Email"]));
      });
    });
  });
});
