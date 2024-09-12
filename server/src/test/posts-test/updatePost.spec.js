//mongoose
const mongoose = require("mongoose");
//supertest
const request = require("supertest");
//app
const app = require("../../app.js");
//api
const api = request(app);
//models
const User = require("../../models/users.model.js");
const Post = require("../../models/posts.model.js");
const Thumbnail = require("../../models/thumbnail.model.js");
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
  //bd connect
  mongoose
    .connect(process.env.DB_CONN_TEST)
    .then((res) => console.log("connect BD_TEST succeful"))
    .catch((error) => console.log(error));
});

afterAll(async () => {
  await mongoose.connection.close();
});

//Actualizacion de posts (pruebas positivas)
describe("Update post by id", () => {
  beforeAll(async () => {
    await User.deleteMany();
    await registerUser(data.user);
    const loginRes = await loginUserTrue(data.user);
    userLogged = loginRes.body;
    token = getTokenValue(loginRes.headers);
  });

  beforeEach(async () => {
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
    //elimina imagenes de servidor
    await deleteThumbnailsServer();
    //elimina imagens desde BD
    await Thumbnail.deleteMany();
    //elimina posts de bd
    await Post.deleteMany();
  });

  afterAll(async () => {
    await User.deleteMany();
  });

  //actualiza post con thumbnail y descripción
  test("Should update a post by id with thumbnail and description", async () => {
    const posts = await Post.find();
    const thumbnailRes = await Thumbnail.findById(posts[0].thumbnail);
    const updateRes = await api
      .patch(`/api/posts/${posts[0]._id}`)
      .set("Cookie", [`${nameToken}=${token}`])
      .set("Accept", "application/json")
      .field("description", `new description updated`)
      .attach(
        "thumbnail",
        join(__dirname, "..", "fixture/posts/", "blog1-update.jpg")
      )
      .expect(200);
    expect(updateRes.body).toHaveProperty("_id");
    expect(updateRes.body).toHaveProperty(
      "description",
      `new description updated`
    );
    expect(updateRes.body.description).not.toEqual(posts[0].description);
    expect(updateRes.body.thumbnail.thumbnail).not.toEqual(
      thumbnailRes.thumbnail
    );
    expect(updateRes.body.thumbnail).toHaveProperty("name", "blog1-update.jpg");
    expect(updateRes.body.author).toHaveProperty("_id", userLogged._id);
    expect(updateRes.body.author).toHaveProperty("email", userLogged.email);
  });

  //actualiza post solo con description
  test("Should update a post by id only description", async () => {
    const posts = await Post.find();
    const thumbnailRes = await Thumbnail.findById(posts[0].thumbnail);
    const updateRes = await api
      .patch(`/api/posts/${posts[0]._id}`)
      .set("Cookie", [`${nameToken}=${token}`])
      .set("Accept", "application/json")
      .field("description", `new description updated`)
      .expect(200);
    expect(updateRes.body).toHaveProperty("_id");
    expect(updateRes.body).toHaveProperty(
      "description",
      `new description updated`
    );
    expect(updateRes.body.description).not.toEqual(posts[0].description);
    expect(updateRes.body.thumbnail.thumbnail).toEqual(thumbnailRes.thumbnail);
    expect(updateRes.body.thumbnail).toHaveProperty("name", thumbnailRes.name);
    expect(updateRes.body.author).toHaveProperty("_id", userLogged._id);
    expect(updateRes.body.author).toHaveProperty("email", userLogged.email);
  });
});

