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

//agrega post
describe("Add posts", () => {
  beforeAll(async () => {
    //elimina usuarios
    await User.deleteMany();
    //crea usuario
    await registerUser(data.user);
    //login de usuario creado
    const loginRes = await loginUserTrue(data.user);
    userLogged = loginRes.body;
    token = getTokenValue(loginRes.headers);
  });

  afterEach(async () => {
    //Valida posts agregados a db(por length)
    const postsRes = await Post.find();
    expect(postsRes).toHaveLength(data.posts.length);
    postsRes.forEach((post) => {
      expect(post.author.toString()).toEqual(userLogged._id);
    });

    //valida conteo de posts del usuario
    const userRes = await User.findById(userLogged._id);
    expect(userRes).toHaveProperty("posts", data.posts.length);

    //valida thumbnails agregados a db(por length)
    const thumRes = await Thumbnail.find();
    expect(thumRes).toHaveLength(data.posts.length);

    //valida thumbnails agregados a server (por length)
    const files = await readdir(join(__dirname, "../../", "uploads/posts"));
    expect(files).toHaveLength(data.posts.length);
  });

  afterAll(async () => {
    //elimina thumbnail de servidor
    await deleteThumbnailsServer();
    //elimina imagens desde BD
    await Thumbnail.deleteMany();
    //elimina posts de bd
    await Post.deleteMany();
    //despues de cada posts agregado se realiza logout
    await logoutUser({ token });
  });

  test("Should add post", async () => {
    for (let i = 0; i < data.posts.length; i++) {
      const res = await api
        .post("/api/posts")
        .set("Cookie", [`${nameToken}=${token}`])
        .set("Accept", "application/json")
        .field("description", `${data.posts[i].description}`)
        .attach(
          "thumbnail",
          join(__dirname, "..", "fixture/posts/", data.posts[i].thumbnail)
        )
        .expect(200)
        .expect("Content-type", /json/);
      expect(res.body).toHaveProperty("_id");
      expect(res.body.author).toHaveProperty("_id", userLogged._id);
      expect(res.body.author).toHaveProperty("name", userLogged.name);
      expect(res.body.author).toHaveProperty("email", userLogged.email);
      expect(res.body.thumbnail).toHaveProperty("_id");
      expect(res.body.thumbnail).toHaveProperty(
        "name",
        data.posts[i].thumbnail
      );
      expect(res.body).toHaveProperty(
        "description",
        `${data.posts[i].description}`
      );
    }
  });
});

