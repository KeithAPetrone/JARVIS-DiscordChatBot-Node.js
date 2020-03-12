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