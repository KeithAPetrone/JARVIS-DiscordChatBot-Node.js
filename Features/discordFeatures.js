// jshint esversion: 8

const fs = require('fs-extra');
const config = require('./../config.json');
const YouTube = require('./youtube');
const Twitch = require('./twitch');
const Facebook = require('./facebook');
const MixerFeatures = require('./mixerFeatures');

const silver = config.ranks.silver;
const gold = config.ranks.gold;
const diamond = config.ranks.diamond;

function AskQuestion(questionsOfTheDay, client) {
    var qod = questionsOfTheDay.pop().toString();
    if (qod == null || qod == undefined || qod == "") {
        qod = questionsOfTheDay.pop().toString();
    }
    console.log("Here's the question of the day: " + qod);
    client.channels.get(config.channels.questionOfTheDay).send(qod);
    var text = "";
    for (i = 0; i < questionsOfTheDay.length; i++) {
        text += questionsOfTheDay[i] + "\n";
    }
    fs.writeFile(config.filePath + "questions.txt", text, function (err) {
        if (err) {
            console.log(err);
        } else {
            console.log('Questions File written!');
        }
    });
    return questionsOfTheDay;
}

function SendMeme() {
    let keyword = "gamingmeme";
    let getJSON = require('get-json');
    getJSON("http://api.flickr.com/services/feeds/photos_public.gne?jsoncallback=?", {
            tags: keyword,
            tagmode: "any",
            format: "json"
        },
        function (data) {
            var rnd = Math.floor(Math.random() * data.items.length);
            var image_src = data.items[rnd]['media']['m'].replace("_m", "_b");
            request.head(image_src, function (err, res, body) {
                console.log('content-type:', res.headers['content-type']);
                console.log('content-length:', res.headers['content-length']);
                request(uri).pipe(fs.createWriteStream(config.filePath + "meme.png")).on('close', callback);
            });
            client.channels.get(config.channels.memes).send(image_src);
            fs.unlinkSync(config.filePath + "meme.png");
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

    let path = require("path");

    var file = fs.readFileSync(path.join(__dirname, "badgeBanner.html"), "utf8");

    file = file.replace("{{NAME}}", discordName.substring(0, discordName.length - 5));

    var name = discordName.substring(0, discordName.length - 5);
    var centering = 300;

    file = file.replace("class=\"name\" style=\"left: 300px;\"", "class=\"name\" style=\"left: " + centering + "px;\"");

    var points = users[name.toString().toLowerCase()];
    if (users === undefined || points === undefined || typeof points === "undefined" || points.toString() == "undefined" || points == null) {
        points = "0";
    }
    file = file.replace("{{POINTS}}", points);
    var cap = 500;
    var rank = "BRONZE";
    if (users[name.toString().toLowerCase()] >= diamond) {
        cap = "MAX";
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

    fs.writeFile(config.filePath + name + ".html", file, "utf8");
    console.log("Created html file");
}

function handleCommand(announcementsObj, msg, client) {
    let youtubers = announcementsObj.youtube;
    let twitchers = announcementsObj.twitch;
    let users = announcementsObj.users;
    let questions = announcementsObj.questions;
    let facebookers = announcementsObj.facebook;
    let mixers = announcementsObj.mixer;
    //Every message should increase exp by [number of words] points.
    console.log('Received #' + msg.id + ': ' + msg.content);
    let name = msg.author.tag.toString().toLowerCase();
    name = name.substring(0, name.length - 5);
    let pointsEarned = msg.content.split(' ').length;
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
    fs.writeFileSync(config.filePath + "users.json", JSON.stringify(users));
    //!ping command should issue "Pong!" response.
    if (msg.content === '!ping') {
        msg.reply('Pong!');
    } else if (msg.content === '!test') {
        msg.author.send(config.discord.welcomeMessage);
    }
    //Displays everyone's points to the chat.
    else if (msg.content === '!scoreboard') {
        msg.reply('Here are the results: ' + JSON.stringify(users));
        console.log('Discord: Here are the results: ' + JSON.stringify(users));
    }
    //Clears everyone's scores
    else if (msg.content === '!clearscores') {
        susers = {};
        msg.reply('Scores have been wiped!');
        console.log('Discord: Scores have been wiped!');
    }
    //Displays that user's rank and score.
    else if (msg.content === '!rank') {
        generateImage(msg.author.tag.toString().toLowerCase(), msg.channel);
    }
    //Magic 8ball command
    else if (msg.content.includes('!8jarvis')) {
        let question = msg.content.replace("!8jarvis ", "");
        let response = "";
        if (msg.author.tag.toString().toLowerCase().includes("devil") || msg.author.tag.toString().toLowerCase().includes("bird") || msg.author.tag.toString().toLowerCase().includes("wist")) {
            response = "That's such a Wisty question.";
        } else {
            let responses = ["It is certain.", "It is decidedly so.", "Without a doubt.", "Yes - definitely.", "You may rely on it.", "As I see it, yes.", "Most likely.", "Outlook good.", "Yes.", "Signs point to yes.", "Reply hazy, try again.", "Ask again later.", "Better not tell you now.", "Cannot predict now.", "Concentrate and ask again.", "Don't count on it.", "My reply is no.", "My sources say no.", "Outlook not so good.", "Very doubtful.", "That's such a Wisty question."];
            let answer = responses[Math.floor(Math.random() * responses.length)];
            response = "You asked: " + question + " I say: " + answer;
        }
        msg.reply(response);
    }
    //Question of the day override
    else if (msg.content === '!qod') {
        questions = AskQuestion(questions, client);
    }
    //Meme of the day override
    else if (msg.content === '!meme') {
        questions = SendMeme();
    }
    //Add youtube user to announcements
    else if (msg.content.includes('!youtube')) {
        youtubers = YouTube.AddYouTuber(msg, youtubers);
    }
    //Remove youtube user to announcements
    else if (msg.content.includes('!removeyoutube')) {
        youtubers = YouTube.RemoveYouTuber(msg, youtubers);
    }
    //Adds twitch streamer to the announcements.
    else if (msg.content.includes('!twitch')) {
        twitchers = Twitch.AddTwitchStreamer(msg, twitchers);
    }
    //Removes twitch streamer from the announcements.
    else if (msg.content.includes('!removetwitch')) {
        twitchers = Twitch.RemoveTwitchStreamer(msg, twitchers);
    }
    //Adds facebook streamer to the announcements.
    else if (msg.content.includes('!facebook')) {
        facebookers = Facebook.AddFacebookStreamer(msg, facebookers);
    }
    //Removes facebook streamer from the announcements.
    else if (msg.content.includes('!removefacebook')) {
        facebookers = Facebook.RemoveFacebookStreamer(msg, facebookers);
    }
    //Adds mixer streamer to the announcements.
    else if (msg.content.includes('!mixer')) {
        mixers = MixerFeatures.AddMixerStreamer(msg, mixers);
    }
    //Removes mixer streamer from the announcements.
    else if (msg.content.includes('!removemixer')) {
        mixers = MixerFeatures.RemoveMixerStreamer(msg, mixers);
    }
    announcementsObj.mixers = mixers;
    announcementsObj.facebook = facebookers;
    announcementsObj.twitch = twitchers;
    announcementsObj.youtube = youtubers;
    announcementsObj.users = users;
    announcementsObj.questions = questions;
    return announcementsObj;
}

module.exports.handleCommand = handleCommand;
module.exports.SendMeme = SendMeme;
module.exports.AskQuestion = AskQuestion;