const mongoose = require("mongoose");
//model
const User = require("../../models/users.model.js");
//DUMYS
const {
  data,
  loginUserTrue,
  loginUserFalse,
  registerUser,
  registerUsers,
  getTokenValue,
} = require("../utils.js");
const request = require("supertest");
const app = require("../../app.js");
const api = request(app);
let token;
let userLogged;
let tokenName = "accessToken";

beforeAll(() => {
  mongoose
    .connect(process.env.DB_CONN_TEST)
    .then((res) => console.log("connect BD_TEST succeful"))
    .catch((error) => console.log(error));
});

afterAll(async () => {
  await mongoose.connection.close();
});

//Validacion actualizacion usuario
describe("Update user data", () => {
  beforeEach(async () => {
    await User.deleteMany();
    await registerUser(data.user);
    //login
    const loginRes = await loginUserTrue(data.user);
    token = getTokenValue(loginRes.headers);
    userLogged = loginRes.body;
  });

  test("Should return updated user data with same email", async () => {
    const res = await api
      .patch(`/api/users/update`)
      .set("Cookie", [`${tokenName}=${token}`])
      .set("Accept", "application/json")
      .send({ ...data.userUpdate, email: userLogged.email })
      .expect(200);
    expect(res.body).toHaveProperty("_id");
    expect(res.body).toHaveProperty("name", data.userUpdate.name);
    expect(res.body).toHaveProperty("email", userLogged.email);
    expect(res.body).not.toHaveProperty("password");
    //login (para confirmar usuario editado)
    await loginUserTrue({...data.userUpdate, email: userLogged.email});
  });

  test("Should return updated user data with other email", async () => {
    const res = await api
      .patch(`/api/users/update`)
      .set("Cookie", [`${tokenName}=${token}`])
      .send(data.userUpdate)
      .expect(200);
    expect(res.body).toHaveProperty("_id");
    expect(res.body).toHaveProperty("name", data.userUpdate.name);
    expect(res.body).toHaveProperty("email", data.userUpdate.email);
    expect(res.body).not.toHaveProperty("password");
    //login (para confirmar usuario editado)
    await loginUserTrue(data.userUpdate);

    //login (para confirmar usuario email original)
    await loginUserFalse({
      body: { email: userLogged.email, password: data.userUpdate.password },
      statusCode: 400,
      messageExpect: "Invalid credentials",
    });
  });
});

//Validacion actualizacion de usuario con campos vacios
describe("Update user data with empty requires fields", () => {
  beforeAll(async () => {
    await User.deleteMany();
    await registerUser(data.user);
    //login
    const loginRes = await loginUserTrue(data.user);
    token = getTokenValue(loginRes.headers);
  });

  afterAll(async () => {
    await User.deleteMany();
  });

  test("Should return Invalid Name, Invalid Email, Invalid Password between 6 and 12 charact, Invalid Confirm Password between 6 and 12 charact with all empty data", async () => {
    const res = await api
      .patch("/api/users/update")
      .set("accept", /json/)
      .set("Cookie", [`${tokenName}=${token}`])
      .send({})
      .expect(400);
    expect(res.body).toEqual(
      expect.arrayContaining([
        "Invalid Name, Invalid Email, Invalid Password between 6 and 12 charact, Invalid Confirm Password between 6 and 12 charact",
      ])
    );
  });

  test("Should return Invalid Name, Invalid Email, Invalid Password between 6 and 12 charact, Invalid Confirm Password between 6 and 12 charact with only keys", async () => {
    const res = await api
      .patch("/api/users/update")
      .set("accept", /json/)
      .set("Cookie", [`${tokenName}=${token}`])
      .send({ name: "", email: "", password: "", confirmPassword: "" })
      .expect(400);
    expect(res.body).toEqual(
      expect.arrayContaining([
        "Invalid Name, Invalid Email, Invalid Password between 6 and 12 charact, Invalid Confirm Password between 6 and 12 charact",
      ])
    );
  });

  test("Should return Invalid Name message with send empty name value", async () => {
    const res = await api
      .patch("/api/users/update")
      .set("accept", /json/)
      .set("Cookie", [`${tokenName}=${token}`])
      .send({
        name: "",
        email: data.userUpdate.email,
        password: data.userUpdate.password,
        confirmPassword: data.userUpdate.confirmPassword,
      })
      .expect(400);
    expect(res.body).toEqual(expect.arrayContaining(["Invalid Name"]));
    //login (para confirmar usuario no editado)
    await loginUserFalse({
      body: {
        email: data.userUpdate.email,
        password: data.userUpdate.password,
      },
      statusCode: 400,
      messageExpect: "Invalid credentials",
    });

    //login (para confirmar usuario original
    await loginUserTrue({
      email: data.user.email,
      password: data.user.password,
    }).then((res) => {
      expect(res.body.name).not.toEqual(data.userUpdate.name);
    });
  });

  test("Should return Invalid Email message with send empty email value", async () => {
    const res = await api
      .patch("/api/users/update")
      .set("accept", /json/)
      .set("Cookie", [`${tokenName}=${token}`])
      .send({
        name: data.userUpdate.name,
        email: "",
        password: data.userUpdate.password,
        confirmPassword: data.userUpdate.confirmPassword,
      })
      .expect(400);
    expect(res.body).toEqual(expect.arrayContaining(["Invalid Email"]));

    //login (para confirmar usuario original)
    await loginUserTrue({
      email: data.user.email,
      password: data.user.password,
    }).then((res) => {
      expect(res.body.email).not.toEqual("");
    });
  });

  test("Should return Invalid Password between 6 and 12 charact message with send empty password value", async () => {
    const res = await api
      .patch("/api/users/update")
      .set("accept", /json/)
      .set("Cookie", [`${tokenName}=${token}`])
      .send({
        name: data.userUpdate.name,
        email: data.userUpdate.email,
        password: "",
        confirmPassword: data.userUpdate.confirmPassword,
      })
      .expect(400);
    expect(res.body).toEqual(
      expect.arrayContaining(["Invalid Password between 6 and 12 charact"])
    );

    //login (para confirmar usuario original)
    await loginUserTrue({
      email: data.user.email,
      password: data.user.password,
    });
  });

  test("Should returnInvalid Confirm Password between 6 and 12 charact message with send empty password value", async () => {
    const res = await api
      .patch("/api/users/update")
      .set("accept", /json/)
      .set("Cookie", [`${tokenName}=${token}`])
      .send({
        name: data.userUpdate.name,
        email: data.userUpdate.email,
        password: data.userUpdate.password,
        confirmPassword: "",
      })
      .expect(400);
    expect(res.body).toEqual(
      expect.arrayContaining([
        "Invalid Confirm Password between 6 and 12 charact",
      ])
    );
    //login (para confirmar usuario no editado)
    await loginUserFalse({
      body: {
        email: data.userUpdate.email,
        password: data.userUpdate.password,
      },
      statusCode: 400,
      messageExpect: "Invalid credentials",
    });

    //login (para confirmar usuario original)
    await loginUserTrue({
      email: data.user.email,
      password: data.user.password,
    });
  });
});