//Actualiza post description y thumbnail con distintos usuarios
describe.each(data.users)("Update posts multiuser, user: $name", (user) => {
  beforeAll(async () => {
    await User.deleteMany();
    await registerUser(user);
    const loginRes = await loginUserTrue(user);
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
    //Valida posts agregados a db(por length) por usuario
    const postsRes = await Post.find({ author: userLogged._id });
    expect(postsRes).toHaveLength(data.posts.length);
    postsRes.forEach((post) => {
      expect(post.author.toString()).toEqual(userLogged._id);
    });

    //valida thumbnails agregados a db(por length) por usuario
    const thumRes = await Thumbnail.find({ creator: userLogged._id });
    expect(thumRes).toHaveLength(data.posts.length);

    //valida conteo de posts del usuario
    const userRes = await User.findById(userLogged._id);
    expect(userRes).toHaveProperty("posts", data.posts.length);

    //valida thumbnails agregados a server (por length) por usuario
    const files = await readdir(join(__dirname, "../../", "uploads/posts"));
    expect(files).toHaveLength(data.posts.length);
  });

  afterAll(async () => {
    //elimina imagenes de servidor
    await deleteThumbnailsServer();
    //elimina imagens desde BD
    await Thumbnail.deleteMany();
    //elimina posts de bd
    await Post.deleteMany();
  });

  test(`Should Update posts`, async () => {
    const posts = await Post.find();
    const thumbnailRes = await Thumbnail.findById(posts[0].thumbnail);
    for (let i = 0; i < posts.length; i++) {
      try {
        const res = await api
          .patch(`/api/posts/${posts[i]._id}`)
          .set("Accpet", "application/json")
          .set("Cookie", [`accessToken=${token}`])
          .field("description", `UPDATED new posts n°: ${i + 1}`)
          .attach(
            "thumbnail",
            join(__dirname, "..", "/fixture/posts", `blog${i + 1}-update.jpg`)
          )
          .expect(200)
          .expect("Content-type", /json/);
        expect(res.body).toHaveProperty("_id");
        expect(res.body).toHaveProperty(
          "description",
          `UPDATED new posts n°: ${i + 1}`
        );
        expect(res.body.description).not.toEqual(posts[0].description);
        expect(res.body.thumbnail.thumbnail).not.toEqual(
          thumbnailRes.thumbnail
        );
        expect(res.body.thumbnail).toHaveProperty(
          "name",
          `blog${i + 1}-update.jpg`
        );
        expect(res.body.author).toHaveProperty("_id", userLogged._id);
        expect(res.body.author).toHaveProperty("email", userLogged.email);
      } catch (error) {
        console.log(error);
        return error;
      }
    }
  });
});

//Actualiza post solo description con distintos usuarios
describe.each(data.users)("Update posts multiuser, user: $name", (user) => {
  beforeAll(async () => {
    await User.deleteMany();
    await registerUser(user);
    const loginRes = await loginUserTrue(user);
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
    //Valida posts agregados a db(por length) por usuario
    const postsRes = await Post.find({ author: userLogged._id });
    expect(postsRes).toHaveLength(data.posts.length);
    postsRes.forEach((post) => {
      expect(post.author.toString()).toEqual(userLogged._id);
    });

    //valida thumbnails agregados a db(por length) por usuario
    const thumRes = await Thumbnail.find({ creator: userLogged._id });
    expect(thumRes).toHaveLength(data.posts.length);

    //valida conteo de posts del usuario
    const userRes = await User.findById(userLogged._id);
    expect(userRes).toHaveProperty("posts", data.posts.length);

    //valida thumbnails agregados a server (por length) por usuario
    const files = await readdir(join(__dirname, "../../", "uploads/posts"));
    expect(files).toHaveLength(data.posts.length);
  });

  afterAll(async () => {
    //elimina imagenes de servidor
    await deleteThumbnailsServer();
    //elimina imagens desde BD
    await Thumbnail.deleteMany();
    //elimina posts de bd
    await Post.deleteMany();
  });

  test(`Should Update posts`, async () => {
    const posts = await Post.find();
    for (let i = 0; i < posts.length; i++) {
      const thumbnailRes = await Thumbnail.findById(posts[i].thumbnail);
      try {
        const updateRes = await api
          .patch(`/api/posts/${posts[i]._id}`)
          .set("Accpet", "application/json")
          .set("Cookie", [`accessToken=${token}`])
          .field("description", `UPDATED new posts n°: ${i + 1}`)
          .expect(200)
          .expect("Content-type", /json/);
        expect(updateRes.body).toHaveProperty("_id");
        expect(updateRes.body).toHaveProperty(
          "description",
          `UPDATED new posts n°: ${i + 1}`
        );
        expect(updateRes.body.description).not.toEqual(posts[0].description);
        expect(updateRes.body.thumbnail.thumbnail).toEqual(
          thumbnailRes.thumbnail
        );
        expect(updateRes.body.thumbnail).toHaveProperty(
          "name",
          thumbnailRes.name
        );
        expect(updateRes.body.author).toHaveProperty("_id", userLogged._id);
        expect(updateRes.body.author).toHaveProperty("email", userLogged.email);
      } catch (error) {
        return error;
      }
    }
  });
});

