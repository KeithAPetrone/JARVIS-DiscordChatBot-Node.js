/**
 * @application JARVIS
 * @version 0.90
 * @author Keith Petrone
 * @email keithapetrone@gmail.com
 * @create date 2019-09-16 11:02:24
 * @modify date 2020-03-04 14:16:35
 * @desc JARVIS is a bot designed around assisting the Fortify Streaming communinity.
 */


const host = '0.0.0.0';
const port = process.env.PORT || 3000;

var app = require('http');
app.createServer().listen(port, host);

const Discord = require('discord.js');
const client = new Discord.Client();

const silver = 500;
const gold = 2500;
const diamond = 5000;

const options = require("./option"); //The options file

var users = {};

var usersCooldown = {};

var questionsOfTheDay = [];

var youtubers = {};

//Logging into Discord
client.on('ready', () => {
    let fs = require("fs-extra");
    console.log(`Discord: Logged in as ${client.user.tag}!`);
    users = JSON.parse(fs.readFileSync("C:/Users/keith/users.json"));
    console.log("Database has been loaded...");
    var text = fs.readFileSync("C:/Users/keith/questions.txt");
    var textByLine = text.toString().split("\n");
    questionsOfTheDay = textByLine;
    text = fs.readFileSync("C:/Users/keith/twitch.txt");
    textByLine = text.toString().split("\n");
    options.channels = textByLine;
    console.log("Twitch user list has been loaded...");
    youtubers = JSON.parse(fs.readFileSync("C:/Users/keith/users.json"));
    console.log("YouTube user list has been loaded...");
});

//!ping command should issue "Pong!" response.
client.on('message', msg => {
    if (msg.content === '!ping') {
        console.log('Received #' + msg.id + ': ' + msg.content);
        msg.reply('Pong!');
    }
});

//Every message should increase exp by 1 point.
client.on('message', msg => {
    let fs = require("fs-extra");
    console.log('Received #' + msg.id + ': ' + msg.content);
    var name = msg.author.tag.toString().toLowerCase();
    name = name.substring(0, name.length - 5);
    var pointsEarned = msg.content.split(' ').length;
    if (name in users) {
        if (typeof users[name.toString().toLowerCase()] === "undefined") {
            users[name.toString().toLowerCase()] = 0;
        }
        users[name.toString().toLowerCase()] += pointsEarned;
        console.log('Discord: ' + msg.author + ' gained a point');
    } else {
        users[name] = pointsEarned;
        console.log('Discord: ' + msg.author + ' is added to database and gained a point');
    }
    fs.writeFileSync("C:/Users/keith/users.json", JSON.stringify(users));
});

//Displays everyone's points to the chat.
client.on('message', msg => {
    if (msg.content === '!scoreboard') {
        console.log('Received #' + msg.id + ': ' + msg.content);
        msg.reply('Here are the results: ' + JSON.stringify(users));
        console.log('Discord: Here are the results: ' + JSON.stringify(users));
    } else if (msg.content === '!clearscores') {
        console.log('Received #' + msg.id + ': ' + msg.content);
        users = {};
        msg.reply('Scores have been wiped!');
        console.log('Discord: Scores have been wiped!');
    }
});

//Displays that user's rank and score.
client.on('message', msg => {
    if (msg.content === '!rank') {
        console.log('Received #' + msg.id + ': ' + msg.content);
        generateImage(msg.author.tag.toString().toLowerCase(), msg.channel);
    }
});

//Magic 8ball command
client.on('message', msg => {
    if (msg.content.includes('!8jarvis')) {
        console.log('Received #' + msg.id + ': ' + msg.content);
        var question = msg.content.replace("!8jarvis ", "");
        var response = "";
        if (msg.author.tag.toString().toLowerCase().includes("devil") || msg.author.tag.toString().toLowerCase().includes("bird") || msg.author.tag.toString().toLowerCase().includes("wist")) {
            response = "That's such a Wisty question.";
        } else {
            var responses = ["It is certain.", "It is decidedly so.", "Without a doubt.", "Yes - definitely.", "You may rely on it.", "As I see it, yes.", "Most likely.", "Outlook good.", "Yes.", "Signs point to yes.", "Reply hazy, try again.", "Ask again later.", "Better not tell you now.", "Cannot predict now.", "Concentrate and ask again.", "Don't count on it.", "My reply is no.", "My sources say no.", "Outlook not so good.", "Very doubtful.", "That's such a Wisty question."];
            var answer = responses[Math.floor(Math.random() * responses.length)];
            response = "You asked: " + question + " I say: " + answer;
        }
        msg.reply(response);
    }
});

