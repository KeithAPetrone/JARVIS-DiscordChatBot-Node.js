// jshint esversion: 8

const fs = require('fs-extra');
const config = require('./../config.json');
const api = require('twitch-api-v5');

var usersCooldown = {};

/**
 * Checks if Twitch channel went live and announces it to the Discord channel if true.
 *
 * @param {string} channelName
 */
function isLive(client, channelName) {
    var response;

    api.clientID = config.twitch.clientID;

    api.users.usersByName({
        users: channelName.substring(1, channelName.length)
    }, (err, res) => {
        if (err) {
            return false;
        } else {
            response = JSON.stringify(res);
            var id = res.users[0]._id;
            api.streams.channel({
                channelID: id
            }, (err, res) => {
                if (err) {
                    console.log("Get Channel Info Error: " + err);
                } else {
                    response = JSON.stringify(res);
                    if (JSON.parse(response).stream === null || JSON.parse(response).stream === undefined) {
                        usersCooldown[channelName.substring(1, channelName.length)] = null;
                    } else {
                        if (usersCooldown[channelName.substring(1, channelName.length)] === null || typeof usersCooldown[channelName.substring(1, channelName.length)] === undefined) {
                            usersCooldown[channelName.substring(1, channelName.length)] = new Date();
                            console.log("Adding to cooldown: " + usersCooldown);
                            console.log(channelName + " is live!!!");
                            client.channels.get(config.channels.twitchLive).send(channelName.substring(1, channelName.length) + " is now live! Check them out at https://www.twitch.tv/" + channelName.substring(1, channelName.length));
                        }
                    }
                }
            });
        }
    });
    return usersCooldown;
}

//Add user to twitch list
function AddTwitchStreamer(msg, channels) {
    var addedUser = msg.content.replace("!twitch ", "");
    console.log("Attemptimg to add " + addedUser + " to Twitch notifications.");
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
            fs.writeFile(config.filePath + "twitch.txt", text, function (err) {
                if (err) {
                    console.log(err);
                } else {
                    console.log('Twitch File written!');
                }
            });
            console.log("User " + addedUser + " has been added to Twitch notifications.");
            msg.reply("Twitch user " + addedUser + " has been added.");
        } else {
            console.log("User " + addedUser + " has already been added to Twitch notifications.");
            msg.reply("Twitch user " + addedUser + " already exists!");
        }
    return channels;
}

//Remove user from twitch list
function RemoveTwitchStreamer(msg, channels) {
    var addedUser = msg.content.replace("!removetwitch ", "");
        console.log("Attemptimg to remove " + addedUser + " from Twitch notifications.");
        var exists = false;
        var placement = 0;
        for (i = 0; i < options.channels.length; i++) {
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
            fs.writeFile(config.filePath + "twitch.txt", text, function (err) {
                if (err) {
                    console.log(err);
                } else {
                    console.log('Twitch File written!');
                }
            });
            msg.reply("Twitch user " + addedUser + " has been removed.");
        } else {
            console.log("Didn't see " + addedUser + " in the list.");
            msg.reply("Twitch user " + addedUser + " isn't in the list!");
        }
}

function handleCommand(channel, userstate, message, self, users) {
    try {
        // file not presenet
        //var data = fs.readFileSync('sample.html');

        //channel is which channel it comes from. Not very usable if you are in one channel only.

        //Userstate is an object which contains a lot of information, if the user who wrote is a subscriber, what emotes he used etc.

        //message is the message itself.

        //self is your bot. 

        if (self) return; //If your bot wrote something, then ignore it because you dont want to listen to your own messages

        if ((message.toLowerCase()).includes("!ping")) { //using string.includes is case-sensitive, so it is better to just make it lowercase

            client2.say(channel, `@${userstate.username} Pong!!!`);
            console.log("Twitch: Pong!!!");
        }

        if ((message.toLowerCase()).includes("!lurk")) { //using string.includes is case-sensitive, so it is better to just make it lowercase
            client2.say(channel, `@${userstate.username} Thanks for lurking!!!`);
        }

        if ((message.toLowerCase()).includes("!raid")) { //using string.includes is case-sensitive, so it is better to just make it lowercase
            client2.say(channel, `@${userstate.username} Thank you for the raid!!!`);
        }
    } catch (err) {
        console.log(err);
    }
    return users;
}

module.exports.isLive = isLive;
module.exports.handleCommand = handleCommand;
module.exports.AddTwitchStreamer = AddTwitchStreamer;
module.exports.RemoveTwitchStreamer = RemoveTwitchStreamer;