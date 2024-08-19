//app
const app = require("../app.js");
//hash
const { hashPass } = require("../utils/handlePass.js");
//model
const User = require("../models/users.model.js");
//SUPERTEST
const request = require("supertest");
const api = request(app);

const data = {
  users: [
    {
      name: "test1",
      email: "test1@algo.cl",
      password: "asdasd",
    },
    {
      name: "test2",
      email: "test2@algo.cl",
      password: "asdasd",
    },
    {
      name: "test3",
      email: "test3@algo.cl",
      password: "asdasd",
    },
  ],
  user: {
    name: "test4",
    email: "test4@algo.cl",
    password: "asdasd",
  },
  notUsersValues: {
    name: "",
    email: "",
    password: "",
  },
  userUpdate: {
    name: "test5",
    email: "test5@algo.cl",
    password: "passEdit",
    confirmPassword: "passEdit",
  },
};

const saveUser = async (user) => {
  try {
    const res = await api.post("/api/auth/signup").send(user).expect(200);
    expect(res.body).toHaveProperty("_id");
  } catch (error) {
    console.log(error);
  }
};

const saveUsers = async (users) => {
  users.forEach(async (user) => {
    await api
      .post("/api/auth/signup")
      .send(user)
      .expect(200)
      .expect("Content-type", /json/);
  });
};

const loginUserTrue = async ({ email, password }) => {
  ///login (para confirmar usuario editado)
  try {
    return await api
      .post("/api/auth/signin")
      .send({
        email,
        password,
      })
      .expect(200)
      .expect("Content-Type", /json/)
      .expect("set-cookie", /accessToken/);
  } catch (error) {
    console.log(error);
  }
};

const loginUserFalse = async ({
  body: { email, password },
  statusCode,
  messageExpect,
}) => {
  try {
    await api
      .post("/api/auth/signin")
      .send({
        email,
        password,
      })
      .expect(statusCode)
      .then((res) => {
        expect(res.header).not.toHaveProperty("set-cookie", /accessToken/);
        expect(res.body).toEqual(expect.arrayContaining([`${messageExpect}`]));
      });
  } catch (error) {
    console.log(error);
  }
};

module.exports = { data, saveUser, saveUsers, loginUserTrue, loginUserFalse };
