const mongoose = require("mongoose");
//dummys
const { data, saveUser, loginUser } = require("../utils.js");
//model
const User = require("../../models/users.model.js");
//app
const app = require("../../app.js");
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
  mongoose.connection.close();
});

//valid requires fields values
describe("Given valid required fields", () => {
  beforeEach(async () => await User.deleteMany());
  //add user
  test("should register a user", async () => {
    const res = await api.post("/api/auth/signup").send(data.user).expect(200);
    expect(res.body).toHaveProperty("_id");
    expect(res.body).not.toHaveProperty("password");
    //signin (validate ok register)
    await api
      .post("/api/auth/signin")
      .send({ email: data.user.email, password: data.user.password })
      .expect(200)
      .expect("Content-Type", /json/)
      .expect("set-cookie", /accessToken/);
  });

  //add users
  test.each(data.users)("Should register users", async (user) => {
    const res = await api.post("/api/auth/signup").send(user).expect(200);
    expect(res.body).toHaveProperty("_id");
    expect(res.body).not.toHaveProperty("password");
    //signin (validate ok register)
    await api
      .post("/api/auth/signin")
      .send({ email: user.email, password: user.password })
      .expect(200)
      .expect("Content-Type", /json/)
      .expect("set-cookie", /accessToken/);
  });
});

//empty data
describe("Given empty data", () => {
  //Not user register
  //(valida que al final de cada prueba no se haya registrado un usuario (pruebas negativas))
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
    //signin (validate no ok register)
    await api
      .post("/api/auth/signin")
      .send({ email: data.user.email, password: data.user.password })
      .expect(400)
      .then((res) => {
        expect(res.headers).not.toHaveProperty("set-cookie");
        expect(res.body).toEqual(
          expect.arrayContaining(["Invalid credentials"])
        );
      });
  });

  //without email required field
  test("Should not register without email required field", async () => {
    const res = await api
      .post("/api/auth/signup")
      .send({ name: "name", email: "", password: "asdasd" })
      .expect(400);
    expect(res.body).toEqual(expect.arrayContaining(["Invalid Email"]));
  });

  //without password required field
  test("Should not register without password required field", async () => {
    const res = await api
      .post("/api/auth/signup")
      .send({ name: "name", email: "emil@email.com", password: "" })
      .expect(400);
    expect(res.body).toEqual(
      expect.arrayContaining(["Invalid Password between 6 and 12 charact"])
    );
  });
});

//invalid required fields values
describe("Given invalid data", () => {
  //Not user register
  //(valida que al final de cada prueba no se haya registrado un usuario (pruebas negativas))
  afterEach(async () => {
    const users = await User.find({});
    expect(users).toEqual(expect.arrayContaining([]));
  });
  //with password length 5 charact required field
  test("Should not register with password length 5 charact", async () => {
    const res = await api
      .post("/api/auth/signup")
      .send({ name: "name", email: "emil@email.com", password: "asdas" })
      .expect(400)
      .then((response) => {
        expect(response.body).toEqual(
          expect.arrayContaining(["Invalid Password between 6 and 12 charact"])
        );
      });
    //signin (validate no ok register)
    await api
      .post("/api/auth/signin")
      .send({ email: "emil@email.com", password: "asdas" })
      .expect(400)
      .then((res) => {
        expect(res.headers).not.toHaveProperty("set-cookie", /accessToken/);
        expect(res.body).toEqual(
          expect.arrayContaining(["Invalid Password between 6 and 12 charact"])
        );
      });
  });

  //with password length 13 charact required field
  test("Should not register user with password length 13 charact", async () => {
    await api
      .post("/api/auth/signup")
      .send({ name: "name", email: "emil@email.com", password: "asdas" })
      .expect(400)
      .then((res) => {
        expect(res.headers).not.toHaveProperty("set-cookie", /accessToken/);
        expect(res.body).toEqual(
          expect.arrayContaining(["Invalid Password between 6 and 12 charact"])
        );
      });
    //signin (validate no ok register)
    await api
      .post("/api/auth/signin")
      .send({ email: "emil@email.com", password: "asdas" })
      .expect(400)
      .then((res) => {
        expect(res.headers).not.toHaveProperty("set-cookie", /accessToken/);
        expect(res.body).toEqual(
          expect.arrayContaining(["Invalid Password between 6 and 12 charact"])
        );
      });
  });

  //user email duplicate
  describe("Duplicate Email field", () => {
    beforeEach(async () => {
      await saveUser(data.user);
    });
    //test
    test("Should not register user width duplicate email", async () => {
      await api
        .post("/api/auth/signup")
        .send({ ...data.user, password: "fffffff" })
        .expect(400)
        .then((res) => {
          expect(res.headers).not.toHaveProperty("set-cookie", /accessToken/);
          expect(res.body).toEqual(expect.arrayContaining(["Email exists"]));
        });

      //signin (validate no ok register)
      await api
        .post("/api/auth/signin")
        .send({ email: data.user.email, password: "fffffff" })
        .expect(400)
        .then((res) => {
          expect(res.headers).not.toHaveProperty("set-cookie", /accessToken/);
          expect(res.body).toEqual(
            expect.arrayContaining(["Invalid credentials"])
          );
        });
    });
  });
});
