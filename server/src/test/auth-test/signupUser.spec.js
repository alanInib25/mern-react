const mongoose = require("mongoose");
//dummys
const {
  data,
  registerUser,
  loginUserTrue,
  loginUserFalse,
} = require("../utils.js");
//model
const User = require("../../models/users.model.js");
//app
const app = require("../../app.js");
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

//Signup user
describe("Signup user", () => {
  beforeEach(async () => {
    await User.deleteMany();
  });

  afterAll(async () => {
    const findRes = await User.find();
    expect(findRes).toHaveLength(
      Array.from(data.user).length + data.users.length
    );
    await User.deleteMany();
  });
  //add user
  test("should register a user", async () => {
    const res = await api
      .post("/api/auth/signup")
      .set("Accept", "application/json")
      .send(data.user)
      .expect(200);
    expect(res.body).toHaveProperty("_id");
    expect(res.body).not.toHaveProperty("password");
    expect(res.body).toHaveProperty("name", data.user.name);
    expect(res.body).toHaveProperty("email", data.user.email);
    expect(res.body).toHaveProperty("posts", 0);
    //signin (validate ok register)
    await loginUserTrue(data.user);
  });

  //Agrega mas usuarios
  test("Should register users", async () => {
    for (let i = 0; i < data.users.length; i++) {
      const res = await api
        .post("/api/auth/signup")
        .set("Accept", "application/json")
        .send(data.users[i])
        .expect(200);
      expect(res.body).toHaveProperty("_id");
      expect(res.body).not.toHaveProperty("password");
      expect(res.body).toHaveProperty("name", data.users[i].name);
      expect(res.body).toHaveProperty("email", data.users[i].email);
      expect(res.body).toHaveProperty("posts", 0);
      //valida registro en bd
      const user = await User.findById(res.body._id);
      expect(user).toHaveProperty("name", data.users[i].name);
      expect(user).toHaveProperty("email", data.users[i].email);
      //login con usuario paravalidar registro
      await loginUserTrue(data.users[i]);
    }
  });
});

//Validacion de regsitro de usuario con campos vacios
describe("Signup user send empty data", () => {
  //valida que al final de cada prueba no se haya registrado un usuario
  afterEach(async () => {
    const users = await User.find({});
    expect(users).toEqual(expect.arrayContaining([]));
  });

  afterAll(async () => {
    const users = await User.find({});
    expect(users).toHaveLength(0);
    expect(users).toEqual(expect.arrayContaining([]));
  });

  //without all required fields
  test("should not register without all required fields", async () => {
    const res = await api
      .post("/api/auth/signup")
      .set("Accept", "application/json")
      .send({})
      .expect(400);
    expect(res.body).toEqual(
      expect.arrayContaining([
        "Invalid Name, Invalid Email, Invalid Password between 6 and 12 charact",
      ])
    );
    expect(res.body).not.toHaveProperty("_id");
  });

  //without values of required fields
  test("should not register without values of required field", async () => {
    const res = await api
      .post("/api/auth/signup")
      .set("Accept", "application/json")
      .send(data.notUsersValues)
      .expect(400);
    expect(res.body).toEqual(
      expect.arrayContaining([
        "Invalid Name, Invalid Email, Invalid Password between 6 and 12 charact",
      ])
    );
    expect(res.body).not.toHaveProperty("_id");
  });

  //without name required field
  test("should not register without name value required", async () => {
    const res = await api
      .post("/api/auth/signup")
      .set("Accept", "application/json")
      .send({ name: "", email: "emil@email.com", password: "asdasd" })
      .expect(400);
    expect(res.body).toEqual(expect.arrayContaining(["Invalid Name"]));
    expect(res.body).not.toHaveProperty("_id");
    //signin (validate no ok register)
    await loginUserFalse({
      body: { email: "emil@email.com", password: "asdasd" },
      statusCode: 400,
      messageExpect: "Invalid credentials",
    });
  });

  //without email required field
  test("Should not register without email required field", async () => {
    const res = await api
      .post("/api/auth/signup")
      .set("Accept", "application/json")
      .send({ name: "name", email: "", password: "asdasd" })
      .expect(400);
    expect(res.body).toEqual(expect.arrayContaining(["Invalid Email"]));
  });

  //without password required field
  test("Should not register without password required field", async () => {
    const res = await api
      .post("/api/auth/signup")
      .set("Accept", "application/json")
      .send({ name: "name", email: "emil@email.com", password: "" })
      .expect(400);
    expect(res.body).toEqual(
      expect.arrayContaining(["Invalid Password between 6 and 12 charact"])
    );
  });
});

