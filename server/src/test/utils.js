//app
const app = require("../app.js");
//hash
const { hashPass } = require("../utils/handlePass.js");
//model
const User = require("../models/users.model.js");
const Thumbnail = require("../models/thumbnail.model.js");
//SUPERTEST
const request = require("supertest");
const api = request(app);
//unlink
const { unlink, readdir } = require("node:fs/promises");
//path
const { join } = require("path");

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
    {
      name: "test4",
      email: "test4@algo.cl",
      password: "asdasd",
    },
    {
      name: "test5",
      email: "test5@algo.cl",
      password: "asdasd",
    },
  ],
  user: {
    name: "test6",
    email: "test6@algo.cl",
    password: "asdasd",
  },
  notUsersValues: {
    name: "",
    email: "",
    password: "",
  },
  userUpdate: {
    name: "userUpdate1",
    email: "userUpdate1@algo.cl",
    password: "passEdit",
    confirmPassword: "passEdit",
  },
  posts: [
    {
      description:
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec bibendum nisi eget scelerisque facilisis. Maecenas sodales ante nec lorem hendrerit, pellentesque elementum enim commodo. Class aptent ta",
      thumbnail: "blog1.jpg",
    },
    {
      description:
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec bibendum nisi eget scelerisque facilisis. Maecenas sodales ante nec lorem hendrerit, pellentesque elementum enim commodo. Class aptent t",
      thumbnail: "blog2.jpg",
    },
    {
      description: "Posts de prueba 3",
      thumbnail: "blog3.jpg",
    },
    {
      description: "Posts de prueba 4",
      thumbnail: "blog4.jpg",
    },
    {
      description: "Posts de prueba 5",
      thumbnail: "blog5.jpg",
    },
  ],
};

const registerUsers = async (users) => {
  try {
    for (let i = 0; i < users.length; i++) {
      const res = await api
        .post("/api/auth/signup")
        .set("Accept", "application/json")
        .send(users[i])
        .expect("Content-Type", /json/)
        .expect(200);
      expect(res.body).toHaveProperty("_id");
    }
  } catch (error) {
    console.log(error);
    return error;
  }
};

const registerUser = async (user) => {
  try {
    const res = await api
      .post("/api/auth/signup")
      .set("Accept", "application/json")
      .send(user)
      .expect("Content-Type", /json/)
      .expect(200);
    expect(res.body).toHaveProperty("_id");
  } catch (error) {
    console.log(error);
    return error;
  }
};

const loginUserTrue = async ({ email, password }) => {
  try {
    const res = await api
      .post("/api/auth/signin")
      .set("Accept", "application/json")
      .send({
        email,
        password,
      })
      .expect(200)
      .expect("Content-Type", /json/)
      .expect("set-cookie", /accessToken/);
    return res;
  } catch (error) {
    console.log(error);
    return error;
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
    return error;
  }
};

const getThumbnailsServer = async ({ data }) => {
  try {
    const files = await readdir(join(__dirname, "..", "/uploads/posts"));
    expect(files).toHaveLength(data.length);
  } catch (error) {
    console.log(error);
    return error;
  }
};

const deleteThumbnailsServer = async () => {
  try {
    const thumbnails = await Thumbnail.find();
    for (let i = 0; i < thumbnails.length; i++) {
      await unlink(
        join(__dirname, "..", "uploads/posts", thumbnails[i].thumbnail)
      );
    }
  } catch (error) {
    console.log(error);
  }
};

const deleteAvatarFromServer = async () => {
  try {
    const users = await User.find();
    for (let i = 0; i < users.length; i++) {
      await unlink(join(__dirname, "..", "/uploads/avatar", users[i].avatar));
    }
  } catch (error) {
    console.log(error);
    return error;
  }
};

const logoutUser = async ({ token }) => {
  try {
    const res = await api
      .get("/api/auth/signout")
      .set("Cookie", [`accessToken=${token}`])
      .expect(200);
    expect(
      res.headers["set-cookie"][0].split(";")[0].split("=")[1]
    ).toBeFalsy();
  } catch (error) {
    console.log(error);
    return error;
  }
};

const getAdd = async ({ id, path, token, statusCode }) => {
  try {
    const res = await api
      .get(`${path}/${id}`)
      .set("Cookie", [`accessToken=${token}`])
      .set("Accept", "application/json")
      .expect(statusCode);
  } catch (error) {
    console.log(error);
    return error;
  }
};

const getAddsPosts = async ({ data, path, token, statusCode }) => {
  try {
    const res = await Post.find().populate("thumbnail");
    expect(res).toHaveLength(data.length);
    return res;
  } catch (error) {
    console.log(error);
    return error;
  }
};

//retorna token obtenido desde las cabeceras
const getTokenValue = (header) => {
  const nameToken = header["set-cookie"][0].split(";");
  const token = nameToken[0].split("=")[1];
  return token;
};

//Id object mongo no registrado
const noRegisterId = "5e1a0651741b255ddda996c4";

//Id object mongo no valido
const invalidId = "5e1a0651741b255ddda996c4123abc";

module.exports = {
  data,
  registerUser,
  registerUsers,
  loginUserTrue,
  loginUserFalse,
  logoutUser,
  getThumbnailsServer,
  deleteThumbnailsServer,
  deleteAvatarFromServer,
  getAdd,
  getAddsPosts,
  getTokenValue,
  noRegisterId,
  invalidId,
};
