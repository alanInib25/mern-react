const mongoose = require("mongoose");
//dummys
const { data, registerUser, registerUsers } = require("../utils.js");
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
  await User.deleteMany();
  mongoose.connection.close();
});

//Signin de usuario
describe("Signin user", () => {
  beforeEach(async () => {
    await User.deleteMany();
    await registerUser(data.user);
    await registerUsers(data.users);
  });

  afterAll(async () => {
    await User.deleteMany();
  });

  test("should login a user", async () => {
    const res = await api
      .post("/api/auth/signin")
      .send(data.user)
      .expect(200)
      .expect("Content-Type", /json/)
      .expect("set-cookie", /accessToken/);

    expect(res.body).toHaveProperty("_id");
    expect(res.body).toHaveProperty("email", data.user.email);
    expect(res.body).toHaveProperty("name", data.user.name);
    expect(res.body).not.toHaveProperty("password");
  });

  //login usuario
  test("should login users", async () => {
    for (let i = 0; i < data.users.length; i++) {
      const res = await api
        .post("/api/auth/signin")
        .send(data.users[i])
        .expect(200)
        .expect("Content-Type", /json/)
        .expect("set-cookie", /accessToken/);

      expect(res.body).toHaveProperty("_id");
      expect(res.body).toHaveProperty("email", data.users[i].email);
      expect(res.body).toHaveProperty("name", data.users[i].name);
      expect(res.body).not.toHaveProperty("password");
    }
  });
});

//Validacion signin usuario con campos vacios
describe("Give empty data", () => {
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

    expect(res.headers).not.toHaveProperty("set-cookie", /accessToken/);
    expect(res.body).toEqual(
      expect.arrayContaining([
        "Invalid Email, Invalid Password between 6 and 12 charact",
      ])
    );
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
});

//invalid required fields values
describe("Given invalid required fields", () => {
  beforeAll(async () => await registerUser(data.user));
  afterAll(async () => await User.deleteMany());
  //with invalid password
  test("Should not login with invalid password", async () => {
    const res = await api
      .post("/api/auth/signin")
      .send({ ...data.user, password: "123123" })
      .expect(400);

    expect(res.body).toEqual(expect.arrayContaining(["Invalid credentials"]));
    expect(res.headers).not.toHaveProperty("set-cookie", /accessToken/);
  });

  //with invalid email
  test("Should not login with invalid email", async () => {
    const res = await api
      .post("/api/auth/signin")
      .send({ email: data.user.email, password: "123123" })
      .expect(400);

    expect(res.body).toEqual(expect.arrayContaining(["Invalid credentials"]));
    expect(res.headers).not.toHaveProperty("set-cookie", /accessToken/);
  });
});
