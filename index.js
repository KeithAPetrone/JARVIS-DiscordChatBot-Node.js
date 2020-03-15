/**
 * @application JARVIS
 * @version 1.0.0
 * @author Keith Petrone
 * @email keithapetrone@gmail.com
 * @create date 2019-09-16 11:02:24
 * @modify date 2020-03-13 11:24:58
 * @desc JARVIS is a bot designed around assisting the Fortify Streaming community.
 */

// jshint esversion: 8

const host = '0.0.0.0';
const port = process.env.PORT || 3000;

var app = require('http');
app.createServer().listen(port, host);

const config = require('./config.json');
const Discord = require('discord.js');
const DiscordFeatures = require('./Features/discordFeatures.js');
const Twitch = require('./Features/twitch.js');
const YouTube = require('./Features/youtube.js');
const Facebook = require('./Features/facebook.js');
const MixerFeatures = require('./Features/mixerFeatures.js');
const Mixer = require('@mixer/client-node');

const client = new Discord.Client();

const options = require('./option.js'); //The twitch options file
const fs = require('fs-extra');

var users = {};
var questionsOfTheDay = [];
var youtubers = {};
var facebookers = {};
var mixers = {};

users = JSON.parse(fs.readFileSync(config.filePath + "users.json"));
console.log("Database has been loaded...");
let text = fs.readFileSync(config.filePath + "questions.txt");
let textByLine = text.toString().split("\n");
questionsOfTheDay = textByLine;
console.log("Questions of the day list has been loaded...");
text = fs.readFileSync(config.filePath + "twitch.txt");
textByLine = text.toString().split("\n");
options.channels = textByLine;
console.log("Twitch user list has been loaded...");
youtubers = JSON.parse(fs.readFileSync(config.filePath + "youtube.json"));
console.log("YouTube user list has been loaded...");
text = fs.readFileSync(config.filePath + "facebook.txt");
textByLine = text.toString().split("\n");
facebookers = textByLine;
console.log("Facebook user list has been loaded...");
text = fs.readFileSync(config.filePath + "mixer.txt");
textByLine = text.toString().split("\n");
mixers = textByLine;
console.log("Mixer user list has been loaded...");

//Logging into Discord
client.on('ready', () => {
    console.log(`Discord: Logged in as ${client.user.tag}!`);
});

//!ping command should issue "Pong!" response.
client.on('message', msg => {
    let announcementsObj = {
        twitch: options.channels,
        youtube: youtubers,
        users: users,
        questions: questionsOfTheDay,
        facebook: facebookers
    };
    announcementsObj = DiscordFeatures.handleCommand(announcementsObj, msg, client);
    options.channels = announcementsObj.twitch;
    youtubers = announcementsObj.youtube;
    users = announcementsObj.users;
    questionsOfTheDay = announcementsObj.questions;
    facebookers = announcementsObj.facebook;
});

client.login(config.discord.APIkey);

const tmi = require("tmi.js");

//Connect to twitch server
const client2 = new tmi.client(options);

client2.connect();

//on chat
client2.on("chat", (channel, userstate, message, self) => {
    users = Twitch.handleCommand(channel, userstate, message, self, users);
});

url = "https://api.twitch.tv/kraken/streams/";
twitchClientId = config.twitch.clientID;
twitchClientSecret = config.twitch.clientSecret;


//Check if twitch stream is live
//300000 is 5 minutes
setInterval(() => {
    for (i = 0; i < options.channels.length; i++) {
        let broadcaster = options.channels[i].toString();
        Twitch.isLive(client, broadcaster);
    }
}, 10000);

//Check if facebook stream is live
//300000 is 5 minutes
setInterval(() => {
    for (i = 0; i < facebookers.length; i++) {
        let broadcaster = facebookers[i];
        Facebook.isLive(client, broadcaster);
    }
}, 10000);

//Question of the day logic
setInterval(() => {
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
        YouTube.fetchVideo(client, youtubers, youtuber);
    }
}, 10000);

//Check for new youtube streams
setInterval(() => {
    for (youtuber = 0; youtuber < youtubers.length; youtuber++) {
        YouTube.fetchStream(client, youtubers, youtuber);
    }
}, 10000);

// Instantiate a new Mixer Client
const client3 = new Mixer.Client(new Mixer.DefaultRequestRunner());

/* With OAuth we don't need to log in. The OAuth Provider will attach
 * the required information to all of our requests after this call.
 * They'll also be authenticated with the user information of the user
 * who owns the token provided.
 */
client3.use(new Mixer.OAuthProvider(client3, {
    tokens: {
        access: config.mixer.accessToken,
        // Tokens retrieved via this page last for 1 year.
        expires: Date.now() + (365 * 24 * 60 * 60 * 1000)
    },
}));

// Get our Mixer Bot's User Information, Who are they?
MixerFeatures.getUserInfo(client3).then(async userInfo => {
    for (i = 0; i < mixers.length; i++) {
        MixerFeatures.fetchID(mixers[i]).then((channelId) => {
            if (channelId.error) return;

            /* Join our target Chat Channel, in this case we'll join
             * our Bot's channel.
             * But you can replace the second argument of this function with ANY Channel ID.
             */
            MixerFeatures.joinChat(client3, userInfo.id, channelId).then((socket) => {
                if (socket.error) return;

                // When there's a new chat message.
                socket.on('ChatMessage', data => {
                    MixerFeatures.handleCommand(socket, data);
                });
                // Handle errors
                socket.on('error', error => {
                    console.error('Socket error');
                    console.error(error);
                });
            });
        });
    }
});

//Check for new youtube streams
setInterval(() => {
    for (mixer = 0; mixer < mixers.length; mixer++) {
        MixerFeatures.liveCheck(client, mixers[mixer]);
    }
}, 10000);

//Meme of the day logic
setInterval(() => {
    DiscordFeatures.SendMeme();
}, (1000 * 60 * 60));