//agrega posts multiusuario
describe.each(data.users)("Add posts multiuser, user: $name", (user) => {
  beforeAll(async () => {
    /* await User.deleteMany(); */
    await registerUser(user);
    const loginRes = await loginUserTrue(user);
    token = getTokenValue(loginRes.headers);
    userLogged = loginRes.body;
  });

  afterEach(async () => {
    //Valida posts agregados a db(por length)
    const postsRes = await Post.find();
    expect(postsRes).toHaveLength(data.posts.length);
    postsRes.forEach((post) => {
      expect(post.author.toString()).toEqual(userLogged._id);
    });

    //valida conteo de posts del usuario
    const userRes = await User.findById(userLogged._id);
    expect(userRes).toHaveProperty("posts", data.posts.length);

    //valida thumbnails agregados a db(por length)
    const thumRes = await Thumbnail.find();
    expect(thumRes).toHaveLength(data.posts.length);

    //valida thumbnails agregados a server (por length)
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

  test("Should add post multiusuario", async () => {
    for (let i = 0; i < data.posts.length; i++) {
      const res = await api
        .post("/api/posts")
        .set("Cookie", [`${nameToken}=${token}`])
        .set("Accept", "application/json")
        .field("description", `${data.posts[i].description}`)
        .attach(
          "thumbnail",
          join(__dirname, "..", "fixture/posts/", data.posts[i].thumbnail)
        )
        .expect(200)
        .expect("Content-type", /json/);
      expect(res.body).toHaveProperty("_id");
      expect(res.body.author).toHaveProperty("_id", userLogged._id);
      expect(res.body.author).toHaveProperty("name", userLogged.name);
      expect(res.body.author).toHaveProperty("email", userLogged.email);
      expect(res.body.thumbnail).toHaveProperty("_id");
      expect(res.body.thumbnail).toHaveProperty(
        "name",
        data.posts[i].thumbnail
      );
      expect(res.body).toHaveProperty(
        "description",
        `${data.posts[i].description}`
      );
    }
  });
});

//Envio posts con capos vacios
describe("Add posts with empty requires fields", () => {
  beforeAll(async () => {
    await User.deleteMany();
    await registerUser(data.user);
    const loginRes = await loginUserTrue(data.user);
    token = getTokenValue(loginRes.headers);
    userLogged = loginRes.body;
  });

  afterAll(async () => {
    //Valida posts agregados a db(por length)
    const postsRes = await Post.find();
    expect(postsRes).toHaveLength(0);
    //valida thumbnails agregados a server (por length)
    const files = await readdir(join(__dirname, "../../", "uploads/posts"));
    expect(files).toHaveLength(0);
  });

  //datos vacios
  test.each(data.posts)(
    "should return 'Invalid description, 200 character max.' and 400 status code sending all data empty",
    async () => {
      try {
        const res = await api
          .post("/api/posts/")
          .set("Accept", "application/json")
          .set("Cookie", [`${nameToken}=${token}`])
          .field("", "")
          .attach()
          .expect(400);
        expect(res.body).toEqual(
          expect.arrayContaining(["Invalid description, 200 character max."])
        );
      } catch (error) {
        return error;
      }
    }
  );

  //solo keys y values vacios
  test.each(data.posts)(
    "should return 'Invalid description, 200 character max.' and 400 status code sending only keys",
    async () => {
      try {
        const res = await api
          .post("/api/posts/")
          .set("Accept", "application/json")
          .set("Cookie", [`${nameToken}=${token}`])
          .field("description")
          .attach("thumbnail")
          .expect(400);
        expect(res.body).toEqual(
          expect.arrayContaining(["Invalid description, 200 character max."])
        );
      } catch (error) {
        return error;
      }
    }
  );

  //solo thumbnail
  test.each(data.posts)(
    "should return 'Invalid description, 200 character max.' and 400 status code sending only thumbnail",
    async ({ thumbnail }) => {
      try {
        const res = await api
          .post("/api/posts/")
          .set("Accept", "application/json")
          .set("Cookie", [`${nameToken}=${token}`])
          .field("description")
          .attach(
            "thumbnail",
            join(__dirname, "..", "fixture/posts/", thumbnail)
          )
          .expect(400);
        expect(res.body).toEqual(
          expect.arrayContaining(["Invalid description, 200 character max."])
        );
      } catch (error) {
        return error;
      }
    }
  );

  //solo description
  test.each(data.posts)(
    "Should return 'Select an image' and 400 status code sending only description",
    async ({ description }) => {
      try {
        const res = await api
          .post("/api/posts/")
          .set("Accept", "application/json")
          .set("Cookie", [`${nameToken}=${token}`])
          .field("description", description)
          .attach("thumbnail")
          .expect(400);
        expect(res.body).toEqual(expect.arrayContaining(["Select an image"]));
      } catch (error) {
        console.log(error);
        return error;
      }
    }
  );
});

//validaciones
describe("Add posts with invalid data", () => {
  beforeAll(async () => {
    await User.deleteMany();
    await registerUser(data.user);
    const loginRes = await loginUserTrue(data.user);
    token = getTokenValue(loginRes.headers);
    userLogged = loginRes.body;
  });

  afterAll(async () => {
    //Valida posts agregados a db(por length)
    const postsRes = await Post.find();
    expect(postsRes).toHaveLength(0);
    //valida thumbnails agregados a server (por length)
    const files = await readdir(join(__dirname, "../../", "uploads/posts"));
    expect(files).toHaveLength(0);
  });

  //Validacion de description con mas de 200 characteres de largo
  test("Should return 'Invalid description, 200 character max.' and 400 status code sending description 201 chacracteres length", async () => {
    const res = await api
      .post("/api/posts/")
      .set("Accept", "application/json")
      .set("Cookie", [`${nameToken}=${token}`])
      .field(
        "description",
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec bibendum nisi eget scelerisque facilisis. Maecenas sodales ante nec lorem hendrerit, pellentesque elementum enim commodo. Class aptent taa"
      )
      .attach(
        "thumbnail",
        join(__dirname, "..", "fixture/posts/", data.posts[0].thumbnail)
      )
      .expect(400);
    expect(res.body).toEqual(
      expect.arrayContaining(["Invalid description, 200 character max."])
    );
  });

  //Validacion de thumbnail, thumbnail mayor 2mb de tamaño
  test("Should return 'Upload file less than 2mb. (2000000 bytes)' and 400 status code sending thumbnail with size > 2mb", async () => {
    const res = await api
      .post("/api/posts/")
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
  });

  //Validacion de formato de thumbnail, solamente: .jpg, .png, .jpeg
  test("Should return 'Format thumbnail must be .jpg, .png, .jpeg' and 400 status code sending thumbnail with size > 2mb", async () => {
    const res = await api
      .post("/api/posts/")
      .set("Accept", "application/json")
      .set("Cookie", [`${nameToken}=${token}`])
      .field(
        "description",
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec bibendum nisi eget scelerisque facilisis. Maecenas sodales ante nec lorem hendrerit, pellentesque elementum enim commodo. Class aptent ta"
      )
      .attach("thumbnail", join(__dirname, "..", "fixture/posts/", "test.txt"))
      .expect(400);
    expect(res.body).toEqual(
      expect.arrayContaining(["Format thumbnail must be .jpg, .png, .jpeg"])
    );
  });
});

//validaciones sin token (sin login)
describe("Add posts withouth token", () => {
  afterAll(async () => {
    //Valida posts agregados a db(por length)
    const postsRes = await Post.find();
    expect(postsRes).toHaveLength(0);
    //valida thumbnails agregados a server (por length)
    const files = await readdir(join(__dirname, "../../", "uploads/posts"));
    expect(files).toHaveLength(0);
  });

  test.each(data.posts)(
    "Should return Invalid Token message",
    async ({ description, thumbnail }) => {
      const res = await api
        .post(`/api/posts/`)
        .set("Accept", "application/json")
        .field("description", `${description}`)
        .attach("thumbnail", join(__dirname, "..", "fixture/posts/", thumbnail))
        .expect(400);
      expect(res.body).toEqual(expect.arrayContaining(["Invalid Token"]));
      expect(res.body).not.toHaveProperty("_id");
      expect(res.body).not.toHaveProperty("description", `${description}`);
      expect(res.body).not.toHaveProperty("thumbnail");
    }
  );
});

//Validacion de Token con mal formato
describe("Add posts authentication with empty and bad format token", () => {
  beforeAll(async () => {
    await User.deleteMany();
    await registerUser(data.user);
    const loginRes = await loginUserTrue(data.user);
    token = getTokenValue(loginRes.headers);
    userLogged = loginRes.body;
  });

  afterAll(async () => {
    //Valida posts agregados a db(por length)
    const postsRes = await Post.find();
    expect(postsRes).toHaveLength(0);
    //valida thumbnails agregados a server (por length)
    const files = await readdir(join(__dirname, "../../", "uploads/posts"));
    expect(files).toHaveLength(0);
  });

  test.each(data.posts)(
    "should return Invalid Token message without token value",
    async ({ description, thumbnail }) => {
      const res = await api
        .post(`/api/posts/`)
        .set("Cookie", [`accessToken=`])
        .set("Accept", "application/json")
        .field("description", `${description}`)
        .attach("thumbnail", join(__dirname, "..", "fixture/posts/", thumbnail))
        .expect(400);
      expect(res.body).toEqual(expect.arrayContaining(["Invalid Token"]));
      expect(res.body).not.toHaveProperty("_id");
      expect(res.body).not.toHaveProperty("description", `${description}`);
      expect(res.body).not.toHaveProperty("thumbnail");
    }
  );

  test.each(data.posts)(
    "should return Invalid Token message with invalid token name",
    async ({ description, thumbnail }) => {
      const res = await api
        .post(`/api/posts/`)
        .set("Cookie", [`access=${token}`])
        .set("Accept", "application/json")
        .field("description", `${description}`)
        .attach("thumbnail", join(__dirname, "..", "fixture/posts/", thumbnail))
        .expect(400);
      expect(res.body).toEqual(expect.arrayContaining(["Invalid Token"]));
      expect(res.body).not.toHaveProperty("_id");
      expect(res.body).not.toHaveProperty("description", `${description}`);
      expect(res.body).not.toHaveProperty("thumbnail");
    }
  );

  test.each(data.posts)(
    "should return Invalid Token message with bad format token",
    async ({ description, thumbnail }) => {
      const res = await api
        .post(`/api/posts/`)
        .set("Cookie", [`accessToken=${token + "asdasdAlan"}`])
        .set("Accept", "application/json")
        .field("description", `${description}`)
        .attach("thumbnail", join(__dirname, "..", "fixture/posts/", thumbnail))
        .expect(404);
      expect(res.body).toEqual(expect.arrayContaining(["invalid signature"]));
      expect(res.body).not.toHaveProperty("_id");
      expect(res.body).not.toHaveProperty("description", `${description}`);
      expect(res.body).not.toHaveProperty("thumbnail");
    }
  );
});
