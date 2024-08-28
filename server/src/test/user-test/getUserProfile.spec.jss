const mongoose = require("mongoose");
//DUMYS
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
  await User.deleteMany();
  mongoose.connection.close();
});

let token;
describe("Get profile user data with authentication", () => {
  beforeEach(async () => {
    await saveUser(data.user);
    const res = await api
      .post("/api/auth/signin")
      .send({ email: data.user.email, password: data.user.password })
      .expect(200)
      .expect("Content-Type", /json/)
      .expect("set-cookie", /accessToken/);
    token = res.headers["set-cookie"][0].split(";")[0].split("=")[1];
  });

  test("should return profile information", async () => {
    const res = await api
      .get("/api/users/profile")
      .set("Cookie", [`accessToken=${token}`])
      .send()
      .expect(200);
    expect(res.body).toHaveProperty("_id");
    expect(res.body).toHaveProperty("name", data.user.name);
    expect(res.body).toHaveProperty("email", data.user.email);
    expect(res.body).not.toHaveProperty("password");
  });
});

describe("Get profile user withouth authentication (without token)", () => {
  test("should not return profile information", async () => {
    const res = await api
      .get("/api/users/profile")
      .set("Cookie", "")
      .send()
      .expect(400);
    expect(res.body).not.toHaveProperty("_id");
    expect(res.body).not.toHaveProperty("name", data.user.name);
    expect(res.body).not.toHaveProperty("email", data.user.email);
    expect(res.body).toEqual(expect.arrayContaining(["Invalid Token"]));
  });

  test("should return Invalid Token message with other token name", async () => {
    const res = await api
      .get("/api/users/profile")
      .set("Cookie", [`access=${token}`])
      .send()
      .expect(400);
    expect(res.body).toEqual(expect.arrayContaining(["Invalid Token"]));
  });

  test("should return Invalid Token message", async () => {
    const res = await api
      .get("/api/users/profile")
      .set("Cookie", "")
      .send()
      .expect(400);
    expect(res.body).toEqual(expect.arrayContaining(["Invalid Token"]));
  });
});