//Question of the day override
client.on('message', msg => {
    if (msg.content === '!qod') {
        AskQuestion();
    }
});

//Add/Remove youtube user to announcements
client.on('message', msg => {
    if (msg.content.includes('!youtube')) {
        console.log('Received #' + msg.id + ': ' + msg.content);
        var addedYouTuber = msg.content.replace("!youtube ", "");
        var exists = false;
        for (i = 0; i < youtubers.length; i++) {
            if (youtubers[i].name == addedYouTuber) {
                exists = true;
            }
        }
        if (!exists) {
            AddYouTuber(addedYouTuber);
            console.log("User " + addedYouTuber + " has been added to YouTube notifications.")
            msg.reply("YouTube user " + addedYouTuber + " has been added.");
        } else {
            console.log("User " + addedYouTuber + " has already been added to YouTube notifications.")
            msg.reply("YouTube user " + addedYouTuber + " already exists!");
        }
    } else if (msg.content.includes('!removeyoutube')) {
        console.log('Received #' + msg.id + ': ' + msg.content);
        var removedYouTuber = msg.content.replace("!removeyoutube ", "");
        var exists = false;
        for (i = 0; i < youtubers.length; i++) {
            if (youtubers[i].name == removedYouTuber) {
                exists = true;
            }
        }
        if (!exists) {
            console.log("User " + removedYouTuber + " isn't in YouTube notifications.")
            msg.reply("YouTube user " + removedYouTuber + " isn't in notifications.");
        } else {
            RemoveYouTuber(removedYouTuber);
            console.log("User " + removedYouTuber + " has been removed from YouTube notifications.")
            msg.reply("YouTube user " + removedYouTuber + " has been removed!");
        }
    }
});

