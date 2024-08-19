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

describe("Get user info for Id with authentication", () => {
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

  test.each(data.users)(
    "Should return user Information for id",
    async (user) => {
      const { _id: userId } = await User.findOne({ email: user.email });
      const res = await api
        .get(`/api/users/${userId}`)
        .set("Cookie", [`accessToken=${token}`])
        .send()
        .expect(200);
      expect(userId.equals(res.body._id)).toEqual(true); //"equals, metodo de mognoDB para comparar los ObjectID"
      expect(res.body).toHaveProperty("name", user.name);
      expect(res.body).toHaveProperty("email", user.email);
    }
  );
});

//SIN AUTH
describe("Get user info withouth authentication", () => {
  beforeEach(async () => {
    await User.deleteMany();
    await saveUser(data.user);
  });

  test("Should return Invalid Token message", async () => {
    const { _id } = await User.findOne({email: data.user.email});
    const res = await api.get(`/api/users/${_id}`).send().expect(400);
    expect(res.body).not.toHaveProperty("_id");
    expect(res.body).not.toHaveProperty("name", data.user.name);
    expect(res.body).not.toHaveProperty("email", data.user.email);
    expect(res.body).toEqual(expect.arrayContaining(["Invalid Token"]));
  })
});

describe("Get user info without token", () => {
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
    const { _id } = await User.findOne({ email: data.user.email });
    const res = await api
      .get(`/api/users/${_id}`)
      .set("Cookie", "")
      .send()
      .expect(400);
    expect(res.body).not.toHaveProperty("_id");
    expect(res.body).not.toHaveProperty("name", data.user.name);
    expect(res.body).not.toHaveProperty("email", data.user.email);
    expect(res.body).toEqual(expect.arrayContaining(["Invalid Token"]));
  });
});

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
    const { _id } = await User.findOne({ email: data.user.email });
    const res = await api
      .get(`/api/users/${_id}`)
      .set("Cookie", [`accessToken=`])
      .send()
      .expect(400);
    expect(res.body).toEqual(expect.arrayContaining(["Invalid Token"]));
  });

  test("should return Invalid Token message with other token name", async () => {
    const { _id } = await User.findOne({ email: data.user.email });
    const res = await api
      .get(`/api/users/${_id}`)
      .set("Cookie", [`access=${token}`])
      .send()
      .expect(400);
    expect(res.body).toEqual(expect.arrayContaining(["Invalid Token"]));
  });

  test("should return Invalid Token message with bad format token", async () => {
    const { _id } = await User.findOne({ email: data.user.email });
    const res = await api
      .get(`/api/users/${_id}`)
      .set("Cookie", [`accessToken=${token + "asdasdAlan"}`])
      .send()
      .expect(404);
    expect(res.body).toEqual(expect.arrayContaining(["invalid signature"]));
  });
});
