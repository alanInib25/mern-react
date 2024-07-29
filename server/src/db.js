const { connect, connection } = require("mongoose");
//config
const { DB_CONN } = require("./utils/handleConfig.js");
//db for test

const { NODE_ENV, DB_CONN_TEST } = process.env;
const connectionString = NODE_ENV === "test" ? DB_CONN_TEST : DB_CONN;

(async () => await connect(connectionString))()
connection.on("error", () => console.log("Error connection DB"));
connection.on("connected", () => console.log("Connect DB successful"))