const http = require("http");
const app = require("./app.js");
//config
const { PORT } = require("./utils/handleConfig.js");
//server
const server = http.createServer(app);
server.listen(PORT, () => {
  console.log(`listen on port ${PORT}`);
  //db connection
  require("./db.js");
});