//Actualiza posts con campos vacios
describe("Update posts with empty requires fields", () => {
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
  });

  //datos vacios
  test("should return 'Invalid description, 200 character max.' and 400 status code sending all data empty", async () => {
    const posts = await Post.find().populate("thumbnail");
    for (let i = 0; i < posts.length; i++) {
      try {
        const res = await api
          .patch(`/api/posts/${posts[i]._id}`)
          .set("Accept", "application/json")
          .set("Cookie", [`${nameToken}=${token}`])
          .field("", "")
          .attach()
          .expect(400);
        expect(res.body).toEqual(
          expect.arrayContaining(["Invalid description, 200 character max."])
        );
        //validar que no se generaron cambios en el post original
        const post = await Post.findById(posts[i]._id).populate("thumbnail");
        expect(post).toHaveProperty("description", posts[i].description);
        expect(post.thumbnail).toHaveProperty("name", posts[i].thumbnail.name);
      } catch (error) {
        return error;
      }
    }
  });

  //solo keys y values vacios
  test("should return 'Invalid description, 200 character max.' and 400 status code sending only keys", async () => {
    const posts = await Post.find().populate("thumbnail");
    for (let i = 0; i < posts.length; i++) {
      try {
        const res = await api
          .patch(`/api/posts/${posts[i]._id}`)
          .set("Accept", "application/json")
          .set("Cookie", [`${nameToken}=${token}`])
          .field("description")
          .attach("thumbnail")
          .expect(400);
        expect(res.body).toEqual(
          expect.arrayContaining(["Invalid description, 200 character max."])
        );
        //validar que no se generaron cambios en el post original
        const post = await Post.findById(posts[i]._id).populate("thumbnail");
        expect(post).toHaveProperty("description", posts[i].description);
        expect(post.thumbnail).toHaveProperty("name", posts[i].thumbnail.name);
      } catch (error) {
        return error;
      }
    }
  });

  //solo thumbnail
  test("should return 'Invalid description, 200 character max.' and 400 status code sending only thumbnail", async () => {
    const posts = await Post.find().populate("thumbnail");
    for (let i = 0; i < posts.length; i++) {
      try {
        const res = await api
          .patch(`/api/posts/${posts[i]}`)
          .set("Accept", "application/json")
          .set("Cookie", [`${nameToken}=${token}`])
          .field("description")
          .attach(
            "thumbnail",
            join(__dirname, "..", "fixture/posts", `blog${i + 1}-update.jpg`)
          )
          .expect(400);
        expect(res.body).toEqual(
          expect.arrayContaining(["Invalid description, 200 character max."])
        );
        //validar que no se generaron cambios en el post original
        const post = await Post.findById(posts[i]._id).populate("thumbnail");
        expect(post).toHaveProperty("description", posts[i].description);
        expect(post.thumbnail).toHaveProperty("name", posts[i].thumbnail.name);
      } catch (error) {
        return error;
      }
    }
  });
});

