/**
 * @application JARVIS
 * @version 0.75
 * @author Keith Petrone
 * @email keithapetrone@gmail.com
 * @create date 2019-09-16 11:02:24
 * @modify date 2020-02-09 16:09:35
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

var users = {};

var usersCooldown = {};

var questionsOfTheDay = [];

//Logging into Discord
client.on('ready', () => {
    let fs = require("fs-extra");
    console.log(`Discord: Logged in as ${client.user.tag}!`);
    users = JSON.parse(fs.readFileSync("C:/Users/keith/users.json"));
    console.log("Database has been loaded...");
    options.channels = JSON.parse(fs.readFileSync("C:/Users/keith/twitch.json"));
    console.log("Twitch user list has been loaded...");
    let fs = require("fs");
    var text = fs.readFileSync("C:/Users/keith/questions.txt");
    var textByLine = text.split("\n");
    questionsOfTheDay = textByLine;
    console.log("Questions of the day have been loaded...");
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
            if (typeof users[name.toString().toLowerCase()] === "undefined")
            {
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

client.on('message', msg => {
    if (msg.content === '!lurk') {
        console.log('Received #' + msg.id + ': ' + msg.content);
        var name = msg.author.tag.toString().toLowerCase();
        name = name.substring(0, name.length - 5);
        if (name in users) {
            users[name]++;
            msg.reply(msg.author + ' is lurking!!!');
            console.log('Discord: ' + msg.author + ' is lurking!!!');
        } else {
            users[name] = 1;
            msg.reply(msg.author + ' is lurking!!!');
            console.log('Discord: ' + msg.author + ', you have been added to the database!');
        }
    }
});

client.on('message', msg => {
    if (msg.content === '!raid') {
        console.log('Received #' + msg.id + ': ' + msg.content);
        if (msg.member.roles.find(r => r.name === "Admin") || msg.member.roles.find(r => name === "Mod" || msg.member.roles.find(r => name === "N3RDS"))) {
            var name = msg.author.tag.toString().toLowerCase();
            name = name.substring(0, name.length - 5);
            //Supposed to be a double points version of !lurk
        } else {
            msg.reply(msg.author + ', you do not have permission to do that!');
            console.log('Discord: ' + msg.author + ', you do not have permission to do that!');
        }
    }
});

//Displays everyone's points to the chat.
client.on('message', msg => {
    if (msg.content === '!scoreboard') {
        console.log('Received #' + msg.id + ': ' + msg.content);
        msg.reply('Here are the results: ' + JSON.stringify(users));
        console.log('Discord: Here are the results: ' + JSON.stringify(users));
    }
});

//Wipes the scores completely.
client.on('message', msg => {
    if (msg.content === '!clearscores') {
        console.log('Received #' + msg.id + ': ' + msg.content);
        users = {};
        msg.reply('Scores have been wiped!');
        console.log('Discord: Scores have been wiped!');
    }
});

//Shows everyone's score, as well as rank.
client.on('message', msg => {
    if (msg.content === '!leaderboard') {
        console.log('Received #' + msg.id + ': ' + msg.content);
        var response = "Here is the leaderboard: ";
        var leaderboard = [];
        console.log("Looping through users...");
        for (var user in users) {
            if (users.hasOwnProperty(user)) {
                var participant = {};
                var name = user;
                console.log("Entry: ");
                console.log("Name is " + user);
                var points = users[user];
                console.log("Points are " + points);
                var rank = "BRONZE";
                var display = 500;
                if (points >= diamond) {
                    rank = "DIAMOND";
                    display = "MAX";
                } else if (points >= gold) {
                    rank = "GOLD";
                    display = 5000;
                } else if (points >= silver) {
                    rank = "SILVER";
                    display = 2500;
                }
                console.log("Rank is " + rank);
                participant.name = name;
                participant.points = points;
                participant.rank = rank;
                participant.display = display;
                console.log("Participant added: " + JSON.stringify(participant));
                leaderboard.push(participant);
            }
        }
        if (leaderboard.length > 0) {
            console.log("All participants ready: " + JSON.stringify(leaderboard));
            response += makeLeaderboard(leaderboard);
            msg.reply(response);
        } else {
            response = "There is nobody on the leaderboard yet!";
        }
        response += makeLeaderboard(leaderboard);
        msg.reply(response);
        console.log("Discord: " + response);
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
    if (msg.content === '!8jarvis') {
        console.log('Received #' + msg.id + ': ' + msg.content);
        var question = msg.content.replace("!8jarvis ", "");
        var responses = ["It is certain.", "It is decidedly so.", "Without a doubt.", "Yes - definitely.", "You may rely on it.", "As I see it, yes.", "Most likely.", "Outlook good.", "Yes.", "Signs point to yes.", "Reply hazy, try again.", "Ask again later.", "Better not tell you now.", "Cannot predict now.", "Concentrate and ask again.", "Don't count on it.", "My reply is no.", "My sources say no.", "Outlook not so good.", "Very doubtful.", "That's such a Wisty question."];
        var answer = responses[Math.floor(Math.random() * responses.length)];
        var response = "You asked: " + question + " I say: " + answer;
        msg.reply(response);
    }
});

//Adds twitch streamer to the announcements.
client.on('message', msg => {
    if (msg.content.includes('!twitch')) {
        if (msg.member.roles.find(r => r.name === "Admin") || msg.member.roles.find(r => name === "Mod" || msg.member.roles.find(r => name === "N3RDS"))) {
            console.log('Received #' + msg.id + ': ' + msg.content);
            var addedUser = msg.content.replace("!twitch ", "");
            var exists = false;
            for (i = 0; i < options.channels.length; i++) {
                if (options.channels[i] === ("#" + addedUser)) {
                    exists = true;
                }
            }
            if (!exists) {
                options.channels.push('#' + addedUser);
                fs.writeFileSync("C:/Users/keith/twitch.json", JSON.stringify(options.channels));
                msg.reply("Twitch user " + addedUser + " has been added.");
            } else {
                msg.reply("Twitch user " + addedUser + " is already in the list.");
            }
        } else {
            msg.reply("You don't have necessary privileges to use this command.");
        }
    }
});

//Removes twitch streamer from the announcements.
client.on('message', msg => {
    if (msg.content.includes('!removetwitch')) {
        if (msg.member.roles.find(r => r.name === "Admin") || msg.member.roles.find(r => name === "Mod" || msg.member.roles.find(r => name === "N3RDS"))) {
            console.log('Received #' + msg.id + ': ' + msg.content);
            var addedUser = msg.content.replace("!twitch ", "");
            var exists = false;
            for (i = 0; i < options.channels.length; i++) {
                if (options.channels[i] === ("#" + addedUser)) {
                    arr.splice(i, 1); 
                    fs.writeFileSync("C:/Users/keith/twitch.json", JSON.stringify(options.channels));
                    msg.reply("Twitch user " + addedUser + " has been removed.");
                } else {
                    msg.reply("Twitch user " + addedUser + " isn't in the list.");
                }
            }
        } else {
            msg.reply("You don't have necessary privileges to use this command.");
        }
    }
});

client.login('NjExMzAzODcwODUzMDIxNzM1.XVR9Ww.o3zYBezLAJMc3czYl7PPe7RwU_c');

const tmi = require("tmi.js");

const options = require("./option"); //The options file


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
    for (i = 0; i < options.channels.length; i++)
    {
        var broadcaster = options.channels[i].toString();
        isLive(broadcaster);
    }
}, 10000);


//Question of the day logic
setTimeout(function(){
    var qod = questionsOfTheDay.pop;
    client.channels.get("683773761102807089").send(qod);
    var text = "";
    for (i = 0; i < qod.length; i++) {
        text += qod[i] + "\n";
    }
    let fs = require('fs');
    fs.writeFile("C:/Users/keith/questions.txt", text, function(err){
        if(err) {
            console.log(err);
        } else {
            console.log('Questions File written!');
        }
    });
}, (1000*60*60*24));

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

/**
 * Creates the leaderboard and sorts it so the users with the highest scores are first.
 *
 * @param {string[]} leaderboard
 * @returns {string[]} (The sorted leaderboard)
 */
