const { config } = require("dotenv");
config();

module.exports = {
  PORT: process.env.PORT,
  DB_CONN: process.env.DB_CONN,
  JWT_PASS: process.env.JWT_PASS,
  NODEMAILER_EMAIL: process.env.NODEMAILER_EMAIL,
  NODEMAILER_EMAIL_PASS: process.env.NODEMAILER_EMAIL_PASS,
};
