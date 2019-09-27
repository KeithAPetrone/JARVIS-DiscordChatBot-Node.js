/*jshint esversion: 6 */

const host = '0.0.0.0';
const port = process.env.PORT || 3000;

var app = require('http');
app.createServer().listen(port, host);

const Discord = require('discord.js');
const client = new Discord.Client();

var users = {};

client.on('ready', () => {
    console.log(`Discord: Logged in as ${client.user.tag}!`);
});

client.on('message', msg => {
    if (msg.content === '!ping') {
        console.log('Received #' + msg.id + ': ' + msg.content);
        msg.reply('Pong!');
    }
});

client.on('message', msg => {
    if (msg.content === '!lurk') {
        console.log('Received #' + msg.id + ': ' + msg.content);
        if (msg.author.tag.toString().toLowerCase().substring(0, str.length - 5) in users) {
            users[msg.author.tag.toString().toLowerCase().substring(0, str.length - 5)]++;
            msg.reply(msg.author + ' is lurking!!!');
            console.log('Discord: ' + msg.author + ' is lurking!!!');
        } else {
            msg.reply(msg.author + ', you need to be added to the database!');
            console.log('Discord: ' + msg.author + ', you need to be added to the database!');
        }
    }
});

client.on('message', msg => {
    if (msg.content === '!addmelurk') {
        console.log('Received #' + msg.id + ': ' + msg.content);
        if (!(msg.author.tag.toLowerCase().substring(0, str.length - 5) in users)) {
            users[msg.author.tag.toLowerCase().substring(0, str.length - 5)] = 0;
            msg.reply(msg.author.tag.toLowerCase().substring(0, str.length - 5) + ' has been added to the points database!');
            console.log('Discord: ' + msg.author + ' has been added to the points database!');
            console.log(users);
        } else {
            msg.reply(msg.author + ', you are already in the databse!');
            console.log('Discord: ' + msg.author + ', you are already in the databse!');
        }
    }
});

client.on('message', msg => {
    if (msg.content === '!scoreboard') {
        console.log('Received #' + msg.id + ': ' + msg.content);
        msg.reply('Here are the results: ' + JSON.stringify(users));
        console.log('Discord: Here are the results: ' + JSON.stringify(users));
    }
});

client.on('message', msg => {
    if (msg.content === '!clearscores') {
        console.log('Received #' + msg.id + ': ' + msg.content);
        users = {};
        msg.reply('Scores have been wiped! Do not forget to sign back up!');
        console.log('Discord: Scores have been wiped! Do not forget to sign back up!');
    }
});

client.login('NjExMzAzODcwODUzMDIxNzM1.XVR9Ww.o3zYBezLAJMc3czYl7PPe7RwU_c');

const tmi = require("tmi.js");

const options = require("./option"); //Your options file


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



        if ((message.toLowerCase()).includes("redneck")) { //using string.includes is case-sensitive, so it is better to just make it lowercase

            client2.say(channel, `@${userstate.username} Hello!!!`);
        }

        if ((message.toLowerCase()).includes("!lurk")) { //using string.includes is case-sensitive, so it is better to just make it lowercase
            if (userstate.username.toString().toLowerCase() in users) {
                users[userstate.username.toString().toLowerCase()]++;
                client2.say(channel, `@${userstate.username} Thanks for lurking!!!`);
            } else {
                client2.say(channel, `@${userstate.username} You need to be added to the points database from the Discord server!`);
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