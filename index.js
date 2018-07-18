var db = require('./src/db');
var server = require('./src/server');

db.connect(server.start);