function makeLeaderboard(leaderboard) {
    console.log("Making Leaderboard...");
    console.log(JSON.stringify(leaderboard));
    var byScore = leaderboard.slice(0);
    console.log("Sorting by score...");
    byScore.sort(function (a, b) {
        return a.points - b.points;
    });
    console.log("Sorting done...");
    console.log(JSON.stringify(byScore));
    var response = "";
    console.log("Preparing display...");
    for (var i = 0; i < byScore.length; i++) {
        console.log("Sorted #" + i + " " + JSON.stringify(byScore[i]));
        response += " | " + byScore[i].name + " Rank: " + byScore[i].rank + " " + byScore[i].points + "/" + byScore[i].display;
    }
    return response;
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

    api.users.usersByName({ users: channelName.substring(1, channelName.length) }, (err, res) => {
        if (err) {
            console.log("Get ID Error: " + err);
        } else {
            response = JSON.stringify(res);
            var id = res.users[0]["_id"];
            api.streams.channel({ channelID: id }, (err, res) => {
                if (err) {
                    console.log("Get Channel Info Error: " + err);
                } else {
                    response = JSON.stringify(res);
                    if (JSON.parse(response).stream === null || JSON.parse(response).stream === undefined) {
                        usersCooldown[channelName.substring(1, channelName.length)] = null;
                        return false;
                    }
                    else {
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
            const browser = await puppeteer.launch({ headless: true });
            const page = await browser.newPage();
            await page.setViewport({
                width: 950,
                height: 300,
                deviceScaleFactor: 1,
            });
            console.log("set viewport");
            await page.goto(file.path);
            await page.screenshot({ path: path.basename(file.basename, ".html") + ".png" });
            console.log("Sending file for " + discordName);
            await replyChannel.send("Here is your rank:", { files: [discordName.substring(0, discordName.length - 5) + ".png"] });
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
    } else if (users[discordName.substring(0, discordName.length - 5).toString().toLowerCase()] >= 500) {
        cap = "5000";
        rank = "GOLD";
        file = file.replace("id=\"gold\" style=\"display: none;\"", "id=\"gold\"");
    } else if (users[discordName.substring(0, discordName.length - 5).toString().toLowerCase()] >= 100) {
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