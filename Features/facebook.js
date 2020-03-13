// jshint esversion: 8

const config = require('./../config.json');
const fs = require('fs-extra');
const url = 'https://www.facebook.com/pg/';
var request = require('request');
const liveButton1 = 'mc9kygYtHQ0.png';
const liveButton2 = 'lSMzfuVXCOB.png';

var usersCooldown = {};

async function fetchData(channelName) {
    let path = url + channelName + "/videos/";
    let streamHTML;
    streamHTML = await getHTML(path);
    return streamHTML;
}

function getHTML(path) {
    return new Promise((resolve) => {
        request(path, function (error, response, body) {
            if (error) {
                console.log("Error: " + error);
            }
            console.log(body);
            resolve(body);
        });
    });
}

function isLive(client, channelName) {
    fetchData(channelName).then((streamHTML) => {
        if (streamHTML.error) return;

        if (streamHTML.includes(liveButton1) || streamHTML.includes(liveButton2)) {
            if (usersCooldown[channelName] === null || typeof usersCooldown[channelName] === undefined) {
                usersCooldown[channelName] = new Date();
                console.log("Adding to cooldown: " + usersCooldown);
                console.log(channelName + " is live!!!");
                client.channels.get("675458066979880963").send(channelName + " is now live! Check them out at https://www.facebook.com/" + channelName);
            }
        } else {
            usersCooldown[channelName] = null;
        }
    });
}

//Add user to facebook list
function AddFacebookStreamer(msg, channels) {
    var addedUser = msg.content.replace("!facebook ", "");
    console.log("Attemptimg to add " + addedUser + " to Facebook notifications.");
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
        fs.writeFile(config.filePath + "facebook.txt", text, function (err) {
            if (err) {
                console.log(err);
            } else {
                console.log('Facebook File written!');
            }
        });
        console.log("User " + addedUser + " has been added to Facebook notifications.");
        msg.reply("Facebook user " + addedUser + " has been added.");
    } else {
        console.log("User " + addedUser + " has already been added to Facebook notifications.");
        msg.reply("Facebook user " + addedUser + " already exists!");
    }
    return channels;
}

//Remove user from facebook list
function RemoveFacebookStreamer(msg, channels) {
    var addedUser = msg.content.replace("!removefacebook ", "");
    console.log("Attemptimg to remove " + addedUser + " from Facebook notifications.");
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
        fs.writeFile(config.filePath + "facebook.txt", text, function (err) {
            if (err) {
                console.log(err);
            } else {
                console.log('Facebook File written!');
            }
        });
        msg.reply("Facebook user " + addedUser + " has been removed.");
    } else {
        console.log("Didn't see " + addedUser + " in the list.");
        msg.reply("Facebook user " + addedUser + " isn't in the list!");
    }
    return channels;
}

module.exports.isLive = isLive;