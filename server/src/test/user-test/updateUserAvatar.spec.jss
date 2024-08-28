const mongoose = require("mongoose");
//model
const User = require("../../models/users.model.js");
//DUMYS
const { data, loginUserTrue, saveUser } = require("../utils.js");
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

//actualiza avatar
describe("Update Avatar", () => {
  const { email, password } = data.user;
  beforeEach(async () => {
    await User.deleteMany();
    await saveUser(data.user);
    //login
    const res = await api
      .post("/api/auth/signin")
      .send({ email, password })
      .expect(200)
      .expect("Content-Type", /json/)
      .expect("set-cookie", /accessToken/);
    token = res.headers["set-cookie"][0].split(";")[0].split("=")[1];
  });

  /*En attach metodo usar ruta absoluta de la imagen, con ruta relativa no funciona */
  test("Should update avatar", async () => {
    const res = await api
      .post("/api/users/avatar")
      .set("Cookie", [`accessToken=${token}`])
      .attach(
        "avatar",
        "C:/Users/alanI/Desktop/mern_react/server/src/test/fixture/avatar15.jpg"
      )
      .expect(200);
    expect(res.body).toContain(".jpg");
    //valida avatar
    const loginUser = await loginUserTrue({
      email: data.user.email,
      password: data.user.password,
    });
    expect(loginUser.body).toHaveProperty("avatar");
  });
});

//No envia avatar
describe("Update avatar without avatar file", () => {
  const { email, password } = data.user;
  beforeEach(async () => {
    await User.deleteMany();
    await saveUser(data.user);
    //login
    const res = await api
      .post("/api/auth/signin")
      .send({ email, password })
      .expect(200)
      .expect("Content-Type", /json/)
      .expect("set-cookie", /accessToken/);
    token = res.headers["set-cookie"][0].split(";")[0].split("=")[1];
  });

  /*En attach metodo usar ruta absoluta de la imagen, con ruta relativa no funciona */
  test("Should not update avatar", async () => {
    const res = await api
      .post("/api/users/avatar")
      .set("Cookie", [`accessToken=${token}`])
      .expect(400);
    expect(res.body).toEqual(expect.arrayContaining(["Not Image"]));
    //valida avatar
    const loginUser = await loginUserTrue({
      email: data.user.email,
      password: data.user.password,
    });
    expect(loginUser.body).not.toHaveProperty("avatar");
  });
});

//sin logueo
describe("Update user data withouth authentication", () => {
  beforeEach(async () => {
    await User.deleteMany();
    await saveUser(data.user);
  });

  test("Should return Invalid Token message", async () => {
    const res = await api
      .post(`/api/users/avatar`)
      .attach(
        "avatar",
        "C:/Users/alanI/Desktop/mern_react/server/src/test/fixture/avatar15.jpg"
      )
      .expect(400);
    expect(res.body).toEqual(expect.arrayContaining(["Invalid Token"]));
    //valida avatar
    const loginUser = await loginUserTrue({
      email: data.user.email,
      password: data.user.password,
    });
    expect(loginUser.body).not.toHaveProperty("avatar");
  });
});

//logueado pero sin token
describe("Update user data without token", () => {
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

  test("should not return user information", async () => {
    const res = await api
      .post(`/api/users/avatar`)
      .set("Cookie", "")
      .attach(
        "avatar",
        "C:/Users/alanI/Desktop/mern_react/server/src/test/fixture/avatar15.jpg"
      )
      .expect(400);
    expect(res.body).toEqual(expect.arrayContaining(["Invalid Token"]));

    //valida avatar
    const loginUser = await loginUserTrue({
      email: data.user.email,
      password: data.user.password,
    });
    expect(loginUser.body).not.toHaveProperty("avatar");
  });
});

//logueado pero token mal formato
describe("Update user data with bad format token", () => {
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
      .post(`/api/users/avatar`)
      .set("Cookie", [`accessToken=`])
      .attach(
        "avatar",
        "C:/Users/alanI/Desktop/mern_react/server/src/test/fixture/avatar15.jpg"
      )
      .expect(400);
    expect(res.body).toEqual(expect.arrayContaining(["Invalid Token"]));

    //valida avatar
    const loginUser = await loginUserTrue({
      email: data.user.email,
      password: data.user.password,
    });
    expect(loginUser.body).not.toHaveProperty("avatar");
  });

  test("should return Invalid Token message with other token name", async () => {
    const res = await api
      .post(`/api/users/avatar`)
      .set("Cookie", [`access=${token}`])
      .attach(
        "avatar",
        "C:/Users/alanI/Desktop/mern_react/server/src/test/fixture/avatar15.jpg"
      )
      .expect(400);
    expect(res.body).toEqual(expect.arrayContaining(["Invalid Token"]));

    //valida avatar
    const loginUser = await loginUserTrue({
      email: data.user.email,
      password: data.user.password,
    });
    expect(loginUser.body).not.toHaveProperty("avatar");
  });

  test("should return Invalid Token message with bad format token", async () => {
    const res = await api
      .post(`/api/users/avatar`)
      .set("Cookie", [`accessToken=${token + "asdasdAlan"}`])
      .attach(
        "avatar",
        "C:/Users/alanI/Desktop/mern_react/server/src/test/fixture/avatar15.jpg"
      )
      .expect(404);
    expect(res.body).toEqual(expect.arrayContaining(["invalid signature"]));

    //valida avatar
    const loginUser = await loginUserTrue({
      email: data.user.email,
      password: data.user.password,
    });
    expect(loginUser.body).not.toHaveProperty("avatar");
  });
});
