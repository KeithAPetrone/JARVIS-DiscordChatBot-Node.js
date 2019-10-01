/*jshint esversion: 6 */

const host = '0.0.0.0';
const port = process.env.PORT || 3000;

var app = require('http');
app.createServer().listen(port, host);

const Discord = require('discord.js');
const client = new Discord.Client();

const bronze = 100;
const silver = 500;
const gold = 1000;

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
    if (msg.content === '!addmelurk') {
        console.log('Received #' + msg.id + ': ' + msg.content);
        var name = msg.author.tag.toString().toLowerCase();
        name = name.substring(0, name.length - 5);
        if (!(name in users)) {
            users[name] = 0;
            msg.reply(name + ' has been added to the points database!');
            console.log('Discord: ' + msg.author + ' has been added to the points database!');
            console.log(users);
        } else {
            msg.reply(msg.author + ', you are already in the databse!');
            console.log('Discord: ' + msg.author + ', you are already in the databse!');
        }
    }
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
            msg.reply(msg.author + ', you need to be added to the database!');
            console.log('Discord: ' + msg.author + ', you need to be added to the database!');
        }
    }
});

client.on('message', msg => {
    if (msg.content === '!raid') {
        console.log('Received #' + msg.id + ': ' + msg.content);
        if (msg.member.roles.find(r => r.name === "Admin") || msg.member.roles.find(r => name === "Mod")) {
            var name = msg.author.tag.toString().toLowerCase();
            name = name.substring(0, name.length - 5);
            //Supposed to be a double points version of !lurk
        } else {
            msg.reply(msg.author + ', you do not have permission to do that!');
            console.log('Discord: ' + msg.author + ', you do not have permission to do that!');
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
                var rank = "NONE";
                var display = 100;
                if (points >= 1000) {
                    rank = "GOLD";
                    display = "MAXED OUT";
                } else if (points >= 500) {
                    rank = "SILVER";
                    display = 1000;
                } else if (points >= 100) {
                    rank = "BRONZE";
                    display = 500;
                }
                console.log("Rank is " + rank);
                participant[name] = name;
                participant[points] = points;
                participant[rank] = rank;
                participant[display] = display;
                leaderboard.push(participant);
            }
        }
        response += makeLeaderboard(leaderboard);
        msg.reply(response);
        console.log("Discord: " + response);
    }
});

client.on('message', msg => {
    if (msg.content === '!rank') {
        console.log('Received #' + msg.id + ': ' + msg.content);
        var name = msg.author.tag.toString().toLowerCase();
        name = name.substring(0, name.length - 5);
        var points = users[name];
        var rank = "NONE";
        var display = 100;
        if (points >= 1000) {
            rank = "GOLD";
            display = "MAXED OUT";
        } else if (points >= 500) {
            rank = "SILVER";
            display = 1000;
        } else if (points >= 100) {
            rank = "BRONZE";
            display = 500;
        }
        msg.reply('Here is your rank: ' + rank + " " + points + "/" + display);
        console.log('Discord: Here is your rank: ' + rank + " " + points + "/" + display);
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



        if ((message.toLowerCase()).includes("!ping")) { //using string.includes is case-sensitive, so it is better to just make it lowercase

            client2.say(channel, `@${userstate.username} Pong!!!`);
            console.log("Twitch: Pong!!!");
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

function makeLeaderboard(leaderboard) {
    console.log("Making Leaderboard...");
    var byScore = leaderboard.slice(0);
    console.log("Sorting by score...");
    byScore.sort(function (a, b) {
        return a.points - b.points;
    });
    console.log("Sorting done...");
    var response = "";
    console.log("Preparing display...");
    for (var i = 0; i < byScore.length; i++) {
        console.log("Sorted #" + i + " " +byScore[i]);
        response += " | " + byScore[i][name] + " Rank: " + byScore[i][rank] + " " + byScore[i][score] + "/" + byScore[i][display];
    }
    return response;
}