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
//fs
const { readdir } = require("node:fs/promises");
//data
const {
  data,
  registerUser,
  loginUserTrue,
  logoutUser,
  deleteThumbnailsServer,
  getTokenValue,
  noRegisterId,
  invalidId,
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

//get post
describe("Get post for id (/api/posts/$id)", () => {
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
    await User.deleteMany();
  });

  //busca un post
  test("Should get post by id", async () => {
    const post = await Post.findOne({ description: data.posts[0].description });
    const getRes = await api
      .get(`/api/posts/${post._id}`)
      .set("Cookie", [`${nameToken}=${token}`])
      .set("Accept", "application/json")
      .expect(200);
    expect(getRes.body).toHaveProperty("_id", post._id.toString());
    expect(getRes.body).toHaveProperty("description", post.description);
    expect(getRes.body).toHaveProperty(
      "description",
      data.posts[0].description
    );
    expect(getRes.body.author).toHaveProperty("_id", post.author.toString());
    expect(getRes.body.author).not.toHaveProperty("password");
    expect(getRes.body.author).toHaveProperty("name", data.user.name);
    expect(getRes.body.thumbnail).toHaveProperty(
      "name",
      data.posts[0].thumbnail
    );
  });

  //busca posts multiples
  test("Get post by id multiple", async () => {
    //posts desde db (obtener _id)
    const posts = await Post.find();
    for (let i = 0; i < posts.length; i++) {
      const getRes = await api
        .get(`/api/posts/${posts[i]._id}`)
        .set("Cookie", [`${nameToken}=${token}`])
        .set("Accept", "application/json")
        .expect(200);
      expect(getRes.body).toHaveProperty("_id", posts[i]._id.toString());
      expect(getRes.body).toHaveProperty("description", posts[i].description);
      expect(getRes.body.author).toHaveProperty(
        "_id",
        posts[i].author.toString()
      );
      expect(getRes.body.author).not.toHaveProperty("password");
      expect(getRes.body.author).toHaveProperty("name", data.user.name);
      expect(getRes.body.thumbnail).toHaveProperty(
        "name",
        data.posts[i].thumbnail
      );
    }
  });
});

//get post con id mal formato
describe("Get posts with bad format id", () => {
  beforeAll(async () => {
    await User.deleteMany();
    await registerUser(data.user);
    const loginRes = await loginUserTrue(data.user);
    token = getTokenValue(loginRes.headers);

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
    //Verifica posts
    const posts = await Post.find();
    expect(posts).toHaveLength(data.posts.length);
    //verifica que no se eliminaron thumbnails
    const thumbnails = await Thumbnail.find();
    expect(thumbnails).toHaveLength(data.posts.length);
    //elimina imagenes de servidor
    await deleteThumbnailsServer();
    //elimina imagens desde BD
    await Thumbnail.deleteMany();
    //elimina posts de bd
    await Post.deleteMany();
    //despues de cada posts agregado se realiza logout
    await logoutUser({ token });
  });

  test("Should return 'Invalid Id' message when delete with bad format id", async () => {
    const posts = await Post.find();
    for (let i = 0; i < posts.length; i++) {
      const res = await api
        .get(`/api/posts/${invalidId}`)
        .set("Cookie", [`${nameToken}=${token}`])
        .set("Accpet", "application/json")
        .expect(400);
      expect(res.body).toEqual(expect.arrayContaining(["Invalid Id"]));
    }
  });
});

//Solicitud get posts por id, token mal formato y vacio
describe("Get post with authentication but empty and bad format token", () => {
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
      .set("Cookie", [`${nameToken}=`])
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
      .set("Cookie", [`${nameToken}=${token + "asdasdAlan"}`])
      .set("Accept", "application/json")
      .expect(404);
    expect(res.body).toEqual(expect.arrayContaining(["invalid signature"]));
    expect(res.body).not.toHaveProperty("_id");
  });
});

//get post no registrado
describe("Get post not registered", () => {
  beforeAll(async () => {
    await User.deleteMany();
    await registerUser(data.user);
    const loginRes = await loginUserTrue(data.user);
    token = getTokenValue(loginRes.headers);
    userLogged = loginRes.body;
  });

  test("Should return message 'Post not found' when get post not registered", async () => {
    const res = await api
      .get(`/api/posts/${noRegisterId}`)
      .set("Cookie", [`${nameToken}=${token}`])
      .set("Accept", "application/json")
      .expect(400);
    expect(res.body).toEqual(expect.arrayContaining(["Post not found"]));
  });
});
