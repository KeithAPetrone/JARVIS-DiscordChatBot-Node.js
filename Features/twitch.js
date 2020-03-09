var usersCooldown = {};

/**
 * Checks if Twitch channel went live and announces it to the Discord channel if true.
 *
 * @param {string} channelName
 */
function isLive(client, channelName) {
    var response;

    var api = require('twitch-api-v5');

    api.clientID = twitchClientId;

    api.users.usersByName({
        users: channelName.substring(1, channelName.length)
    }, (err, res) => {
        if (err) {
            return false;
        } else {
            response = JSON.stringify(res);
            var id = res.users[0]["_id"];
            api.streams.channel({
                channelID: id
            }, (err, res) => {
                if (err) {
                    console.log("Get Channel Info Error: " + err);
                } else {
                    response = JSON.stringify(res);
                    if (JSON.parse(response).stream === null || JSON.parse(response).stream === undefined) {
                        usersCooldown[channelName.substring(1, channelName.length)] = null;
                        return false;
                    } else {
                        if (usersCooldown[channelName.substring(1, channelName.length)] === null || typeof usersCooldown[channelName.substring(1, channelName.length)] === undefined) {
                            usersCooldown[channelName.substring(1, channelName.length)] = new Date();
                            console.log("Adding to cooldown: " + usersCooldown);
                            console.log(channelName + " is live!!!");
                            client.channels.get("671051742128898053").send(channelName.substring(1, channelName.length) + " is now live! Check them out at https://www.twitch.tv/" + channelName.substring(1, channelName.length));
                            return true;
                        }
                    }
                }
            });
        }
    });
}

//Add user to twitch list
function AddTwitchStreamer(msg, channels) {
    var addedUser = msg.content.replace("!twitch ", "");
    console.log("Attemptimg to add " + addedUser + " to Twitch notifications.")
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
            let fs = require('fs');
            fs.writeFile("C:/Users/kpetrone/twitch.txt", text, function (err) {
                if (err) {
                    console.log(err);
                } else {
                    console.log('Twitch File written!');
                }
            });
            console.log("User " + addedUser + " has been added to Twitch notifications.")
            msg.reply("Twitch user " + addedUser + " has been added.");
        } else {
            console.log("User " + addedUser + " has already been added to Twitch notifications.")
            msg.reply("Twitch user " + addedUser + " already exists!");
        }
    return channels;
}

//Remove user from twitch list
function RemoveTwitchStreamer(id) {
    var addedUser = msg.content.replace("!removetwitch ", "");
        console.log("Attemptimg to remove " + addedUser + " from Twitch notifications.")
        var exists = false;
        var placement = 0;
        for (i = 0; i < options.channels.length; i++) {
            if (options.channels[i].toLowerCase().includes(addedUser.toLowerCase())) {
                console.log("Found " + addedUser + " in the list.")
                exists = true;
                placement = i;
            }
        }
        if (exists) {
            options.channels.splice(placement, 1);
            var text = "";
            for (i = 0; i < options.channels.length; i++) {
                text += options.channels[i] + "\n";
            }
            let fs = require('fs');
            fs.writeFile("C:/Users/kpetrone/twitch.txt", text, function (err) {
                if (err) {
                    console.log(err);
                } else {
                    console.log('Twitch File written!');
                }
            });
            msg.reply("Twitch user " + addedUser + " has been removed.");
        } else {
            console.log("Didn't see " + addedUser + " in the list.")
            msg.reply("Twitch user " + addedUser + " isn't in the list!");
        }
}