//validaciones con data invalida
describe("Update posts with invalid data", () => {
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
    //elimina imagenes de servidor
    await deleteThumbnailsServer();
    //elimina imagens desde BD
    await Thumbnail.deleteMany();
    //elimina posts de bd
    await Post.deleteMany();
  });

  //Validacion de description con mas de 200 characteres de largo
  test("Should return 'Invalid description, 200 character max.' and 400 status code sending description 201 chacracteres length", async () => {
    const posts = await Post.find().populate("thumbnail");
    for (let i = 0; i < posts.length; i++) {
      const res = await api
        .patch(`/api/posts/${posts[i]._id}`)
        .set("Accept", "application/json")
        .set("Cookie", [`${nameToken}=${token}`])
        .field(
          "description",
          "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec bibendum nisi eget scelerisque facilisis. Maecenas sodales ante nec lorem hendrerit, pellentesque elementum enim commodo. Class aptent taa"
        )
        .attach(
          "thumbnail",
          join(__dirname, "..", "fixture/posts", `blog${i + 1}-update.jpg`)
        )
        .expect(400);
      expect(res.body).toEqual(
        expect.arrayContaining(["Invalid description, 200 character max."])
      );
      //validar que no se generaron cambios en el post original
      const post = await Post.findById(posts[i]._id).populate("thumbnail");
      expect(post).toHaveProperty("description", posts[i].description);
      expect(post.thumbnail).toHaveProperty("name", posts[i].thumbnail.name);
    }
  });

  //Validacion de thumbnail, thumbnail mayor 2mb de tamaño
  test("Should return 'Upload file less than 2mb. (2000000 bytes)' and 400 status code sending thumbnail with size > 2mb", async () => {
    const posts = await Post.find().populate("thumbnail");
    for (let i = 0; i < posts.length; i++) {
      const res = await api
        .patch(`/api/posts/${posts[i]._id}`)
        .set("Accept", "application/json")
        .set("Cookie", [`${nameToken}=${token}`])
        .field(
          "description",
          "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec bibendum nisi eget scelerisque facilisis. Maecenas sodales ante nec lorem hendrerit, pellentesque elementum enim commodo. Class aptent ta"
        )
        .attach(
          "thumbnail",
          join(__dirname, "..", "fixture/posts/", "3172kb.jpg")
        )
        .expect(400);
      expect(res.body).toEqual(
        expect.arrayContaining(["Upload file less than 2mb. (2000000 bytes)"])
      );
      //validar que no se generaron cambios en el post original
      const post = await Post.findById(posts[i]._id).populate("thumbnail");
      expect(post).toHaveProperty("description", posts[i].description);
      expect(post.thumbnail).toHaveProperty("name", posts[i].thumbnail.name);
    }
  });

  //Validacion de formato de thumbnail, solamente: .jpg, .png, .jpeg
  test("Should return 'Format thumbnail must be .jpg, .png, .jpeg' and 400 status code sending thumbnail with size > 2mb", async () => {
    const posts = await Post.find().populate("thumbnail");
    for (let i = 0; i < posts.length; i++) {
      const res = await api
        .patch(`/api/posts/${posts[i]._id}`)
        .set("Accept", "application/json")
        .set("Cookie", [`${nameToken}=${token}`])
        .field(
          "description",
          "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec bibendum nisi eget scelerisque facilisis. Maecenas sodales ante nec lorem hendrerit, pellentesque elementum enim commodo. Class aptent ta"
        )
        .attach(
          "thumbnail",
          join(__dirname, "..", "fixture/posts/", "test.txt")
        )
        .expect(400);
      expect(res.body).toEqual(
        expect.arrayContaining(["Format thumbnail must be .jpg, .png, .jpeg"])
      );
      //validar que no se generaron cambios en el post original
      const post = await Post.findById(posts[i]._id).populate("thumbnail");
      expect(post).toHaveProperty("description", posts[i].description);
      expect(post.thumbnail).toHaveProperty("name", posts[i].thumbnail.name);
    }
  });
});

