// jshint esversion: 8

const config = require('./config.json');
const fs = require('fs-extra');
const https = require('https');

function getID(channelName) {
    const path = "channels/" + channelName + "?fields=id";
    const options = {
        host: 'https://mixer.com',
        path: `/api/v1/${path}`
    };
    let response = "";
    https.get(options, (res) => {
        if (res.statusCode !== 200) {
            console.error("Failed, Status: " + res.statusCode + " Headers: " + res.headers.toString());
            return;
        }
        const rawData = [];
        res.on('data', (chunk) => rawData.push(chunk));
        res.on('end', () => {
            try {
                var mixerjson = rawData.toString().replace(",,", ",");
                response = mixerjson;
            } catch (error) {
                console.error(`An error occurred parsing the API response to JSON, ${error}`);
            }
        });
    }).on('error', (error) => console.error(`Error occurred while polling Mixer API, ${error}`));
    let id = "";
    if (!response.includes("404")) {
        id = JSON.parse(response).id;
    } else {
        return;
    }
    return id;
}

function isLive(channelName) {
    const id = getID(channelName);
    const path = "channels/" + id + "/broadcast";
    const options = {
        host: 'https://mixer.com',
        path: `/api/v1/${path}`
    };
    let response = "";
    https.get(options, (res) => {
        if (res.statusCode !== 200) {
            console.error("Failed, Status: " + res.statusCode + " Headers: " + res.headers.toString());
            return;
        }
        const rawData = [];
        res.on('data', (chunk) => rawData.push(chunk));
        res.on('end', () => {
            try {
                var mixerjson = rawData.toString().replace(",,", ",");
                response = mixerjson;
            } catch (error) {
                console.error(`An error occurred parsing the API response to JSON, ${error}`);
            }
        });
    }).on('error', (error) => console.error(`Error occurred while polling Mixer API, ${error}`));
    if (!response.includes("404")) {
        return true;
    } else {
        return false;
    }
}

function liveCheck(channelName) {
    if (isLive(channelName)) {
        if (usersCooldown[channelName] === null || typeof usersCooldown[channelName] === undefined) {
            usersCooldown[channelName] = new Date();
            console.log("Adding to cooldown: " + usersCooldown);
            console.log(channelName + " is live!!!");
            client.channels.get(config.channels.mixerLive).send(channelName + " is now live! Check them out at https://www.mixer.com/" + channelName);
        } else {
            usersCooldown[channelName] = null;
        }
    }
}

//Add user to mixer list
function AddMixerStreamer(msg, channels) {
    var addedUser = msg.content.replace("!mixer ", "");
    console.log("Attemptimg to add " + addedUser + " to Mixer notifications.");
        var exists = false;
        for (i = 0; i < channels.length; i++) {
            if (channels[i] === ("#" + addedUser)) {
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