//Validacion update uer con email ya registrado
describe("Update user data with email value already registered", () => {
  beforeEach(async () => {
    await User.deleteMany();
    await registerUsers(data.users);
    await registerUser(data.user);
    //login
    const loginRes = await loginUserTrue(data.user);
    token = getTokenValue(loginRes.headers);
  });

  test("Should return 'Email exist' message with send email already registered", async () => {
    const res = await api
      .patch("/api/users/update")
      .set("Accept", /json/)
      .set("Cookie", [`${tokenName}=${token}`])
      .send({
        name: "other_name",
        email: data.users[0].email,
        password: "asd123456",
        confirmPassword: "asd123456",
      })
      .expect(400);
    expect(res.body).toEqual(expect.arrayContaining(["Email exist"]));
  });
});

//Validacion update user campos no validos
describe("Update user data with invalid data", () => {
  beforeEach(async () => {
    await User.deleteMany();
    await registerUser(data.user);
    //login
    const loginRes = await loginUserTrue(data.user);
    token = getTokenValue(loginRes.headers);
  });

  test("Should return 'Invalid Email' message with send invalid email value", async () => {
    const res = await api
      .patch("/api/users/update")
      .set("accept", /json/)
      .set("Cookie", [`${tokenName}=${token}`])
      .send({
        name: data.userUpdate.name,
        email: ".algo@gmail.com",
        password: data.userUpdate.password,
        confirmPassword: data.userUpdate.confirmPassword,
      })
      .expect(400);
    expect(res.body).toEqual(expect.arrayContaining(["Invalid Email"]));
    //login (para confirmar usuario original)
    await loginUserTrue(data.user);
    //login para confirmar no actualizacion
    await loginUserFalse({
      body: { email: ".algo@gmail.com", password: data.userUpdate.password },
      statusCode: 400,
      messageExpect: "Invalid Email",
    });
  });

  test("Should return 'Invalid Password between 6 and 12 charact' message with send password 5 characts", async () => {
    const res = await api
      .patch("/api/users/update")
      .set("accept", /json/)
      .set("Cookie", [`${tokenName}=${token}`])
      .send({ ...data.userUpdate, password: "12345" })
      .expect(400);
    expect(res.body).toEqual(
      expect.arrayContaining(["Invalid Password between 6 and 12 charact"])
    );
    //login (para confirmar usuario original)
    await loginUserTrue(data.user);
    //login para confirmar no actualizacion
    await loginUserFalse({
      body: { ...data.userUpdate, password: "12345" },
      statusCode: 400,
      messageExpect: "Invalid Password between 6 and 12 charact",
    });
  });

  test("Should return 'Invalid Password between 6 and 12 charact' message with send password 13 characts", async () => {
    const res = await api
      .patch("/api/users/update")
      .set("accept", /json/)
      .set("Cookie", [`${tokenName}=${token}`])
      .send({ ...data.userUpdate, password: "1234567890123" })
      .expect(400);
    expect(res.body).toEqual(
      expect.arrayContaining(["Invalid Password between 6 and 12 charact"])
    );
    //login (para confirmar usuario original)
    await loginUserTrue(data.user);
    //login para confirmar no actualizacion
    await loginUserFalse({
      body: { ...data.userUpdate, password: "1234567890123" },
      statusCode: 400,
      messageExpect: "Invalid Password between 6 and 12 charact",
    });
  });

  test("Should return 'Passwords not equals' message with send password and confirm password not equals", async () => {
    const res = await api
      .patch("/api/users/update")
      .set("accept", /json/)
      .set("Cookie", [`${tokenName}=${token}`])
      .send({
        name: data.userUpdate.name,
        email: data.userUpdate.email,
        password: "1234567890",
        confirmPassword: "12345678",
      })
      .expect(400);
    expect(res.body).toEqual(expect.arrayContaining(["Passwords not equals"]));

    //login (para confirmar usuario original)
    await loginUserTrue(data.user);
  });
});

