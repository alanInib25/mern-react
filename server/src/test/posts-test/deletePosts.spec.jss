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

//Delete posts
describe("Delete posts by id (/api/posts/$id)", () => {
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

  afterEach(async () => {
    //validacion de descuentos de posts en usuario total
    const user = await User.findById(userLogged._id);
    expect(user.posts).toEqual(0);
    //Valida posts agregados a db
    const postsRes = await Post.find();
    expect(postsRes).toHaveLength(0);
    //valida thumbnail agregados a db
    const thumbRes = await Thumbnail.find();
    expect(thumbRes).toHaveLength(0);
    //valida thumbnails agregados a server
    const files = await readdir(join(__dirname, "../../", "uploads/posts"));
    expect(files).toHaveLength(0);
  });

  afterAll(async () => {
    //despues de cada posts agregado se realiza logout
    await logoutUser({ token });
    await User.deleteMany();
  });

  //prueba de eliminacion de post por id de forma multiple
  test("Should delete posts by id multiple", async () => {
    const posts = await Post.find();
    for (let i = 0; i < posts.length; i++) {
      const delRes = await api
        .delete(`/api/posts/${posts[i]._id}`)
        .set("Cookie", [`${nameToken}=${token}`])
        .set("Accept", "application/json")
        .expect(200);
      expect(delRes.body).toEqual(
        expect.arrayContaining([`Post deleted successfull`])
      );
      //validacion de eliminacion
      const postsRes = await Post.find();
      expect(postsRes.length).toEqual(posts.length - (i + 1));
      //validacion de descuentos de posts en usuario
      const user = await User.findById(userLogged._id);
      expect(user.posts).toEqual(data.posts.length - (i + 1));
      //valida thumbnails agregados a server
      const files = await readdir(join(__dirname, "../../", "uploads/posts"));
      expect(files).toHaveLength(data.posts.length - (i + 1));
    }
  });
});

describe("Delete posts with bad format id", () => {
  beforeAll(async () => {
    await User.deleteMany();
    await registerUser(data.user);
    const loginRes = await loginUserTrue(data.user);
    userLogged = loginRes.body;
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

  afterEach(async () => {
    const posts = await Post.find();
    //validacion de descuentos de posts en usuario total
    const user = await User.findById(userLogged._id);
    expect(user.posts).toEqual(posts.length);
    //Valida posts agregados a db
    const postsRes = await Post.find();
    expect(postsRes).toHaveLength(posts.length);
    //valida thumbnail agregados a db
    const thumbRes = await Thumbnail.find();
    expect(thumbRes).toHaveLength(posts.length);
    //valida thumbnails agregados a server
    const files = await readdir(join(__dirname, "../../", "uploads/posts"));
    expect(files).toHaveLength(posts.length);
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

  test("Should return 'Invalid Id' message when delete with bad format id", async () => {
    const posts = await Post.find();
    for (let i = 0; i < posts.length; i++) {
      const res = await api
        .delete(`/api/posts/${invalidId}`)
        .set("Cookie", [`${nameToken}=${token}`])
        .set("Accpet", "application/json")
        .expect(400);
      expect(res.body).toEqual(expect.arrayContaining(["Invalid Id"]));
    }
  });
});

//Delete posts por id sin token de auth
describe("Delete post without auth token", () => {
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

  afterEach(async () => {
    const posts = await Post.find();
    //validacion de descuentos de posts en usuario total
    const user = await User.findById(userLogged._id);
    expect(user.posts).toEqual(posts.length);
    //Valida posts agregados a db
    const postsRes = await Post.find();
    expect(postsRes).toHaveLength(posts.length);
    //valida thumbnail agregados a db
    const thumbRes = await Thumbnail.find();
    expect(thumbRes).toHaveLength(posts.length);
    //valida thumbnails agregados a server
    const files = await readdir(join(__dirname, "../../", "uploads/posts"));
    expect(files).toHaveLength(posts.length);
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

  test("Should return 'Invalid token' message when delete without auth token", async () => {
    const posts = await Post.find();
    for (let i = 0; i < posts.length; i++) {
      const delRes = await api
        .delete(`/api/posts/${posts[i]._id}`)
        .set("Accept", "application/json")
        .expect(400);
      expect(delRes.body).toEqual(expect.arrayContaining(["Invalid Token"]));
    }
  });
});

//Solicitud get posts por id token mal formato
describe("Delete post with authentication but empty and bad format token", () => {
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

  afterEach(async () => {
    const posts = await Post.find();
    //validacion de descuentos de posts en usuario total
    const user = await User.findById(userLogged._id);
    expect(user.posts).toEqual(posts.length);
    //Valida posts agregados a db
    const postsRes = await Post.find();
    expect(postsRes).toHaveLength(posts.length);
    //valida thumbnail agregados a db
    const thumbRes = await Thumbnail.find();
    expect(thumbRes).toHaveLength(posts.length);
    //valida thumbnails agregados a server
    const files = await readdir(join(__dirname, "../../", "uploads/posts"));
    expect(files).toHaveLength(posts.length);
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

  test("should return Invalid Token message without token value", async () => {
    const posts = await Post.find();
    for (let i = 0; i < posts.length; i++) {
      const res = await api
        .delete(`/api/posts/${posts[i]._id}`)
        .set("Accept", "application/json")
        .set("Cookie", [`${nameToken}=`])
        .expect(400);
      expect(res.body).toEqual(expect.arrayContaining(["Invalid Token"]));
    }
  });

  test("should return Invalid Token message with invalid token name", async () => {
    const posts = await Post.find();
    for (let i = 0; i < posts.length; i++) {
      const res = await api
        .delete(`/api/posts/${posts[i]._id}`)
        .set("Cookie", [`access=${token}`])
        .set("Accept", "application/json")
        .expect(400);
      expect(res.body).toEqual(expect.arrayContaining(["Invalid Token"]));
    }
  });

  test("should return Invalid Token message with bad format token", async () => {
    const posts = await Post.find();
    for (let i = 0; i < posts.length; i++) {
      const res = await api
        .delete(`/api/posts/${posts[i]._id}`)
        .set("Cookie", [`${nameToken}=${token + "asdasdAlan"}`])
        .set("Accept", "application/json")
        .expect(404);
      expect(res.body).toEqual(expect.arrayContaining(["invalid signature"]));
    }
  });
});

//get post no registrado
describe("Delete post by id not registered", () => {
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

  afterEach(async () => {
    const posts = await Post.find();
    //validacion de descuentos de posts en usuario total
    const user = await User.findById(userLogged._id);
    expect(user.posts).toEqual(posts.length);
    //Valida posts agregados a db
    const postsRes = await Post.find();
    expect(postsRes).toHaveLength(posts.length);
    //valida thumbnail agregados a db
    const thumbRes = await Thumbnail.find();
    expect(thumbRes).toHaveLength(posts.length);
    //valida thumbnails agregados a server
    const files = await readdir(join(__dirname, "../../", "uploads/posts"));
    expect(files).toHaveLength(posts.length);
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

  test("Should return message 'Post not found' when get post not registered", async () => {
    const res = await api
      .delete(`/api/posts/${noRegisterId}`)
      .set("Cookie", [`${nameToken}=${token}`])
      .set("Accept", "application/json")
      .expect(400);
    expect(res.body).toEqual(expect.arrayContaining(["Post not found"]));
  });
});
