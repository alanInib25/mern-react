const mongoose = require("mongoose");
//model
const User = require("../../models/users.model.js");
//DUMYS
const {
  data,
  registerUsers,
  registerUser,
  loginUserTrue,
  getTokenValue,
} = require("../utils.js");
const request = require("supertest");
const app = require("../../app.js");
const api = request(app);
let token;
const tokenName = "accessToken";

beforeAll(() => {
  mongoose
    .connect(process.env.DB_CONN_TEST)
    .then((res) => console.log("connect BD_TEST succeful"))
    .catch((error) => console.log(error));
});

afterAll(async () => {
  await mongoose.connection.close();
});

describe("Get users info", () => {
  beforeEach(async () => {
    await User.deleteMany();
    await registerUsers(data.users);
    await registerUser(data.user);
    //login
    const loginRes = await loginUserTrue(data.user);
    token = getTokenValue(loginRes.headers);
  });

  test("Should return users information with authentication", async () => {
    const res = await api
      .get("/api/users/")
      .set("accept", "application/json")
      .set("Cookie", [`${tokenName}=${token}`])
      .send()
      .expect(200);
    expect(res.body).toHaveLength(data.users.length + 1);
  });
});

//validacion Sin token
describe("Get users info without token", () => {
  beforeEach(async () => {
    await User.deleteMany();
    await registerUser(data.user);
    //login
    const loginRes = await loginUserTrue(data.user);
    token = getTokenValue(loginRes.headers);
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
    await registerUser(data.user);
    //login
    const loginRes = await loginUserTrue(data.user);
    token = getTokenValue(loginRes.headers);
  });

  test("should return Invalid Token message without token value", async () => {
    const res = await api
      .get(`/api/users`)
      .set("Cookie", [`${tokenName}=`])
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
      .set("Cookie", [`${tokenName}=${token + "asdasdAlan"}`])
      .send()
      .expect(404);
    expect(res.body).toEqual(expect.arrayContaining(["invalid signature"]));
  });
});
