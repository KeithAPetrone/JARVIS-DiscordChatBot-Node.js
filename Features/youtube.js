// jshint esversion: 8

const fs = require('fs-extra');
const config = require('./config.json');
const youtubeAPIKey = config.youtube.APIKey;

// Polls API and checks if there is a new video release
function fetchVideo(client, youtuber) {
    if (!youtubers[youtuber].latestVideo) return setLatestVideo(youtuber);

    fetchData(youtuber).then((videoInfo) => {
        if (videoInfo.error) return;
        if (videoInfo.items[0].snippet.resourceId.videoId !== youtubers[youtuber].latestVideo) {

            const path = `channels?part=snippet&id=${youtubers[youtuber].id}&key=${youtubeAPIKey}`;
            callAPI(path).then((channelInfo) => {
                if (channelInfo.error) return;

                sendVideoAnnouncement(client, videoInfo, channelInfo);
                youtubers[youtuber].latestVideo = videoInfo.items[0].snippet.resourceId.videoId;
                fs.writeFileSync(config.filePath + "youtube.json", JSON.stringify(youtubers));
            });
        }
    });
}

// At start of the bot, fetches the latest video which is compared to if an announcement needs to be sent
function setLatestVideo(youtuber) {
    fetchData(youtuber).then((videoInfo) => {
        if (videoInfo.error) return;

        youtubers[youtuber].latestVideo = videoInfo.items[0].snippet.resourceId.videoId;
        fs.writeFileSync(config.filePath + "youtube.json", JSON.stringify(youtubers));
    });
}

// Fetches data required to check if there is a new video release
async function fetchData(youtuber) {
    let path = `channels?part=contentDetails&id=${youtubers[youtuber].id}&key=${youtubeAPIKey}`;
    const channelContent = await callAPI(path);

    path = `playlistItems?part=snippet&maxResults=1&playlistId=${channelContent.items[0].contentDetails.relatedPlaylists.uploads}&key=${youtubeAPIKey}`;
    const videoInfo = await callAPI(path);

    return videoInfo;
}

// Constructs a MessageEmbed and sends it to new video announcements channel
function sendVideoAnnouncement(client, videoInfo, channelInfo) {
    const channel = client.channels.find((ch) => ch.id === client.youtube.youtubeVideo);

    if (!channel) return console.error(`Couldn't send YouTube new video announcement because the channel couldn't be found.`);

    // Regex to cut off the video description at the last whole word at 237 characters
    const description = (videoInfo.items[0].snippet.description).replace(/^([\s\S]{237}[^\s]*)[\s\S]*/, '$1');

    const embed = new Discord.RichEmbed()
        .setAuthor(`${channelInfo.items[0].snippet.title} has uploaded a new YouTube video!`, channelInfo.items[0].snippet.thumbnails.high.url)
        .setTitle(videoInfo.items[0].snippet.title)
        .setURL(`https://www.youtube.com/watch?v=${videoInfo.items[0].snippet.resourceId.videoId}`)
        .setDescription(`${description}...\n\n[**Watch the video here!**](https://www.youtube.com/watch?v=${videoInfo.items[0].snippet.resourceId.videoId})`)
        .setColor('#FF0000')
        .setImage(videoInfo.items[0].snippet.thumbnails.maxres.url)
        .setTimestamp(new Date(videoInfo.items[0].snippet.publishedAt));

    return channel.send("A new YouTube video has been posted!!!", { embed });
}

// Polls API and checks whether channel is currently streaming
function fetchStream(client, youtuber) {
    const path = `search?part=snippet&channelId=${youtubers[youtuber].id}&maxResults=1&eventType=live&type=video&key=${youtubeAPIKey}`;

    callAPI(path).then((streamInfo) => {
        if (streamInfo.error || !streamInfo.items[0]) return;
        if (streamID === streamInfo.items[0].id.videoId) return;

        streamID = streamInfo.items[0].id.videoId;
        sendStreamAnnouncement(client, streamInfo);
    });
}