//Validacion get post con id mal formato
describe("Update post by id with bad format id", () => {
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

  test("Should return 'Invalid Id' message when update with bad format id", async () => {
    const posts = await Post.find().populate("thumbnail");
    for (let i = 0; i < posts.length; i++) {
      const res = await api
        .patch(`/api/posts/${invalidId}`)
        .set("Cookie", [`${nameToken}=${token}`])
        .set("Accept", "application/json")
        .field("description", `UPDATED new posts n°: ${i + 1}`)
        .attach(
          "thumbnail",
          join(__dirname, "..", "/fixture/posts", `blog${i + 1}-update.jpg`)
        )
        .expect(400);
      expect(res.body).toEqual(expect.arrayContaining(["Invalid Id"]));
      //validar que no se generaron cambios en el post original
      const post = await Post.findById(posts[i]._id).populate("thumbnail");
      expect(post).toHaveProperty("description", posts[i].description);
      expect(post.thumbnail).toHaveProperty("name", posts[i].thumbnail.name);
    }
  });
});

//Validacion Solicitud get posts por id, token mal formato y vacio
describe("Update post with empty and bad format token", () => {
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

  test("should return Invalid Token message without token value request", async () => {
    const posts = await Post.find().populate("thumbnail");
    for (let i = 0; i < posts.length; i++) {
      const res = await api
        .patch(`/api/posts/${posts[i]._id}`)
        .set("Cookie", [`${nameToken}=`])
        .set("Accept", "application/json")
        .field("description", `UPDATED new posts n°: ${i + 1}`)
        .attach(
          "thumbnail",
          join(__dirname, "..", "/fixture/posts", `blog${i + 1}-update.jpg`)
        )
        .expect(400);
      expect(res.body).toEqual(expect.arrayContaining(["Invalid Token"]));
      expect(res.body).not.toHaveProperty("_id");
      //validar que no se generaron cambios en el post original
      const post = await Post.findById(posts[i]._id).populate("thumbnail");
      expect(post).toHaveProperty("description", posts[i].description);
      expect(post.thumbnail).toHaveProperty("name", posts[i].thumbnail.name);
    }
  });

  test("should return Invalid Token message with invalid token name request", async () => {
    const posts = await Post.find().populate("thumbnail");
    for (let i = 0; i < posts.length; i++) {
      const res = await api
        .patch(`/api/posts/${posts[i]._id}`)
        .set("Cookie", [`access=${token}`])
        .set("Accept", "application/json")
        .expect(400);
      expect(res.body).toEqual(expect.arrayContaining(["Invalid Token"]));
      expect(res.body).not.toHaveProperty("_id");
      //validar que no se generaron cambios en el post original
      const post = await Post.findById(posts[i]._id).populate("thumbnail");
      expect(post).toHaveProperty("description", posts[i].description);
      expect(post.thumbnail).toHaveProperty("name", posts[i].thumbnail.name);
    }
  });

  test("should return Invalid Token message with bad format token request", async () => {
    const posts = await Post.find().populate("thumbnail");
    for (let i = 0; i < posts.length; i++) {
      const res = await api
        .patch(`/api/posts/${posts[0]._id}`)
        .set("Cookie", [`${nameToken}=${token + "asdasdAlan"}`])
        .set("Accept", "application/json")
        .expect(404);
      expect(res.body).toEqual(expect.arrayContaining(["invalid signature"]));
      expect(res.body).not.toHaveProperty("_id");
      //validar que no se generaron cambios en el post original
      const post = await Post.findById(posts[i]._id).populate("thumbnail");
      expect(post).toHaveProperty("description", posts[i].description);
      expect(post.thumbnail).toHaveProperty("name", posts[i].thumbnail.name);
    }
  });
});

//Validacion actualizar post no registrado
describe("Update post not registered", () => {
  beforeAll(async () => {
    await User.deleteMany();
    await registerUser(data.user);
    const loginRes = await loginUserTrue(data.user);
    token = getTokenValue(loginRes.headers);
    userLogged = loginRes.body;
  });

  test("Should return message 'Post not found' when get post not registered", async () => {
    const res = await api
      .patch(`/api/posts/${noRegisterId}`)
      .set("Cookie", [`${nameToken}=${token}`])
      .set("Accept", "application/json")
      .expect(400);
    expect(res.body).toEqual(expect.arrayContaining(["Post not found"]));
  });
});
