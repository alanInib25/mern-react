const { connect, connection } = require("mongoose");
//config
const { DB_CONN } = require("./utils/handleConfig.js");

(async () => await connect(DB_CONN))()
connection.on("error", () => console.log("Error connection DB"));
connection.on("connected", () => console.log("Connect DB successful"))