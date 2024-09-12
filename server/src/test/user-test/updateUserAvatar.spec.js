const mongoose = require("mongoose");
//model
const User = require("../../models/users.model.js");
//fs
const { readdir } = require("node:fs/promises");
//path
const { join } = require("path");
//DUMYS
const {
  data,
  loginUserTrue,
  registerUser,
  getTokenValue,
  deleteAvatarFromServer,
} = require("../utils.js");
const request = require("supertest");
const app = require("../../app.js");
const api = request(app);
let token;
let userLogged;
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

//validacion Actualizar avatar
describe.each(data.users)("Update Avatar", (user) => {
  beforeAll(async () => {
    await User.deleteMany();
    await registerUser(user);
    //login
    const loginRes = await loginUserTrue(user);
    token = getTokenValue(loginRes.headers);
    userLogged = loginRes.body;
  });

  afterAll(async () => {
    //elimina avatars de server
    await deleteAvatarFromServer();
    await User.deleteMany();
  });

  /*En attach metodo usar ruta absoluta de la imagen, con ruta relativa no funciona */
  test("Should update avatar", async () => {
    const res = await api
      .post("/api/users/avatar")
      .set("Cookie", [`${tokenName}=${token}`])
      .attach(
        "avatar",
        "C:/Users/alanI/Desktop/mern_react/server/src/test/fixture/avatar/avatar15.jpg"
      )
      .expect(200);
    expect(res.body).toContain(".jpg");
    //valida avatar
    const loginUser = await loginUserTrue(user);
    expect(loginUser.body).toHaveProperty("avatar");
    expect(loginUser.body.avatar).not.toEqual(userLogged.avatar);
  });
});

//Validacion actualizar avatar sin avatar (vacio)
describe("Update avatar without avatar file", () => {
  beforeEach(async () => {
    await User.deleteMany();
    await registerUser(data.user);
    //login
    const loginRes = await loginUserTrue(data.user);
    token = getTokenValue(loginRes.headers);
    userLogged = loginRes.body;
  });

  /*En attach metodo usar ruta absoluta de la imagen, con ruta relativa no funciona */
  test("Should not update avatar", async () => {
    const res = await api
      .post("/api/users/avatar")
      .set("Cookie", [`${tokenName}=${token}`])
      .expect(400);
    expect(res.body).toEqual(expect.arrayContaining(["Not Image"]));
    //valida avatar
    const loginUser = await loginUserTrue(data.user);
    expect(loginUser.body).not.toHaveProperty("avatar");
  });
});

//Validacion actualizar avatar con extencion invalida
describe("Update avatar with invalid extencion file", () => {
  beforeEach(async () => {
    await User.deleteMany();
    await registerUser(data.user);
    //login
    const loginRes = await loginUserTrue(data.user);
    token = getTokenValue(loginRes.headers);
    userLogged = loginRes.body;
  });

  /*En attach metodo usar ruta absoluta de la imagen, con ruta relativa no funciona */
  test("Should not update avatar", async () => {
    const res = await api
      .post("/api/users/avatar")
      .set("Cookie", [`${tokenName}=${token}`])
      .attach(
        "avatar",
        "C:/Users/alanI/Desktop/mern_react/server/src/test/fixture/avatar/test.txt"
      )
      .expect(400);
      expect(res.body).toEqual(expect.arrayContaining(["Format thumbnail must be .jpg, .png, .jpeg"]))
    //valida avatar
    const loginUser = await loginUserTrue(data.user);
    expect(loginUser.body).not.toHaveProperty("avatar");
  });
});

