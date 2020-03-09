/**
 * @application JARVIS
 * @version 1.0.0
 * @author Keith Petrone
 * @email keithapetrone@gmail.com
 * @create date 2019-09-16 11:02:24
 * @modify date 2020-03-07 20:18:33
 * @desc JARVIS is a bot designed around assisting the Fortify Streaming communinity.
 */


const host = '0.0.0.0';
const port = process.env.PORT || 3000;

var app = require('http');
app.createServer().listen(port, host);

const Discord = require('discord.js');
const Twitch = require('./Features/twitch.js');
const YouTube = require('./Features/twitch.js');
const client = new Discord.Client();

const silver = 500;
const gold = 2500;
const diamond = 5000;

const options = require("./option"); //The twitch options file

var users = {};
var questionsOfTheDay = [];
var youtubers = {};

//Logging into Discord
client.on('ready', () => {
    let fs = require("fs-extra");
    console.log(`Discord: Logged in as ${client.user.tag}!`);
    users = JSON.parse(fs.readFileSync("C:/Users/kpetrone/users.json"));
    console.log("Database has been loaded...");
    var text = fs.readFileSync("C:/Users/kpetrone/questions.txt");
    var textByLine = text.toString().split("\n");
    questionsOfTheDay = textByLine;
    text = fs.readFileSync("C:/Users/kpetrone/twitch.txt");
    textByLine = text.toString().split("\n");
    options.channels = textByLine;
    console.log("Twitch user list has been loaded...");
    youtubers = JSON.parse(fs.readFileSync("C:/Users/kpetrone/youtube.json"));
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
    fs.writeFileSync("C:/Users/kpetrone/users.json", JSON.stringify(users));
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
        youtubers = YouTube.AddYouTuber(msg, youtubers);
    } else if (msg.content.includes('!removeyoutube')) {
        console.log('Received #' + msg.id + ': ' + msg.content);
        youtubers = YouTube.RemoveYouTuber(msg, youtubers);
    }
});

//Adds/Removes twitch streamer to the announcements.
client.on('message', msg => {
    if (msg.content.includes('!twitch')) {
        console.log('Received #' + msg.id + ': ' + msg.content);
        options.channels = Twitch.AddTwitchStreamer(msg, options.channels);
    } else if (msg.content.includes('!removetwitch')) {
        console.log('Received #' + msg.id + ': ' + msg.content);
        options.channels = Twitch.RemoveTwitchStreamer();
    }
});

client.login('NjExMzAzODcwODUzMDIxNzM1.XVR9Ww.o3zYBezLAJMc3czYl7PPe7RwU_c');

const tmi = require("tmi.js");

var fs = require('fs');
var text = fs.readFileSync("C:/Users/kpetrone/twitch.txt");
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
        Twitch.isLive(client, broadcaster);
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

setInterval(() => {
    for (youtuber = 0; youtuber < youtubers.length; youtuber++) {
        YouTube.fetchVideo(client, youtuber);
    }
}, 10000);

setInterval(() => {
    for (youtuber = 0; youtuber < youtubers.length; youtuber++) {
        YouTube.fetchStream(client, youtuber);
    }
}, 10000);

function AskQuestion() {
    var qod = questionsOfTheDay.pop().toString();
    if (qod == null || qod == undefined || qod == "") {
        qod = questionsOfTheDay.pop().toString();
    }
    console.log("Here's the question of the day: " + qod);
    client.channels.get("683773761102807089").send(qod);
    var text = "";
    for (i = 0; i < questionsOfTheDay.length; i++) {
        text += questionsOfTheDay[i] + "\n";
    }
    let fs = require('fs');
    fs.writeFile("C:/Users/kpetrone/questions.txt", text, function (err) {
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

    var points = users[name.toString().toLowerCase()];
    if (users === undefined || points === undefined || typeof points === "undefined" || points.toString() == "undefined" || points == null) {
        points = "0";
    }
    file = file.replace("{{POINTS}}", points);
    var cap = 500;
    var rank = "BRONZE";
    if (users[name.toString().toLowerCase()] >= diamond) {
        cap = "MAXED";
        rank = "DIAMOND";
        file = file.replace("id=\"diamond\" style=\"display: none;\"", "id=\"diamond\"");
    } else if (users[name.toString().toLowerCase()] >= gold) {
        cap = "5000";
        rank = "GOLD";
        file = file.replace("id=\"gold\" style=\"display: none;\"", "id=\"gold\"");
    } else if (users[name.toString().toLowerCase()] >= silver) {
        cap = "2500";
        rank = "SILVER";
        file = file.replace("id=\"silver\" style=\"display: none;\"", "id=\"silver\"");
    } else {
        file = file.replace("id=\"bronze\" style=\"display: none;\"", "id=\"bronze\"");
    }
    file = file.replace("{{CAP}}", cap);
    file = file.replace("{{RANK}}", rank);

    fs.writeFile("C:/Users/kpetrone/" + name + ".html", file, "utf8");
    console.log("Created html file");
}