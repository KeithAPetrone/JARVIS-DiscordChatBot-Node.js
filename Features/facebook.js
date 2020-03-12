// jshint esversion: 8

const config = require('./config.json');
const fs = require('fs-extra');
const rp = require('request-promise');
const url = 'https://www.facebook.com/';
const liveButton = '<div class="_4r1w _69o5  _50f7 _2iem" role="heading" aria-level="4">LIVE</div>';

var usersCooldown = {};

function isLive(client, channelName, broadcaster) {
    let streamPage = url + channelName;
    let streamHTML;
    rp(streamPage)
        .then(function (html) {
            streamHTML = html;
        })
        .catch(function (err) {
            console.log("Unable to get HTML for " + channelName + ": " + err);
        });
    if (streamHTML.includes(liveButton)) {
        if (usersCooldown[channelName] === null || typeof usersCooldown[channelName] === undefined) {
            usersCooldown[channelName] = new Date();
            console.log("Adding to cooldown: " + usersCooldown);
            console.log(channelName + " is live!!!");
            client.channels.get(config.channels.faceBook).send(channelName + " is now live! Check them out at https://www.facebook.com/" + channelName);
        }
    } else {
        usersCooldown[channelName] = null;
    }
}