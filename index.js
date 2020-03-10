/**
 * @application JARVIS
 * @version 1.0.0
 * @author Keith Petrone
 * @email keithapetrone@gmail.com
 * @create date 2019-09-16 11:02:24
 * @modify date 2020-03-09 21:09:23
 * @desc JARVIS is a bot designed around assisting the Fortify Streaming community.
 */

// jshint esversion: 8

const host = '0.0.0.0';
const port = process.env.PORT || 3000;

var app = require('http');
app.createServer().listen(port, host);

const Discord = require('discord.js');
const DiscordFeatures = require('./Features/discordFeatures.js');
const Twitch = require('./Features/twitch.js');
const YouTube = require('./Features/youtube.js');
const client = new Discord.Client();

const options = require("./option"); //The twitch options file
const fs = require("fs-extra");

var users = {};
var questionsOfTheDay = [];
var youtubers = {};

//Logging into Discord
client.on('ready', () => {
    console.log(`Discord: Logged in as ${client.user.tag}!`);
    users = JSON.parse(fs.readFileSync("C:/Users/keith/users.json"));
    console.log("Database has been loaded...");
    let text = fs.readFileSync("C:/Users/keith/questions.txt");
    let textByLine = text.toString().split("\n");
    questionsOfTheDay = textByLine;
    text = fs.readFileSync("C:/Users/keith/twitch.txt");
    textByLine = text.toString().split("\n");
    options.channels = textByLine;
    console.log("Twitch user list has been loaded...");
    youtubers = JSON.parse(fs.readFileSync("C:/Users/keith/youtube.json"));
    console.log("YouTube user list has been loaded...");
});

//!ping command should issue "Pong!" response.
client.on('message', msg => {
    let announcementsObj = {
        twitch : options.channels,
        youtube : youtubers,
        users : users
    };
    announcementsObj = DiscordFeatures.handleCommand(announcementsObj, msg, client);
    options.channels = announcementsObj.twitch;
    youtubers = announcementsObj.youtube;
    users = announcementsObj.users;
});

client.login('NjExMzAzODcwODUzMDIxNzM1.XVR9Ww.o3zYBezLAJMc3czYl7PPe7RwU_c');

const tmi = require("tmi.js");

var twitchText = fs.readFileSync("C:/Users/keith/twitch.txt");
var twitchTextByLine = twitchText.toString().split("\n");
options.channels = twitchTextByLine;

//Connect to twitch server
const client2 = new tmi.client(options);

client2.connect();

//on chat
client2.on("chat", (channel, userstate, message, self) => {
    users = Twitch.handleCommand(channel, userstate, message, self, users);
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
    var hour = new Date().getHours();
    console.log("Checking the time... Hour is " + hour);
    if (hour === 14) {
        console.log("Time for Question of the Day!!!");
        questionsOfTheDay = DiscordFeatures.AskQuestion(questionsOfTheDay, client);
    }
}, (1000 * 60 * 60));

//Check for new youtube videos
setInterval(() => {
    for (youtuber = 0; youtuber < youtubers.length; youtuber++) {
        YouTube.fetchVideo(client, youtuber);
    }
}, 10000);

//Check for new youtube streams
setInterval(() => {
    for (youtuber = 0; youtuber < youtubers.length; youtuber++) {
        YouTube.fetchStream(client, youtuber);
    }
}, 10000);

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