//validacion actualizacion de usuario sin token y con token mal formato
describe("Update user data with bad format token", () => {
  beforeEach(async () => {
    await User.deleteMany();
    await registerUser(data.user);
    //login
    const loginRes = await loginUserTrue(data.user);
    token = getTokenValue(loginRes.headers);
  });

  test("should not return user information", async () => {
    const res = await api.get(`/api/users/`).send(data.userUpdate).expect(400);
    expect(res.body).not.toHaveProperty("_id");
    expect(res.body).not.toHaveProperty("name", data.userUpdate.name);
    expect(res.body).not.toHaveProperty("email", data.userUpdate.email);
    expect(res.body).toEqual(expect.arrayContaining(["Invalid Token"]));

    //login (para confirmar usuario no editado)
    await loginUserFalse({
      body: {
        email: data.userUpdate.email,
        password: data.userUpdate.password,
      },
      statusCode: 400,
      messageExpect: "Invalid credentials",
    });

    //login (para confirmar usuario original)
    await loginUserTrue(data.user);
  });

  test("should not return user information", async () => {
    const res = await api
      .get(`/api/users/`)
      .set("Cookie", "")
      .send(data.userUpdate)
      .expect(400);
    expect(res.body).not.toHaveProperty("_id");
    expect(res.body).not.toHaveProperty("name", data.userUpdate.name);
    expect(res.body).not.toHaveProperty("email", data.userUpdate.email);
    expect(res.body).toEqual(expect.arrayContaining(["Invalid Token"]));

    //login (para confirmar usuario no editado)
    await loginUserFalse({
      body: {
        email: data.userUpdate.email,
        password: data.userUpdate.password,
      },
      statusCode: 400,
      messageExpect: "Invalid credentials",
    });

    //login (para confirmar usuario original)
    await loginUserTrue(data.user);
  });

  test("should return Invalid Token message without token value", async () => {
    const res = await api
      .patch(`/api/users/update`)
      .set("Cookie", [`${tokenName}=`])
      .send(data.userUpdate)
      .expect(400);
    expect(res.body).toEqual(expect.arrayContaining(["Invalid Token"]));

    //login (para confirmar usuario no editado)
    await loginUserFalse({
      body: {
        email: data.userUpdate.email,
        password: data.userUpdate.password,
      },
      statusCode: 400,
      messageExpect: "Invalid credentials",
    });

    //login (para confirmar usuario original)
    await loginUserTrue(data.user);
  });

  test("should return Invalid Token message with other token name", async () => {
    const res = await api
      .patch(`/api/users/update`)
      .set("Cookie", [`access=${token}`])
      .send(data.userUpdate)
      .expect(400);
    expect(res.body).toEqual(expect.arrayContaining(["Invalid Token"]));

    //login (para confirmar usuario no editado)
    await loginUserFalse({
      body: {
        email: data.userUpdate.email,
        password: data.userUpdate.password,
      },
      statusCode: 400,
      messageExpect: "Invalid credentials",
    });

    //login (para confirmar usuario original)
    await loginUserTrue(data.user);
  });

  test("should return Invalid Token message with bad format token", async () => {
    const res = await api
      .patch(`/api/users/update`)
      .set("Cookie", [`${tokenName}=${token + "asdasdAlan"}`])
      .send(data.userUpdate)
      .expect(404);
    expect(res.body).toEqual(expect.arrayContaining(["invalid signature"]));

    //login (para confirmar usuario no editado)
    await loginUserFalse({
      body: {
        email: data.userUpdate.email,
        password: data.userUpdate.password,
      },
      statusCode: 400,
      messageExpect: "Invalid credentials",
    });

    //login (para confirmar usuario original)
    await loginUserTrue(data.user);
  });
});
