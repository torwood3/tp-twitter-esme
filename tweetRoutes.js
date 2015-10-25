/**
 * Created by Tor on 18/10/2015.
 */

var express = require('express');
var db = require('./db.js');

module.exports = function() {

    var router = express.Router();

    function checkKey(req, res, next){
        if(req.params.key ) {
            var username = db.loggedUserList[req.params.key];

            if( username !== undefined ) {
                req.params.username = username;
                next();
                return;
            }
        }
        res.status(401).json({error: "Please login !"}).end();
    }

    router.get('/', function (req, res) {
        res.json(db.tweetList).end();
    });

    //Get tweets
    router.get('/:key', checkKey, function (req, res) {
        res.json(db.tweetList).end();
    });

    //Get user tweets
    router.get('/:key/myTweets', checkKey, function(req, res){
        if(!req.params.key ) res.status(401);
        var key = req.params.key;
        var username = db.loggedUserList[key];
        var result = [];
        result.push(db.tweetList.filter(
            function(tweet){
                return tweet.username == username
            })
        );
        res.json(result).end();
    });


    //Create tweet
    router.put('/:key', checkKey, function(req, res){
        var tweet = req.body.tweet;
        if (tweet.message == "") {
            res.status(400).json({error: "Tweet data not comply"}).end();
            return;
        }


        tweet.id = ( db.tweetList.length != 0 ? db.tweetList[db.tweetList.length -1].id + 1 : 0);
        tweet.date = new Date();
        tweet.username = req.params.username;
        db.tweetList.push(tweet);
        res.json({tweet : tweet, message:"Tweet send with success !!"}).end();
    });

    //Delete
    router.delete('/:key/:id', checkKey, function(req, res){
        var found = false;
        db.tweetList.forEach(function(tweet, index){
            if (req.params.id == tweet.id) {
                if (tweet.username != req.params.username) {
                    res.status(401).json({error: "You are not the author"}).end();
                } else {
                    db.tweetList.splice( index, 1);
                    res.json({message: "Tweet deleted"}).end();
                }
                found = true;
             }
        });
        if (!found)
            res.status(400).json({error: "Tweet ID doesn't match"}).end();
    });

    return router;
};
