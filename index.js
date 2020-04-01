/**
 * @application JARVIS
 * @version 1.2.4
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
const Twitter = require('twitter');
const TwitterFeatures = require('./Features/twitterFeatures.js');

const client = new Discord.Client();

const options = require('./option.js'); //The twitch options file
const fs = require('fs-extra');

var users = {};
var questionsOfTheDay = [];
var youtubers = {};
var facebookers = {};
var mixers = {};
var streamerSpotlight = {};

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

// Initialize the invite cache
const invites = {};

//Logging into Discord
client.on('ready', () => {
    console.log(`Discord: Logged in as ${client.user.tag}!`);
});

client.on('guildMemberAdd', (member) => {
    console.log(member.user.tag.toString() + " has joined the server!");
    member.send(config.discord.welcomeMessage);

    // To compare, we need to load the current invite list.
  member.guild.fetchInvites().then(guildInvites => {
    // This is the *existing* invites for the guild.
    const ei = invites[member.guild.id];
    // Update the cached invites for the guild.
    invites[member.guild.id] = guildInvites;
    // Look through the invites, find the one for which the uses went up.
    const invite = guildInvites.find(i => ei.get(i.code).uses < i.uses);
    // This is just to simplify the message being sent below (inviter doesn't have a tag property)
    const inviter = client.users.get(invite.inviter.id);
    // Get the log channel (change to your liking)
    const logChannel = member.guild.channels.find(channel => channel.name === "logging");
    // A real basic message with the information we need. 
    logChannel.send(`${member.user.tag} joined using invite code ${invite.code} from ${inviter.tag}. Invite was used ${invite.uses} times since its creation.`);
});

// Load all invites for all guilds and save them to the cache.
client.guilds.forEach(g => {
    g.fetchInvites().then(guildInvites => {
        invites[g.id] = guildInvites;
    });
});

client.on('message', msg => {
    let announcementsObj = {
        twitch: options.channels,
        youtube: youtubers,
        users: users,
        questions: questionsOfTheDay,
        facebook: facebookers,
        ss: streamerSpotlight
    };
    announcementsObj = DiscordFeatures.handleCommand(announcementsObj, msg, client);
    options.channels = announcementsObj.twitch;
    youtubers = announcementsObj.youtube;
    users = announcementsObj.users;
    questionsOfTheDay = announcementsObj.questions;
    facebookers = announcementsObj.facebook;
    streamerSpotlight = announcementsObj.ss;
});

client.login(config.discord.APIkey);

const tmi = require("tmi.js");

//Connect to twitch server
const client2 = new tmi.client(options);

client2.connect();

//on chat
client2.on("chat", (channel, userstate, message, self) => {
    let announcementsObj = {
        users: users,
        ss: streamerSpotlight
    };
    announcementsObj = Twitch.handleCommand(channel, userstate, message, self, announcementsObj);
    users = announcementsObj.users;
    streamerSpotlight = announcementsObj.ss;
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
    let hour = new Date().getHours();
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
}, 500000);

//Check for new youtube streams
setInterval(() => {
    for (youtuber = 0; youtuber < youtubers.length; youtuber++) {
        YouTube.fetchStream(client, youtubers, youtuber);
    }
}, 500000);

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
                    let announcementsObj = {
                        users: users,
                        ss: streamerSpotlight
                    };
                    announcementsObj = MixerFeatures.handleCommand(socket, data, announcementsObj);
                    users = announcementsObj.users;
                    streamerSpotlight = announcementsObj.ss;
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

var client4 = new Twitter({
    consumer_key: config.twitter.APIkey,
    consumer_secret: config.twitter.APIsecret,
    access_token_key: config.twitter.accessToken,
    access_token_secret: config.twitter.accessSecret
  });

var stream = client4.stream('statuses/filter', {track: 'fortifystreamers'});
stream.on('data', function(event) {
  console.log(event && event.text);
});
var stream1 = client4.stream('statuses/filter', {track: 'fortifystreaming'});
stream1.on('data', function(event) {
  console.log(event && event.text);
});
var stream2 = client4.stream('user');
stream2.on('follow', function(json) {
  if (json.event === 'follow') {
      TwitterFeatures.sendGreeting(json.source)
    }
});
 
stream.on('error', function(error) {
  throw error;
});
stream1.on('error', function(error) {
  throw error;
});
stream2.on('error', function(error) {
  throw error;
});

//Check for new youtube streams
setInterval(() => {
    for (mixer = 0; mixer < mixers.length; mixer++) {
        if (client != null)
        MixerFeatures.liveCheck(client, mixers[mixer]);
    }
}, 10000);

//Meme of the day logic
setInterval(() => {
    let hour = new Date().getHours();
    console.log("Checking the time... Hour is " + hour);
    if (hour === 14) {
        console.log("Time for Meme of the Day!!!");
        DiscordFeatures.SendMeme();
    }
}, (1000 * 60 * 60));

//Check for new Tweets to retweet
setInterval(() => {
        console.log("Checking for new Tweets...");
        Twitter.retweetHashtags();
        Twitter.favoriteHashtags();
}, 1000000);