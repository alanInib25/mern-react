const express = require("express");
const app = express();
const cors = require("cors");
const cookieParser = require("cookie-parser");
const upload = require("express-fileupload");
const path = require("path");
//config
const { URL_ORIGIN } = require("./utils/handleConfig.js");

//middleware
const notFound = require("./middleware/errorMiddleware.js");

//routes
const authRouter = require("./routes/auth.routes.js");
const usersRouter = require("./routes/users.routes.js");
const postsRouter = require("./routes/post.routes.js");

//cookie-parser
app.use(cookieParser());
//json
app.use(express.json());
//urlencode
app.use(express.urlencoded({ extended: false }));
//cors
app.use(
  cors({
    credentials: true,
    origin: URL_ORIGIN,
  })
);
//static
app.use(upload());
app.use("/uploads", express.static(path.join(__dirname, "/uploads")));
//routes
if (process.env.NODE_ENV === "test") {
  const testRouter = require("./controller/test.controllers.js");
  app.use("/api/testing", testRouter);
}
app.use("/api/auth", authRouter);
app.use("/api/users", usersRouter);
app.use("/api/posts", postsRouter);
app.use(notFound);

module.exports = app;