//Validacion actualizar avatar con archivo mayor a 2mb
describe("Update avatar with file > 2mb", () => {
  beforeEach(async () => {
    await User.deleteMany();
    await registerUser(data.user);
    //login
    const loginRes = await loginUserTrue(data.user);
    token = getTokenValue(loginRes.headers);
    userLogged = loginRes.body;
  });

  /*En attach metodo usar ruta absoluta de la imagen, con ruta relativa no funciona */
  test("Should not update avatar", async () => {
    const res = await api
      .post("/api/users/avatar")
      .set("Cookie", [`${tokenName}=${token}`])
      .attach(
        "avatar",
        "C:/Users/alanI/Desktop/mern_react/server/src/test/fixture/avatar/3172kb.jpg"
      )
      .expect(400);
      expect(res.body).toEqual(expect.arrayContaining([
        `Upload file less than 2mb. (2000000 bytes)`,
      ]))
    //valida avatar
    const loginUser = await loginUserTrue(data.user);
    expect(loginUser.body).not.toHaveProperty("avatar");
  });
});

//Validacion actualizar avatar con token vacio y mal formato
describe("Update user data with empty and bad format token", () => {
  beforeEach(async () => {
    await User.deleteMany();
    await registerUser(data.user);
    //login
    const loginRes = await loginUserTrue(data.user);
    token = getTokenValue(loginRes.headers);
    userLogged = loginRes.body;
  });

  afterAll(async () => {
    await User.deleteMany();
  });

  //sin token
  test("Should return Invalid Token message", async () => {
    const res = await api
      .post(`/api/users/avatar`)
      .attach(
        "avatar",
        "C:/Users/alanI/Desktop/mern_react/server/src/test/fixture/avatar/avatar15.jpg"
      )
      .expect(400);
    expect(res.body).toEqual(expect.arrayContaining(["Invalid Token"]));
    //valida avatar
    const loginUser = await loginUserTrue(data.user);
    expect(loginUser.body).not.toHaveProperty("avatar");
  });

  //cookie vacia
  test("should not return user information", async () => {
    const res = await api
      .post(`/api/users/avatar`)
      .set("Cookie", "")
      .attach(
        "avatar",
        "C:/Users/alanI/Desktop/mern_react/server/src/test/fixture/avatar/avatar15.jpg"
      )
      .expect(400);
    expect(res.body).toEqual(expect.arrayContaining(["Invalid Token"]));

    //valida avatar
    const loginUser = await loginUserTrue(data.user);
    expect(loginUser.body).not.toHaveProperty("avatar");
  });

  test("should return Invalid Token message without token value", async () => {
    const res = await api
      .post(`/api/users/avatar`)
      .set("Cookie", [`accessToken=`])
      .attach(
        "avatar",
        "C:/Users/alanI/Desktop/mern_react/server/src/test/fixture/avatar/avatar15.jpg"
      )
      .expect(400);
    expect(res.body).toEqual(expect.arrayContaining(["Invalid Token"]));

    //valida avatar
    const loginUser = await loginUserTrue(data.user);
    expect(loginUser.body).not.toHaveProperty("avatar");
  });

  test("should return Invalid Token message with other token name", async () => {
    const res = await api
      .post(`/api/users/avatar`)
      .set("Cookie", [`access=${token}`])
      .attach(
        "avatar",
        "C:/Users/alanI/Desktop/mern_react/server/src/test/fixture/avatar/avatar15.jpg"
      )
      .expect(400);
    expect(res.body).toEqual(expect.arrayContaining(["Invalid Token"]));

    //valida avatar
    const loginUser = await loginUserTrue(data.user);
    expect(loginUser.body).not.toHaveProperty("avatar");
  });

  test("should return Invalid Token message with bad format token", async () => {
    const res = await api
      .post(`/api/users/avatar`)
      .set("Cookie", [`accessToken=${token + "asdasdAlan"}`])
      .attach(
        "avatar",
        "C:/Users/alanI/Desktop/mern_react/server/src/test/fixture/avatar/avatar15.jpg"
      )
      .expect(404);
    expect(res.body).toEqual(expect.arrayContaining(["invalid signature"]));
    //valida avatar
    const loginUser = await loginUserTrue(data.user);
    expect(loginUser.body).not.toHaveProperty("avatar");
  });
});
