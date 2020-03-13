// jshint esversion: 8

const config = require('./../config.json');
const fs = require('fs-extra');
const rp = require('request-promise');
const url = 'https://www.facebook.com/';
const liveButton = '<div class="_4r1w _69o5  _50f7 _2iem" role="heading" aria-level="4">LIVE</div>';

var usersCooldown = {};

function isLive(client, channelName) {
    let streamPage = url + channelName;
    rp(streamPage)
        .then(function (html) {
            if (html.includes(liveButton)) {
                if (usersCooldown[channelName] === null || typeof usersCooldown[channelName] === undefined) {
                    usersCooldown[channelName] = new Date();
                    console.log("Adding to cooldown: " + usersCooldown);
                    console.log(channelName + " is live!!!");
                    client.channels.get(config.channels.faceBookLive).send(channelName + " is now live! Check them out at https://www.facebook.com/" + channelName);
                }
            } else {
                usersCooldown[channelName] = null;
            }
        })
        .catch(function (err) {
            //handle error
            console.error("Couldn't grab Facebook site.");
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