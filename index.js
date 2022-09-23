const api = require("@electricg/hapi-mongodb-server");
const config = require("./src/config");
const routes = require("./src/routes");

const settings = {
  db: {
    uri: config.get("mongodbUrl")
  },
  server: {
    port: config.get("port"),
    host: config.get("host"),
    origin: config.get("allowedOrigins"),
    routes
  }
};

api.start(settings);