// Constructs a MessageEmbed and sends it to livestream announcements channel
function sendStreamAnnouncement(client, streamInfo) {
    const channel = client.channels.find((ch) => ch.id === config.youtube.youtubeVideo);

    if (!channel) return console.error(`Couldn't send YouTube new video announcement because the channel couldn't be found.`);

    // Regex to cut off the video description at the last whole word at 237 characters
    const description = (streamInfo.items[0].snippet.description).replace(/^([\s\S]{237}[^\s]*)[\s\S]*/, '$1');

    const embed = new Discord.RichEmbed()
        .setAuthor(`${streamInfo.items[0].snippet.channelTitle} is now LIVE on YouTube!`)
        .setTitle(streamInfo.items[0].snippet.title)
        .setURL(`https://www.youtube.com/watch?v=${streamInfo.items[0].id.videoId}`)
        .setDescription(`${description}...\n\n[**Watch the stream here!**](https://www.youtube.com/watch?v=${streamInfo.items[0].id.videoId})`)
        .setColor('#FF0000')
        .setImage(streamInfo.items[0].snippet.thumbnails.high.url)
        .setTimestamp(new Date(streamInfo.items[0].snippet.publishedAt));

    return channel.send("Someone is live on YouTube!!!", { embed });
}

// Template HTTPS get function that interacts with the YouTube API, wrapped in a Promise
function callAPI(path) {
    return new Promise((resolve) => {
        const https = require('https');
        const options = {
            host: 'www.googleapis.com',
            path: `/youtube/v3/${path}`
        };

        https.get(options, (res) => {
            if (res.statusCode !== 200) {
                console.error("Failed, Status: " + res.statusCode + " Headers: " + res.headers.toString());
                return;
            }
            const rawData = [];
            res.on('data', (chunk) => rawData.push(chunk));
            res.on('end', () => {
                try {
                    var ytjson = rawData.toString().replace(",,", ",");
                    resolve(JSON.parse(ytjson));
                } catch (error) {
                    console.error(`An error occurred parsing the API response to JSON, ${error}`);
                }
            });

        }).on('error', (error) => console.error(`Error occurred while polling YouTube API, ${error}`));
    });
}

//Add user to youtube list
function AddYouTuber(msg, youtubers) {
    var addedYouTuber = msg.content.replace("!youtube ", "");
        var exists = false;
        for (i = 0; i < youtubers.length; i++) {
            if (youtubers[i].id == addedYouTuber) {
                exists = true;
            }
        }
        if (!exists) {
            youtuber.id = id;
            youtubers.push(youtuber);
            fs.writeFileSync(config.filePath + "youtube.json", JSON.stringify(youtubers));
            console.log("User " + addedYouTuber + " has been added to YouTube notifications.");
            msg.reply("YouTube user " + addedYouTuber + " has been added.");
        } else {
            console.log("User " + addedYouTuber + " has already been added to YouTube notifications.");
            msg.reply("YouTube user " + addedYouTuber + " already exists!");
        }
    return youtubers;
}

//Remove user from youtube list
function RemoveYouTuber(msg, youtubers) {
    var removedYouTuber = msg.content.replace("!removeyoutube ", "");
        var exists = false;
        for (i = 0; i < youtubers.length; i++) {
            if (youtubers[i].id == removedYouTuber) {
                exists = true;
            }
        }
        if (!exists) {
            console.log("User " + removedYouTuber + " isn't in YouTube notifications.");
            msg.reply("YouTube user " + removedYouTuber + " isn't in notifications.");
        } else {
            RemoveYouTuber(removedYouTuber);
            console.log("User " + removedYouTuber + " has been removed from YouTube notifications.");
            msg.reply("YouTube user " + removedYouTuber + " has been removed!");
        }
    return youtubers;
}