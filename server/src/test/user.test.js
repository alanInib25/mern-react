const mongoose = require("mongoose");
//DUMYS
const { data, saveUsers } = require("./utils.js");
//model
const User = require("../models/users.model.js");
//app
const app = require("../app.js");
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
  mongoose.connection.close();
});

describe("User maintenance", () => {
  let token;
  describe("User login (protected routes)", () => {
    beforeAll(async () => await saveUsers(data.users));
/*     afterAll(async () => await User.deleteMany()); */

    beforeEach(async () => {
      //login (pre-req)
      const res = await api
        .post("/api/auth/signin")
        .send(data.users[0])
/*         .expect(200)
        .expect("Content-Type", /json/)
        .expect("set-cookie", /accessToken/);
      token = res.header["set-cookie"][0]; */
      console.log(res);
    });

    test("should login", async () =>{
      console.log(data.users)
      console.log(data.users[0])
      const res = await api.post("/api/auth/signin").send(data.users[0]);
      console.log(res)
    })
    //get use user profile info
    test.skip("should return user profile data", async () => {
      const res = await api
        .get("/api/users/profile")
        .set("Accept", "application/json")
        .set("Cookie", [token])
        console.log(res)
       /*  .expect(200);
      expect(res.body).toHaveProperty("_id");
      expect(res.body).not.toHaveProperty("password"); */
    });

    //get users
    test.skip("Should return users registered info", async () => {
      const users = await User.find().select("-password").sort({ createdAt: -1 }).exec();
      console.log(users)
      const res = await api
        .get("/api/users/")
        .set("Accept", "application/json")
        .set("Cookie", [token])
        .expect(200);
        console.log(res)
/*       expect(res.body).toHaveProperty(users) */
    });
  });
  /* describe("User logout (protected routes)", () => {}); */
});
