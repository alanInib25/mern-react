const express = require("express");
const app = express();
const cors = require("cors");
const cookieParser = require("cookie-parser");
const upload = require("express-fileupload");
const path = require("path");

//middleware
const notFound = require("./middleware/errorMiddleware.js");

//routes
const authRouter = require("./routes/auth.routes.js");
const usersRouter = require("./routes/users.routes.js");

//cookie-parser
app.use(cookieParser());
//json
app.use(express.json())
//cors
app.use(cors({
  credentials: true,
}))
//static
app.use(upload());
app.use("/uploads", express.static(path.join(__dirname, "/uploads")));
//routes
app.use("/api/auth", authRouter);
app.use("/api/users", usersRouter);
app.use(notFound);




module.exports = app;