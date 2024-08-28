const mongoose = require("mongoose");
//model
const User = require("../../models/users.model.js");
//DUMYS
const { data, saveUsers, saveUser } = require("../utils.js");
const request = require("supertest");
const app = require("../../app.js");
const api = request(app);
let token;

beforeAll(() => {
  mongoose
    .connect(process.env.DB_CONN_TEST)
    .then((res) => console.log("connect BD_TEST succeful"))
    .catch((error) => console.log(error));
});

afterAll(async () => {
  await mongoose.connection.close();
});

describe("Get users info with authentication", () => {
  beforeEach(async () => {
    await User.deleteMany();
    await saveUsers(data.users);
    await saveUser(data.user);
    //login
    const res = await api
      .post("/api/auth/signin")
      .send({ email: data.user.email, password: data.user.password })
      .expect(200)
      .expect("Content-Type", /json/)
      .expect("set-cookie", /accessToken/);
    token = res.headers["set-cookie"][0].split(";")[0].split("=")[1];
  });

  test("Should return users information with authentication", async () => {
    const res = await api
      .get("/api/users/")
      .set("accept", "application/json")
      .set("Cookie", [`accessToken=${token}`])
      .send()
      .expect(200);
    expect(res.body).toHaveLength(data.users.length + 1);
  });
});

//SIN AUTH
describe("Get users info withouth authentication", () => {
  beforeEach(async () => {
    await User.deleteMany();
    await saveUser(data.user);
  });

  test("Should return Invalid Token message", async () => {
    const res = await api.get(`/api/users`).send().expect(400);
    expect(res.body).toEqual(expect.arrayContaining(["Invalid Token"]));
  });
});

//Sin token
describe("Get users info without token", () => {
  beforeEach(async () => {
    await User.deleteMany();
    await saveUser(data.user);
    //login
    const res = await api
      .post("/api/auth/signin")
      .send({ email: data.user.email, password: data.user.password })
      .expect(200)
      .expect("Content-Type", /json/)
      .expect("set-cookie", /accessToken/);
    token = res.headers["set-cookie"][0].split(";")[0].split("=")[1];
  });

  test("should not return profile information", async () => {
    const { _id } = await User.findOne({ email: data.user.email });
    const res = await api
      .get(`/api/users/`)
      .set("Cookie", "")
      .send()
      .expect(400);
    expect(res.body).toEqual(expect.arrayContaining(["Invalid Token"]));
  });
});

//Token mal formato
describe("Get user info with bad format token", () => {
  beforeEach(async () => {
    await User.deleteMany();
    await saveUser(data.user);
    //login
    const res = await api
      .post("/api/auth/signin")
      .send({ email: data.user.email, password: data.user.password })
      .expect(200)
      .expect("Content-Type", /json/)
      .expect("set-cookie", /accessToken/);
    token = res.headers["set-cookie"][0].split(";")[0].split("=")[1];
  });

  test("should return Invalid Token message without token value", async () => {
    const res = await api
      .get(`/api/users`)
      .set("Cookie", [`accessToken=`])
      .send()
      .expect(400);
    expect(res.body).toEqual(expect.arrayContaining(["Invalid Token"]));
  });

  test("should return Invalid Token message with other token name", async () => {
    const res = await api
      .get(`/api/users`)
      .set("Cookie", [`access=${token}`])
      .send()
      .expect(400);
    expect(res.body).toEqual(expect.arrayContaining(["Invalid Token"]));
  });

  test("should return Invalid Token message with bad format token", async () => {
    const { _id } = await User.findOne({ email: data.user.email });
    const res = await api
      .get(`/api/users`)
      .set("Cookie", [`accessToken=${token + "asdasdAlan"}`])
      .send()
      .expect(404);
    expect(res.body).toEqual(expect.arrayContaining(["invalid signature"]));
  });
});
