const mongoose = require("mongoose");
//DUMYS
const {
  data,
  loginUserTrue,
  getTokenValue,
  registerUser,
  registerUsers
} = require("../utils.js");
//model
const User = require("../../models/users.model.js");
//app
const app = require("../../app.js");
//supertest
const request = require("supertest");
const api = request(app);
let token;
const nameToken = "accessToken";

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

//Validacion get user profile data
describe("Get user profile data", () => {
  beforeAll(async () => {
    await User.deleteMany();
    await registerUser(data.user);
    const loginRes = await loginUserTrue(data.user);
    token = getTokenValue(loginRes.headers);
  });

/*   beforeAll(async () => {
    await User.deleteMany();
  }); */
  test("should get user profile data", async () => {
    const res = await api
      .get("/api/users/profile")
      .set("Cookie", [`${nameToken}=${token}`])
      .send()
      .expect(200);
    expect(res.body).toHaveProperty("_id");
    expect(res.body).toHaveProperty("name", data.user.name);
    expect(res.body).toHaveProperty("email", data.user.email);
    expect(res.body).not.toHaveProperty("password");
  });
});

//Validacion get user profile data sin informacion del profile
describe("Get user profile data no user", () => {
  beforeAll(async () => {
    await User.deleteMany();
    await registerUser(data.user);
    const loginRes = await loginUserTrue(data.user);
    token = getTokenValue(loginRes.headers);
    //borrando los usuarios despues de crearlos, y loguearlos
    //logré conseguir la prueba de mensaje User Error (cuando no hay data de usuario profile)
    await User.deleteMany();

  });

  test("should return 'User Error' message when get user profile data inexistent", async () => {
    const res = await api
      .get("/api/users/profile")
      .set("Cookie", [`${nameToken}=${token}`])
      .send()
      .expect(400);
      expect(res.body).toEqual(expect.arrayContaining(["User Error"]))
  });
});

//validaciones sin token
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
