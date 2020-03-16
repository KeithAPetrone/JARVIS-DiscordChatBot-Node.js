// jshint esversion: 8

const config = require('./../config.json');
const fs = require('fs-extra');
const https = require('https');
const Mixer = require('@mixer/client-node');
const ws = require('ws');

var usersCooldown = {};

async function isLive(channelName) {
    let path = channelName + "?fields=id";
    let response = await callAPI(path);
    const id = response.id;
    path = id + "/broadcast";
    response = await callAPI(path);
    if (response.online) {
        return true;
    } else {
        return false;
    }
}

/**
 * Creates a Mixer chat socket and authenticates
 * @param {number} userId The user to authenticate as
 * @param {number} channelId The channel id of the channel you want to join
 * @returns {Promise.<>}
 */
async function joinChat(client, userId, channelId) {
    const joinInformation = await getConnectionInformation(client, channelId);
    // Chat connection
    const socket = new Mixer.Socket(ws, joinInformation.endpoints).boot();

    return socket.auth(channelId, userId, joinInformation.authkey).then(() => socket);
}

async function fetchID(channelName) {
    let path = channelName + "?fields=id";
    let response = await callAPI(path);
    const id = response.id;
    return id;
}

function liveCheck(client, channelName) {
    isLive(channelName).then((live) => {
        if (live.error) return;
        
        if (live) {
            if (usersCooldown[channelName] === null || typeof usersCooldown[channelName] === undefined) {
                usersCooldown[channelName] = new Date();
                console.log("Adding to cooldown: " + usersCooldown);
                console.log(channelName + " is live!!!");
                client.channels.get(config.channels.mixerLive).send(channelName + " is now live! Check them out at https://www.mixer.com/" + channelName);
            } else {
                usersCooldown[channelName] = null;
            }
        }
    });
}

//Add user to mixer list
function AddMixerStreamer(msg, channels) {
    var addedUser = msg.content.replace("!mixer ", "");
    console.log("Attemptimg to add " + addedUser + " to Mixer notifications.");
    var exists = false;
    for (i = 0; i < channels.length; i++) {
        if (channels[i] === (addedUser)) {
            exists = true;
        }
    }
    if (!exists) {
        channels.push('#' + addedUser);
        var text = "";
        for (i = 0; i < channels.length; i++) {
            text += channels[i] + "\n";
        }
        fs.writeFile(config.filePath + "mixer.txt", text, function (err) {
            if (err) {
                console.log(err);
            } else {
                console.log('Mixer File written!');
            }
        });
        console.log("User " + addedUser + " has been added to Mixer notifications.");
        msg.reply("Mixer user " + addedUser + " has been added.");
    } else {
        console.log("User " + addedUser + " has already been added to Mixer notifications.");
        msg.reply("Mixer user " + addedUser + " already exists!");
    }
    return channels;
}

//Remove user from mixer list
function RemoveMixerStreamer(msg, channels) {
    var addedUser = msg.content.replace("!removemixer ", "");
    console.log("Attemptimg to remove " + addedUser + " from Mixer notifications.");
    var exists = false;
    var placement = 0;
    for (i = 0; i < channels.length; i++) {
        if (channels[i].toLowerCase().includes(addedUser.toLowerCase())) {
            console.log("Found " + addedUser + " in the list.");
            exists = true;
            placement = i;
        }
    }
    if (exists) {
        channels.splice(placement, 1);
        var text = "";
        for (i = 0; i < channels.length; i++) {
            text += channels[i] + "\n";
        }
        fs.writeFile(config.filePath + "mixer.txt", text, function (err) {
            if (err) {
                console.log(err);
            } else {
                console.log('Mixer File written!');
            }
        });
        msg.reply("Mixer user " + addedUser + " has been removed.");
    } else {
        console.log("Didn't see " + addedUser + " in the list.");
        msg.reply("Mixer user " + addedUser + " isn't in the list!");
    }
    return channels;
}

function handleCommand(socket, data) {
    //ping command
    if (data.message.message[0].data.toLowerCase().startsWith('!ping')) {
        // Respond with pong
        socket.call('msg', [`@${data.user_name} PONG!`]);
        console.log(`Ponged ${data.user_name}`);
    }
}

// Template HTTPS get function that interacts with the Mixer API, wrapped in a Promise
function callAPI(path) {
    return new Promise((resolve) => {
        const options = {
            host: 'mixer.com',
            path: `/api/v1/channels/${path}`
        };

        https.get(options, (res) => {
            if (res.statusCode !== 200) {
                if (res.statusCode === 404) {
                    resolve(false);
                } else {
                    return;
                }
            }
            const rawData = [];
            res.on('data', (chunk) => rawData.push(chunk));
            res.on('end', () => {
                try {
                    var ytjson = rawData.toString().replace(",,", ",");
                    resolve(JSON.parse(ytjson));
                } catch (error) {
                    console.error(`An error occurred parsing the API response to JSON, ${error}`);
                }
            });

        }).on('error', (error) => console.error(`Error occurred while polling Mixer API, ${error}`));
    });
}

/**
 * Gets connection information from Mixer's chat servers
 * @param {Number} channelId The channelId of the channel you'd like to
 *  get connection information for.
 * @returns {Promise.<>}
 */
async function getConnectionInformation(client, channelId) {
    return new Mixer.ChatService(client).join(channelId).then(response => response.body);
}

/* Gets our Currently Authenticated Mixer user's information. This returns an object
 * full of useful information about the user whose OAuth Token we provided above.
 */
async function getUserInfo(client) {
    // Users Current will return information about the user who owns the OAuth
    // token registered above.
    return client.request('GET', 'users/current').then(response => response.body);
}

module.exports.liveCheck = liveCheck;
module.exports.fetchID = fetchID;
module.exports.handleCommand = handleCommand;
module.exports.joinChat = joinChat;
module.exports.getUserInfo = getUserInfo;
module.exports.AddMixerStreamer = AddMixerStreamer;
module.exports.RemoveMixerStreamer = RemoveMixerStreamer;