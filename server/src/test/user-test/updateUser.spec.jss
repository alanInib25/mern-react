const mongoose = require("mongoose");
//model
const User = require("../../models/users.model.js");
//DUMYS
const {
  data,
  loginUserTrue,
  loginUserFalse,
  saveUser,
  saveUsers,
} = require("../utils.js");
const request = require("supertest");
const app = require("../../app.js");
const api = request(app);
let token;

beforeAll(() => {
  mongoose
    .connect(process.env.DB_CONN_TEST)
    .then((res) => console.log("connect BD_TEST succeful"))
    .catch((error) => console.log(error));
});

afterAll(async () => {
  await mongoose.connection.close();
});

//actualiza usuario
describe("Update user data with authentication", () => {
  beforeEach(async () => {
    await User.deleteMany();
    await saveUser(data.user);
    //login
    const res = await api
      .post("/api/auth/signin")
      .send({ email: data.user.email, password: data.user.password })
      .expect(200)
      .expect("Content-Type", /json/)
      .expect("set-cookie", /accessToken/);
    token = res.headers["set-cookie"][0].split(";")[0].split("=")[1];
  });

  test("Should return updated user data same email", async () => {
    const res = await api
      .patch(`/api/users/update`)
      .set("Cookie", [`accessToken=${token}`])
      .send({
        name: data.userUpdate.name,
        email: data.userUpdate.email,
        password: data.userUpdate.password,
        confirmPassword: data.userUpdate.confirmPassword,
      })
      .expect(200);
    expect(res.body).toHaveProperty("_id");
    expect(res.body).toHaveProperty("name", data.userUpdate.name);
    expect(res.body).toHaveProperty("email", data.userUpdate.email);
    expect(res.body).not.toHaveProperty("password");
    //login (para confirmar usuario editado)
    await loginUserTrue({
      email: data.userUpdate.email,
      password: data.userUpdate.password,
    });
  });

  test("Should return updated user data with other email", async () => {
    const res = await api
      .patch(`/api/users/update`)
      .set("Cookie", [`accessToken=${token}`])
      .send({
        name: data.userUpdate.name,
        email: "otherEmail@gmail.com",
        password: data.userUpdate.password,
        confirmPassword: data.userUpdate.confirmPassword,
      })
      .expect(200);
    expect(res.body).toHaveProperty("_id");
    expect(res.body).toHaveProperty("name", data.userUpdate.name);
    expect(res.body).toHaveProperty("email", "otherEmail@gmail.com");
    expect(res.body).not.toHaveProperty("password");
    //login (para confirmar usuario editado)
    await loginUserTrue({
      email: "otherEmail@gmail.com",
      password: data.userUpdate.password,
    });

    //login (para confirmar usuario email original)
    await loginUserFalse({
      body: { email: data.user.email, password: data.userUpdate.password },
      statusCode: 400,
      messageExpect: "Invalid credentials",
    });
  });
});

