// jshint esversion: 8

const config = require('./config.json');

const options = {
    options: {
        debug: true
    },
    connection: {
        reconnect: true
    },
    identity: {
        username: config.twitch.username,
        password: config.twitch.password
    },
    channels: []
};

module.exports = options;