//Validacion de regsitro de usuario con data invalida
describe("Signup user with invalid data", () => {
  //valida que al final de cada prueba no se haya registrado un usuario
  afterEach(async () => {
    const users = await User.find({});
    expect(users).toEqual(expect.arrayContaining([]));
  });

  afterAll(async () => {
    const users = await User.find({});
    expect(users).toHaveLength(0);
    expect(users).toEqual(expect.arrayContaining([]));
  });

  //Valida password de 5 charact
  test("Should not register with password length 5 charact", async () => {
    const res = await api
      .post("/api/auth/signup")
      .set("Accept", "application/json")
      .send({ name: "name", email: "emil@email.com", password: "asdas" })
      .expect(400)
      .then((response) => {
        expect(response.body).toEqual(
          expect.arrayContaining(["Invalid Password between 6 and 12 charact"])
        );
      });
    //signin (no debe loguearce)
    await loginUserFalse({
      body: { email: "emil@email.com", password: "asdas" },
      statusCode: 400,
      messageExpect: "Invalid Password between 6 and 12 charact",
    });
  });

  //Valida registro con password mayor a 12 charact.
  test("Should not register user with password length 13 charact", async () => {
    await api
      .post("/api/auth/signup")
      .set("Accept", "application/json")
      .send({
        name: "name",
        email: "emil@email.com",
        password: "asdasdasdasda",
      })
      .expect(400)
      .then((res) => {
        expect(res.body).toEqual(
          expect.arrayContaining(["Invalid Password between 6 and 12 charact"])
        );
      });
    //signin (no debe loguearce)
    await loginUserFalse({
      body: { email: "emil@email.com", password: "asdas" },
      statusCode: 400,
      messageExpect: "Invalid Password between 6 and 12 charact",
    });
  });

  //Valida registro con email mal formato.
  test("Should not register user with email bad format", async () => {
    await api
      .post("/api/auth/signup")
      .set("Accept", "application/json")
      .send({
        name: "name",
        email: ".emil@email.com",
        password: "asdasdasdasd",
      })
      .expect(400)
      .then((res) => {
        expect(res.body).toEqual(expect.arrayContaining(["Invalid Email"]));
      });
    //signin (no debe loguearce)
    await loginUserFalse({
      body: { email: ".emil@email.com", password: "asdasdasdasd" },
      statusCode: 400,
      messageExpect: "Invalid Email",
    });
  });
});

//Valida registro con email invalido
describe("Duplicate Email field", () => {
  beforeAll(async () => {
    //usuario registrado para usar su email en la prueba
    await registerUser(data.user);
  });

  afterAll(async () => {
    const users = await User.find({name: "test"});
    expect(users).toHaveLength(0);
    expect(users).toEqual(expect.arrayContaining([]));

    await User.deleteMany();
  });

  //test
  test("Should not register user width duplicate email", async () => {
    await api
      .post("/api/auth/signup")
      .set("Accept", "application/json")
      .send({ email: data.user.email, name:"test", password: "fffffff" })
      .expect(400)
      .then((res) => {
        expect(res.body).toEqual(expect.arrayContaining(["Email exists"]));
      });

    //signin (no debe loguearce)
    await loginUserFalse({
      body: { email: data.user.email, password: "fffffff" },
      statusCode: 400,
      messageExpect: "Invalid credentials",
    });
  });
});