//Adds/Removes twitch streamer to the announcements.
client.on('message', msg => {
    if (msg.content.includes('!twitch')) {
        console.log('Received #' + msg.id + ': ' + msg.content);
        var addedUser = msg.content.replace("!twitch ", "");
        console.log("Attemptimg to add " + addedUser + " to Twitch notifications.")
        var exists = false;
        for (i = 0; i < options.channels.length; i++) {
            if (options.channels[i] === ("#" + addedUser)) {
                exists = true;
            }
        }
        if (!exists) {
            options.channels.push('#' + addedUser);
            var text = "";
            for (i = 0; i < options.channels.length; i++) {
                text += options.channels[i] + "\n";
            }
            let fs = require('fs');
            fs.writeFile("C:/Users/keith/twitch.txt", text, function (err) {
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
    } else if (msg.content.includes('!removetwitch')) {
        console.log('Received #' + msg.id + ': ' + msg.content);
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
            fs.writeFile("C:/Users/keith/twitch.txt", text, function (err) {
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
});

client.login('NjExMzAzODcwODUzMDIxNzM1.XVR9Ww.o3zYBezLAJMc3czYl7PPe7RwU_c');

const tmi = require("tmi.js");

var fs = require('fs');
var text = fs.readFileSync("C:/Users/keith/twitch.txt");
var textByLine = text.toString().split("\n");
options.channels = textByLine;

//Connect to twitch server
const client2 = new tmi.client(options);

client2.connect();


//on chat

client2.on("chat", (channel, userstate, message, self) => {

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
            if (userstate.username.toString().toLowerCase() in users) {
                users[userstate.username.toString().toLowerCase()]++;
                client2.say(channel, `@${userstate.username} Thanks for lurking!!!`);
                timeLurker(userstate, 1);
            } else {
                // users[userstate.username] = 1;
                // console.log('Twitch: ' + msg.author + ' has been added to the points database!');
                // console.log(users);
                client2.say(channel, `@${userstate.username} Thanks for lurking!!!`);
            }
        }

        if ((message.toLowerCase()).includes("!raid")) { //using string.includes is case-sensitive, so it is better to just make it lowercase
            if (userstate.username.toString().toLowerCase() in users) {
                users[userstate.username.toString().toLowerCase()]++;
                client2.say(channel, `@${userstate.username} RAIDING!!!`);
                timeLurker(userstate, 2);
            } else {
                // users[userstate.username] = 1;
                // console.log('Twitch: ' + msg.author + ' has been added to the points database!');
                // console.log(users);
                client2.say(channel, `@${userstate.username} You have been added to the points database on the Discord server!`);
            }
        }


        if ((message.toLowerCase()).includes("!badword")) {

            client2.ban("channel", userstate.username, "He wrote a bad word"); //this is a promise so you can add .then and .catch if you want

        }
    } catch (err) {
        console.log(err);
    }
});



////Maybe you want to advertise your youtube or facebook/twitter
//
//setInterval(() => {
//
//    client2.say("channel", "Heya, you should totally see my youtube. Or do you like what you se? Well you know what, subscribe then!");
//
//}, 300000); //Every 5 minute, your bot advertise your channel.
//

url = "https://api.twitch.tv/kraken/streams/";
twitchClientId = "thwzykk3l7cckshmybn0vwf0ijww85";
twitchClientSecret = "698iwyzok0qh9yr7nakj61yo33rsv5";

//Check if stream is live
//300000 is 5 minutes
setInterval(() => {
    for (i = 0; i < options.channels.length; i++) {
        var broadcaster = options.channels[i].toString();
        isLive(broadcaster);
    }
}, 10000);


//Question of the day logic
setInterval(function () {
    var hour = new Date().getHours()
    console.log("Checking the time... Hour is " + hour);
    if (hour === 14) {
        console.log("Time for Question of the Day!!!")
        AskQuestion();
    }
}, (1000 * 60 * 60));

/*
//Meme of the day logic
setTimeout(function(){
var keyword = "meme";

    $.getJSON("http://api.flickr.com/services/feeds/photos_public.gne?jsoncallback=?",
        {
            tags: keyword,
            tagmode: "any",
            format: "json"
        },
        function(data) {
            var rnd = Math.floor(Math.random() * data.items.length);

            var image_src = data.items[rnd]['media']['m'].replace("_m", "_b");

            client.channels.get("671054702632501248").send(image_src);
        });
}, (1000*60*60*24));
*/


//YouTube Functionality
var youtubeAPIKey = "AIzaSyAf-7Nul4BRCOTRGiYXaWltf3K2qRYFOG8";
var youtubeClientId = "939904848646-2b9u1nspaq3p544bb7mup386j29r3k6v.apps.googleusercontent.com";
var youtubeClientSecret = "ixDFoa5yJ_HZcWvp4hbfrWgl";

setInterval(() => {
    for (youtuber = 0; i < youtubers.length; youtuber++) {
        fetchVideo(client, youtuber);
    }
}, 10000);

setInterval(() => {
    for (youtuber = 0; youtuber < youtubers.length; youtuber++) {
        fetchStream(client, youtuber);
    }
}, 10000);


// Polls API and checks if there is a new video release
function fetchVideo(client, youtuber) {
    if (!youtubers[youtuber].latestVideo) return setLatestVideo(youtuber);

    fetchData().then((videoInfo) => {
        if (videoInfo.error) return;
        if (videoInfo.items[0].snippet.resourceId.videoId !== latestVideo) {

            const path = `channels?part=snippet&id=${youtubers[youtuber].name}&key=${youtubeAPIKey}`;
            callAPI(path).then((channelInfo) => {
                if (channelInfo.error) return;

                sendVideoAnnouncement(client, videoInfo, channelInfo);
                latestVideo = videoInfo.items[0].snippet.resourceId.videoId;
            });
        }
    });
}

// At start of the bot, fetches the latest video which is compared to if an announcement needs to be sent
function setLatestVideo(youtuber) {
    fetchData(youtuber).then((videoInfo) => {
        if (videoInfo.error) return;

        youtubers[youtuber].latestVideo = videoInfo.items[0].snippet.resourceId.videoId;
        fs.writeFileSync("C:/Users/keith/youtube.json", JSON.stringify(youtubers));
    });
}

// Fetches data required to check if there is a new video release
async function fetchData(youtuber) {
    let path = `channels?part=contentDetails&id=${youtubers[youtuber].name}&key=${youtubeAPIKey}`;
    const channelContent = await callAPI(path);

    path = `playlistItems?part=snippet&maxResults=1&playlistId=${channelContent.items[0].contentDetails.relatedPlaylists.uploads}&key=${youtubeAPIKey}`;
    const videoInfo = await callAPI(path);

    return videoInfo;
}

// Constructs a MessageEmbed and sends it to new video announcements channel
function sendVideoAnnouncement(client, videoInfo, channelInfo) {
    // Regex to cut off the video description at the last whole word at 237 characters
    const description = (videoInfo.items[0].snippet.description).replace(/^([\s\S]{237}[^\s]*)[\s\S]*/, '$1');

    const embed = new Discord.MessageEmbed()
        .setAuthor(`${channelInfo.items[0].snippet.title} has uploaded a new YouTube video!`, channelInfo.items[0].snippet.thumbnails.high.url)
        .setTitle(videoInfo.items[0].snippet.title)
        .setURL(`https://www.youtube.com/watch?v=${videoInfo.items[0].snippet.resourceId.videoId}`)
        .setDescription(`${description}...\n\n[**Watch the video here!**](https://www.youtube.com/watch?v=${videoInfo.items[0].snippet.resourceId.videoId})`)
        .setColor('#FF0000')
        .setImage(videoInfo.items[0].snippet.thumbnails.maxres.url)
        .setFooter(`Powered by ${client.user.username}`, client.user.avatarURL())
        .setTimestamp(new Date(videoInfo.items[0].snippet.publishedAt));

    return client.channels.get("671051742128898053").send(embed);
}

// Polls API and checks whether channel is currently streaming
function fetchStream(client, youtuber) {
    const path = `search?part=snippet&channelId=${youtubers[youtuber].name}&maxResults=1&eventType=live&type=video&key=${config.youtube.APIkey}`;

    callAPI(path).then((streamInfo) => {
        if (streamInfo.error || !streamInfo.items[0]) return;
        if (streamID === streamInfo.items[0].id.videoId) return;

        streamID = streamInfo.items[0].id.videoId;
        sendStreamAnnouncement(client, streamInfo);
    });
}

// Constructs a MessageEmbed and sends it to livestream announcements channel
function sendStreamAnnouncement(client, streamInfo) {
    // Regex to cut off the video description at the last whole word at 237 characters
    const description = (streamInfo.items[0].snippet.description).replace(/^([\s\S]{237}[^\s]*)[\s\S]*/, '$1');

    const embed = new Discord.MessageEmbed()
        .setAuthor(`${streamInfo.items[0].snippet.channelTitle} is now LIVE on YouTube!`)
        .setTitle(streamInfo.items[0].snippet.title)
        .setURL(`https://www.youtube.com/watch?v=${streamInfo.items[0].id.videoId}`)
        .setDescription(`${description}...\n\n[**Watch the stream here!**](https://www.youtube.com/watch?v=${streamInfo.items[0].id.videoId})`)
        .setColor('#FF0000')
        .setImage(streamInfo.items[0].snippet.thumbnails.high.url)
        .setFooter(`Powered by ${client.user.username}`, client.user.avatarURL())
        .setTimestamp(new Date(streamInfo.items[0].snippet.publishedAt));

    return client.channels.get("671051742128898053").send(embed);
}

// Template HTTPS get function that interacts with the YouTube API, wrapped in a Promise
function callAPI(path) {
    return new Promise((resolve) => {

        const options = {
            host: 'www.googleapis.com',
            path: `/youtube/v3/${path}`
        };

        https.get(options, (res) => {
            if (res.statusCode !== 200) return;

            const rawData = [];
            res.on('data', (chunk) => rawData.push(chunk));
            res.on('end', () => {
                try {
                    resolve(JSON.parse(rawData));
                } catch (error) {
                    console.error(`An error occurred parsing the API response to JSON, ${error}`);
                }
            });

        }).on('error', (error) => console.error(`Error occurred while polling YouTube API, ${error}`));
    });
}

//Add user to youtube list
function AddYouTuber(name) {
    var youtuber = undefined;
    youtuber.name = name;
    youtubers.push(youtuber);
    fs.writeFileSync("C:/Users/keith/youtube.json", JSON.stringify(youtubers));
}

//Remove user from youtube list
function RemoveYouTuber(name) {
    for (i = 0; i < youtubers.length; i++) {
        if (youtubers[i].name == name) {
            youtubers = youtubers.splice(i, 1);
        }
    }
    fs.writeFileSync("C:/Users/keith/youtube.json", JSON.stringify(youtubers));
}

function AskQuestion() {
    var qod = questionsOfTheDay.pop().toString();
    console.log("Here's the question of the day: " + qod);
    client.channels.get("683773761102807089").send(qod);
    var text = "";
    for (i = 0; i < questionsOfTheDay.length; i++) {
        text += questionsOfTheDay[i] + "\n";
    }
    let fs = require('fs');
    fs.writeFile("C:/Users/keith/questions.txt", text, function (err) {
        if (err) {
            console.log(err);
        } else {
            console.log('Questions File written!');
        }
    });
}

/**
 * Times how long someone is lurking in a Twitch live stream.
 *
 * @param {string} lurker
 * @param {number} multiplier
 */
function timeLurker(lurker, multiplier) {
    console.log(lurker.username + " is now lurking. Timing them now.");
    var lurking = true;
    while (lurking) {
        setInterval(function () {
            if (isLurking(lurker)) {
                users[lurker.username.toString().toLowerCase()] += (1 * multiplier);
            } else {
                lurking = false;
            }
        }, 60000);
    }
}

/**
 * Checks to verify that a user is or still is lurking.
 *
 * @param {string} lurker
 * @returns {boolean}
 */
function isLurking(lurker) {
    var info = "";
    var request = require("request");

    request("https://tmi.twitch.tv/group/user/" + streamer + "/chatters", function (error, response, body) {
        info = JSON.stringify(body);
    });

    if (info != null) {
        if (info.toLowerCase.includes(lurker.username.toString().toLowerCase())) {
            return true;
        }
    }

    return false;
}

/**
 * Checks if Twitch channel went live and announces it to the Discord channel if true.
 *
 * @param {string} channelName
 */
function isLive(channelName) {
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
/**
 * Takes in channel name and uses it to generate custom badge banner from their info.
 *
 * @param {string} discordName
 * @returns Gulp output. May be useful for logging.
 */
function generateImage(discordName, replyChannel) {
    console.log("Customizing HTML for " + discordName);
    customizeHTML(discordName);

    console.log("Generating image for " + discordName);
    const gulp = require("gulp");
    const puppeteer = require("puppeteer");
    const tap = require("gulp-tap");
    const fs = require("fs");
    let path = require("path");

    return gulp.src([discordName.substring(0, discordName.length - 5) + ".html"])
        .pipe(tap(async (file) => {
            const browser = await puppeteer.launch({
                headless: true
            });
            const page = await browser.newPage();
            await page.setViewport({
                width: 950,
                height: 300,
                deviceScaleFactor: 1,
            });
            console.log("set viewport");
            await page.goto(file.path);
            await page.screenshot({
                path: path.basename(file.basename, ".html") + ".png"
            });
            console.log("Sending file for " + discordName);
            await replyChannel.send("Here is your rank:", {
                files: [discordName.substring(0, discordName.length - 5) + ".png"]
            });
            fs.unlinkSync(discordName.substring(0, discordName.length - 5) + ".png");
            fs.unlinkSync(discordName.substring(0, discordName.length - 5) + ".html");
            await browser.close();
        }));
}
/**
 * Generates a custom html page for the user.
 *
 * @param {string} discordName
 */
function customizeHTML(discordName) {
    console.log("Writing custom HTML for " + discordName);

    let fs = require("fs-extra");
    let path = require("path");

    var file = fs.readFileSync(path.join(__dirname, "badgeBanner.html"), "utf8");

    file = file.replace("{{NAME}}", discordName.substring(0, discordName.length - 5));

    var name = discordName.substring(0, discordName.length - 5);
    var centering = 300;

    file = file.replace("class=\"name\" style=\"left: 300px;\"", "class=\"name\" style=\"left: " + centering + "px;\"")

    var points = users[discordName.substring(0, discordName.length - 5).toString().toLowerCase()];
    if (users === undefined || points === undefined || typeof points === "undefined" || points.toString() == "undefined" || points == null) {
        points = "0";
    }
    file = file.replace("{{POINTS}}", points);
    var cap = 500;
    var rank = "BRONZE";
    if (users[discordName.substring(0, discordName.length - 5).toString().toLowerCase()] >= diamond) {
        cap = "MAXED";
        rank = "DIAMOND";
        file = file.replace("id=\"diamond\" style=\"display: none;\"", "id=\"diamond\"");
    } else if (users[discordName.substring(0, discordName.length - 5).toString().toLowerCase()] >= gold) {
        cap = "5000";
        rank = "GOLD";
        file = file.replace("id=\"gold\" style=\"display: none;\"", "id=\"gold\"");
    } else if (users[discordName.substring(0, discordName.length - 5).toString().toLowerCase()] >= silver) {
        cap = "2500";
        rank = "SILVER";
        file = file.replace("id=\"silver\" style=\"display: none;\"", "id=\"silver\"");
    } else {
        file = file.replace("id=\"bronze\" style=\"display: none;\"", "id=\"bronze\"");
    }
    file = file.replace("{{CAP}}", cap);
    file = file.replace("{{RANK}}", rank);

    fs.writeFile("C:/Users/keith/" + discordName.substring(0, discordName.length - 5) + ".html", file, "utf8");
    console.log("Created html file");
}