const mongoose = require("mongoose");
//model
const User = require("../../models/users.model.js");
const Post = require("../../models/posts.model.js");
const Thumbnail = require("../../models/thumbnail.model.js");
//app
const app = require("../../app.js");
//supertest
const request = require("supertest");
const api = request(app);
//path
const { join } = require("path");

//data
const {
  data,
  registerUser,
  loginUserTrue,
  logoutUser,
  deleteThumbnailsServer,
  getTokenValue,
} = require("../utils.js");

const nameToken = "accessToken";
let token;
let userLogged;

beforeAll(() => {
  mongoose
    .connect(process.env.DB_CONN_TEST)
    .then((res) => console.log("connect BD_TEST succeful"))
    .catch((error) => console.log(error));
});

afterAll(() => {
  mongoose.connection.close();
});

//get posts
describe("Get posts", () => {
  beforeAll(async () => {
    await User.deleteMany();
    await registerUser(data.user);
    const loginRes = await loginUserTrue(data.user);
    token = getTokenValue(loginRes.headers);
    userLogged = loginRes.body;

    //agrega post para pruebas
    for (let i = 0; i < data.posts.length; i++) {
      await api
        .post("/api/posts")
        .set("Cookie", [`${nameToken}=${token}`])
        .set("Accept", "application/json")
        .field("description", `${data.posts[i].description}`)
        .attach(
          "thumbnail",
          join(__dirname, "..", "fixture/posts/", data.posts[i].thumbnail)
        )
        .expect(200);
    }
  });

  afterAll(async () => {
    //elimina imagenes de servidor
    await deleteThumbnailsServer();
    //elimina imagens desde BD
    await Thumbnail.deleteMany();
    //elimina posts de bd
    await Post.deleteMany();
    //despues de cada posts agregado se realiza logout
    await logoutUser({ token });
  });

  //busca todos los posts
  test("Should gets all posts", async () => {
    const postsRes = await api
      .get("/api/posts/")
      .set("Cookie", [`${nameToken}=${token}`])
      .set("Accept", "application/json")
      .expect(200);
    expect(postsRes.body).toHaveLength(data.posts.length);
    postsRes.body.forEach((post) => {
      expect(post).toHaveProperty("_id");
      expect(post.author).toHaveProperty("_id", userLogged._id);
      expect(post.author).not.toHaveProperty("password");
      expect(post).toHaveProperty("thumbnail");
      expect(post.thumbnail).toHaveProperty("_id");
      expect(post.thumbnail).toHaveProperty("thumbnail");
    });
  });

  //busca los psots de manera multiple
  test("Should get all posts multiple", async () => {
    for (let i = 0; i < data.posts.length; i++) {
      const postsRes = await api
        .get("/api/posts/")
        .set("Cookie", [`${nameToken}=${token}`])
        .set("Accept", "application/json")
        .expect(200);
      expect(postsRes.body).toHaveLength(data.posts.length);
    }
  });
});

//get posts sin login (token)
describe("Get posts without authentication (out token)", () => {
  afterAll(async () => {
    //elimina imagenes de servidor
    await deleteThumbnailsServer();
    //elimina imagens desde BD
    await Thumbnail.deleteMany();
    //elimina posts de bd
    await Post.deleteMany();
    //despues de cada posts agregado se realiza logout
    await logoutUser({ token });
  });

  test.each(data.posts)(
    "Should add posts for gets",
    async ({ description, thumbnail }) => {
      await api
        .post("/api/posts")
        .set("Cookie", [`${nameToken}=${token}`])
        .set("Accept", "application/json")
        .field("description", `${description}`)
        .attach("thumbnail", join(__dirname, "..", "fixture/posts/", thumbnail))
        .expect(200);
    }
  );

  //prueba de obtener posts sin token de authenticación
  test("Should return 'Invalid Token' message when gets posts without token on request", async () => {
    try {
      const getPostsRes = await api
        .get("/api/posts/")
        .set("accept", "application/json")
        .expect(400);
      expect(getPostsRes.body).toEqual(
        expect.arrayContaining(["Invalid Token"])
      );
    } catch (error) {
      console.log(error);
      return error;
    }
  });
});

//get posts con Token mal formato
describe("Get posts with authentication but empty and bad format token", () => {
  beforeAll(async () => {
    await User.deleteMany();
    await registerUser(data.user);
    const loginRes = await loginUserTrue(data.user);
    token = getTokenValue(loginRes.headers);
    userLogged = loginRes.body;
  });

  test("should return Invalid Token message without token value", async () => {
    const res = await api
      .get(`/api/posts/`)
      .set("Cookie", [`accessToken=`])
      .set("Accept", "application/json")
      .expect(400);
    expect(res.body).toEqual(expect.arrayContaining(["Invalid Token"]));
    expect(res.body).not.toHaveProperty("_id");
  });

  test("should return Invalid Token message with invalid token name", async () => {
    const res = await api
      .get(`/api/posts/`)
      .set("Cookie", [`access=${token}`])
      .set("Accept", "application/json")
      .expect(400);
    expect(res.body).toEqual(expect.arrayContaining(["Invalid Token"]));
    expect(res.body).not.toHaveProperty("_id");
  });

  test("should return Invalid Token message with bad format token", async () => {
    const res = await api
      .get(`/api/posts/`)
      .set("Cookie", [`accessToken=${token + "asdasdAlan"}`])
      .set("Accept", "application/json")
      .expect(404);
    expect(res.body).toEqual(expect.arrayContaining(["invalid signature"]));
    expect(res.body).not.toHaveProperty("_id");
  });
});
