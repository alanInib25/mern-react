const mongoose = require("mongoose");
//dummys
const { data, saveUser } = require("../utils.js");
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
  /*   await User.deleteMany(); */
  mongoose.connection.close();
});

//valid email
describe("Given valid email value", () => {
  beforeEach(async () => {
    await User.deleteMany();
    await saveUser(data.user);
  });

  test("should return 200 status code sending valid email", async () => {
    await api
      .post("/api/auth/forgot-password")
      .send({ email: data.user.email })
      .expect(200);
  });
});

//empty data
describe("Given empty data", () => {
  beforeEach(async () => {
    await User.deleteMany();
    await saveUser(data.user);
  });

  test("Should return 404 code and error message when sending empty value", async () => {
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
      .send({ email: "" })
      .expect(400);
    expect(res.body).toEqual(expect.arrayContaining(["Invalid Email"]));
  });
});

//invalid data
describe("Given invalid email value", () => {
  beforeEach(async () => {
    await User.deleteMany();
    await saveUser(data.user);
  });

  //sending invalid email
  test("Should return 404 code and error message when sending not register email", async () => {
    const res = await api
      .post("/api/auth/forgot-password")
      .send({ email: "noTest@noTest.cl" })
      .expect(404);
    expect(res.body).toEqual(expect.arrayContaining(["Email not registered"]));
  });

  test("Should return 404 code and error message when sending bad format email value", async () => {
    const res = await api
      .post("/api/auth/forgot-password")
      .send({ email: ".noTest@noTest.cl" })
      .expect(400);
    expect(res.body).toEqual(expect.arrayContaining(["Invalid Email"]));
  });
});
