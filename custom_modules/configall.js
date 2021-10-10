const server = require('./config/server/config.js');
const puppeter = require('./config/config/puppeter.js');

module.exports = {
    server: server.config(),
    puppeter: puppeter,

}