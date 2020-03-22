// jshint esversion: 8

const Twitter = require('twitter');
const config = require('./../config.json');

function retweetHashtags() {
        var params = {
            q: config.twitter.hashtags,  // REQUIRED
            result_type: 'recent',
            lang: 'en'
        }
        // for more parameters, see: https://dev.twitter.com/rest/reference/get/search/tweets
    
        Twitter.get('search/tweets', params, function(err, data) {
          // if there no errors
            if (!err) {
              // grab ID of tweet to retweet
                var retweetId = data.statuses[0].id_str;
                // Tell TWITTER to retweet
                Twitter.post('statuses/retweet/:id', {
                    id: retweetId
                }, function(err, response) {
                    if (response) {
                        console.log('Retweeted!!!');
                    }
                    // if there was an error while tweeting
                    if (err) {
                        console.log('Something went wrong while RETWEETING... Duplication maybe...');
                    }
                });
            }
            // if unable to Search a tweet
            else {
              console.log('Something went wrong while SEARCHING...');
            }
        });
}

module.exports.retweetHashtags = retweetHashtags;