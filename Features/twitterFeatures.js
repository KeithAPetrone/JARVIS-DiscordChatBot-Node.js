// jshint esversion: 8

const Twitter = require('twit');
const config = require('./../config.json');

function retweetHashtags() {
        var params = {
            q: config.twitter.hashtags,  // REQUIRED
            result_type: 'recent',
            lang: 'en'
        };
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

function favoriteHashtags() {
  var params = {
      q: '#nodejs, #Nodejs',  // REQUIRED
      result_type: 'recent',
      lang: 'en'
  };
  // for more parametes, see: https://dev.twitter.com/rest/reference

  // find the tweet
  Twitter.get('search/tweets', params, function(err,data){

    // find tweets
    var tweet = data.statuses;
    var randomTweet = ranDom(tweet);   // pick a random tweet

    // if random tweet exists
    if(typeof randomTweet != 'undefined'){
      // Tell TWITTER to 'favorite'
      Twitter.post('favorites/create', {id: randomTweet.id_str}, function(err, response){
        // if there was an error while 'favorite'
        if(err){
          console.log('CANNOT BE FAVORITE... Error');
        }
        else{
          console.log('FAVORITED... Success!!!');
        }
      });
    }
  });
}

function sendGreeting(user) {
  T.post(
    'direct_messages/new',
    {
      user_id: user.id_str,
      text: config.twitter.greeting
    },
    function(err) {
      if (err) {
        console.error('error in sendGreeting to user: %s %s %s', user.name, user.screen_name, user.id_str)
        console.error(err)
      }
    }
  );
}

module.exports.retweetHashtags = retweetHashtags;
module.exports.favoriteHashtags = favoriteHashtags;
module.exports.sendGreeting = sendGreeting;