//con logueo pero campos vacios
describe("Update user data with empty requires fields", () => {
  beforeEach(async () => {
    await User.deleteMany();
    await saveUser(data.user);
    //login
    const res = await api
      .post("/api/auth/signin")
      .send({ email: data.user.email, password: data.user.password })
      .expect(200)
      .expect("Content-Type", /json/)
      .expect("set-cookie", /accessToken/);
    token = res.headers["set-cookie"][0].split(";")[0].split("=")[1];
  });

  test("Should return Invalid Name, Invalid Email, Invalid Password between 6 and 12 charact, Invalid Confirm Password between 6 and 12 charact with all empty data", async () => {
    const res = await api
      .patch("/api/users/update")
      .set("accept", /json/)
      .set("Cookie", [`accessToken=${token}`])
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
      .set("Cookie", [`accessToken=${token}`])
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
      .set("Cookie", [`accessToken=${token}`])
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
      .set("Cookie", [`accessToken=${token}`])
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
      .set("Cookie", [`accessToken=${token}`])
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
      .set("Cookie", [`accessToken=${token}`])
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

//con email ya registrado
describe("Update user data update email with value already registered", () => {
  beforeEach(async () => {
    await User.deleteMany();
    await saveUsers(data.users);
    await saveUser(data.user);
    //login
    const res = await api
      .post("/api/auth/signin")
      .send({ email: data.user.email, password: data.user.password })
      .expect(200)
      .expect("Content-Type", /json/)
      .expect("set-cookie", /accessToken/);
    token = res.headers["set-cookie"][0].split(";")[0].split("=")[1];
  });

  test("Should return Email exist message with send email already registered", async () => {
    const res = await api
      .patch("/api/users/update")
      .set("Accept", /json/)
      .set("Cookie", [`accessToken=${token}`])
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

//con logueo pero campos no validos
describe("Update user data with invalid data", () => {
  beforeEach(async () => {
    await User.deleteMany();
    await saveUser(data.user);
    //login
    const res = await api
      .post("/api/auth/signin")
      .send({ email: data.user.email, password: data.user.password })
      .expect(200)
      .expect("Content-Type", /json/)
      .expect("set-cookie", /accessToken/);
    token = res.headers["set-cookie"][0].split(";")[0].split("=")[1];
  });

  test("Should return Invalid Email message with send invalid email value", async () => {
    const res = await api
      .patch("/api/users/update")
      .set("accept", /json/)
      .set("Cookie", [`accessToken=${token}`])
      .send({
        name: data.userUpdate.name,
        email: ".algo@gmail.com",
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
      //confirma que no cambio actualizó nombre de usuario
      expect(res.body.name).not.toEqual(data.userUpdate.name);
    });
  });

  test("Should return Invalid Password between 6 and 12 charact message with send password 5 characts", async () => {
    const res = await api
      .patch("/api/users/update")
      .set("accept", /json/)
      .set("Cookie", [`accessToken=${token}`])
      .send({
        name: data.userUpdate.name,
        email: data.userUpdate.email,
        password: "12345",
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
    }).then((res) => {
      //confirma que no cambio actualizó nombre de uuario
      expect(res.body.name).not.toEqual(data.userUpdate.name);
    });
  });

  test("Should return Invalid Password between 6 and 12 charact message with send password 13 characts", async () => {
    const res = await api
      .patch("/api/users/update")
      .set("accept", /json/)
      .set("Cookie", [`accessToken=${token}`])
      .send({
        name: data.userUpdate.name,
        email: data.userUpdate.email,
        password: "1234567890123",
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
    }).then((res) => {
      //confirma que no cambio actualizó nombre de uuario
      expect(res.body.name).not.toEqual(data.userUpdate.name);
    });
  });

  test("Should return Passwords not equals message with send password and confirm password not equals", async () => {
    const res = await api
      .patch("/api/users/update")
      .set("accept", /json/)
      .set("Cookie", [`accessToken=${token}`])
      .send({
        name: data.userUpdate.name,
        email: data.userUpdate.email,
        password: "1234567890",
        confirmPassword: "12345678",
      })
      .expect(400);
    expect(res.body).toEqual(expect.arrayContaining(["Passwords not equals"]));

    //login (para confirmar usuario original)
    await loginUserTrue({
      email: data.user.email,
      password: data.user.password,
    }).then((res) => {
      //confirma que no cambio actualizó nombre de uuario
      expect(res.body.name).not.toEqual(data.userUpdate.name);
    });
  });
});

//sin logueo
describe("Update user data withouth authentication", () => {
  beforeEach(async () => {
    await User.deleteMany();
    await saveUser(data.user);
  });

  test("Should return Invalid Token message", async () => {
    const res = await api
      .patch(`/api/users/update`)
      .send({
        name: data.userUpdate.name,
        email: data.userUpdate.email,
        password: data.userUpdate.password,
        confirmPassword: data.userUpdate.confirmPassword,
      })
      .expect(400);
    expect(res.body).toEqual(expect.arrayContaining(["Invalid Token"]));
    expect(res.body).not.toHaveProperty("name", data.userUpdate.name);
    expect(res.body).not.toHaveProperty("email", data.userUpdate.email);
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

//logueado pero sin token
describe("Update user data without token", () => {
  beforeEach(async () => {
    await User.deleteMany();
    await saveUser(data.user);
    //login
    const res = await api
      .post("/api/auth/signin")
      .send({ email: data.user.email, password: data.user.password })
      .expect(200)
      .expect("Content-Type", /json/)
      .expect("set-cookie", /accessToken/);
    token = res.headers["set-cookie"][0].split(";")[0].split("=")[1];
  });

  test("should not return user information", async () => {
    const res = await api
      .get(`/api/users/`)
      .set("Cookie", "")
      .send({
        name: data.userUpdate.name,
        email: data.userUpdate.email,
        password: data.userUpdate.password,
        confirmPassword: data.userUpdate.confirmPassword,
      })
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
    await loginUserTrue({
      email: data.user.email,
      password: data.user.password,
    });
  });
});

//logueado pero token mal formato
describe("Update user data with bad format token", () => {
  beforeEach(async () => {
    await User.deleteMany();
    await saveUser(data.user);
    //login
    const res = await api
      .post("/api/auth/signin")
      .send({ email: data.user.email, password: data.user.password })
      .expect(200)
      .expect("Content-Type", /json/)
      .expect("set-cookie", /accessToken/);
    token = res.headers["set-cookie"][0].split(";")[0].split("=")[1];
  });

  test("should return Invalid Token message without token value", async () => {
    const res = await api
      .patch(`/api/users/update`)
      .set("Cookie", [`accessToken=`])
      .send({
        name: data.userUpdate.name,
        email: data.userUpdate.email,
        password: data.userUpdate.password,
        confirmPassword: data.userUpdate.confirmPassword,
      })
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
    await loginUserTrue({
      email: data.user.email,
      password: data.user.password,
    });
  });

  test("should return Invalid Token message with other token name", async () => {
    const { _id } = await User.findOne({ email: data.user.email });
    const res = await api
      .patch(`/api/users/update`)
      .set("Cookie", [`access=${token}`])
      .send({
        name: data.userUpdate.name,
        email: data.userUpdate.email,
        password: data.userUpdate.password,
        confirmPassword: data.userUpdate.confirmPassword,
      })
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
    await loginUserTrue({
      email: data.user.email,
      password: data.user.password,
    });
  });

  test("should return Invalid Token message with bad format token", async () => {
    const res = await api
      .patch(`/api/users/update`)
      .set("Cookie", [`accessToken=${token + "asdasdAlan"}`])
      .send({
        name: data.userUpdate.name,
        email: data.userUpdate.email,
        password: data.userUpdate.password,
        confirmPassword: data.userUpdate.confirmPassword,
      })
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
    await loginUserTrue({
      email: data.user.email,
      password: data.user.password,
    });
  });
});
