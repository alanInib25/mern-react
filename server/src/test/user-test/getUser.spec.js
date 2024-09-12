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
  invalidId,
} = require("../utils.js");
const request = require("supertest");
const app = require("../../app.js");
const api = request(app);
const nameToken = "accessToken";
let token;
let userLogged;

beforeAll(() => {
  mongoose
    .connect(process.env.DB_CONN_TEST)
    .then((res) => console.log("connect BD_TEST succeful"))
    .catch((error) => console.log(error));
});

afterAll(async () => {
  await mongoose.connection.close();
});

//Get user
describe("Get user info", () => {
  beforeAll(async () => {
    await User.deleteMany();
    await registerUsers(data.users);
    await registerUser(data.user);
    //login
    const loginRes = await loginUserTrue(data.user);
    token = getTokenValue(loginRes.headers);
    userLogged = loginRes.body;
  });

  afterAll(async () => {
    await User.deleteMany();
  });

  test("Should return user Information for id", async () => {
    const users = await User.find();
    for (let i = 0; i < users.length; i++) {
      const res = await api
        .get(`/api/users/${users[i]._id}`)
        .set("Cookie", [`${nameToken}=${token}`])
        .send()
        .expect(200);
      expect(res.body).toHaveProperty("_id", users[i]._id.toString());
      expect(res.body).toHaveProperty("name", users[i].name);
      expect(res.body).toHaveProperty("email", users[i].email);
      expect(res.body).not.toHaveProperty("password");
    }
  });
});

//valdiacion get user con id mal formato
describe("get user info with bad id", () => {
  beforeAll(async () => {
    await User.deleteMany();
    await registerUser(data.user);
    //login
    const loginRes = await loginUserTrue(data.user);
    token = getTokenValue(loginRes.headers);
  });

  afterAll(async () => {
    await User.deleteMany();
  });

  test("Should return 'Invalid Id' message when get user info with bad format id", async () => {
    const res = await api
      .get(`/api/posts/${invalidId}`)
      .set("Cookie", [`${nameToken}=${token}`])
      .set("Accpet", "application/json")
      .expect(400);
    expect(res.body).toEqual(expect.arrayContaining(["Invalid Id"]));
  });
});

//Validacion get user sin token
describe("Get user info with empty and bad format token", () => {
  beforeAll(async () => {
    await User.deleteMany();
    await registerUser(data.user);
    //login
    const loginRes = await loginUserTrue(data.user);
    token = getTokenValue(loginRes.headers);
  });

  afterAll(async () => {
    await User.deleteMany();
  });

  //sin token
  test("should return Invalid Token message without token value", async () => {
    const users = await User.find();
    for (let i = 0; i < users.length; i++) {
      const res = await api
        .get(`/api/users/${users[i]._id}`)
        .send()
        .expect(400);
      expect(res.body).toEqual(expect.arrayContaining(["Invalid Token"]));
    }
  });

  test("should return Invalid Token message without token value", async () => {
    const users = await User.find();
    for (let i = 0; i < users.length; i++) {
      const res = await api
        .get(`/api/users/${users[i]._id}`)
        .set("Cookie", [`${nameToken}=`])
        .send()
        .expect(400);
      expect(res.body).toEqual(expect.arrayContaining(["Invalid Token"]));
    }
  });

  test("should return Invalid Token message with other token name", async () => {
    const users = await User.find();
    for (let i = 0; i < users.length; i++) {
      const res = await api
        .get(`/api/users/${users[i]._id}`)
        .set("Cookie", [`access=${token}`])
        .send()
        .expect(400);
      expect(res.body).toEqual(expect.arrayContaining(["Invalid Token"]));
    }
  });

  test("should return Invalid Token message with bad format token", async () => {
    const users = await User.find();
    for (let i = 0; i < users.length; i++) {
      const res = await api
        .get(`/api/users/${users[i]._id}`)
        .set("Cookie", [`${nameToken}=${token + "asdasdAlan"}`])
        .send()
        .expect(404);
      expect(res.body).toEqual(expect.arrayContaining(["invalid signature"]));
    }
  });
});
