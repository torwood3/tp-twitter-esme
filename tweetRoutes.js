/**
 * Created by Tor on 18/10/2015.
 */

var express = require('express');
var db = require('./db.js');

module.exports = function() {

    var router = express.Router();

    //GetALL tweet, on revoie le tableau
    router.get('/', function (req, res) {
        res.json(db.tweetList).end();
    });

    //GetMyTweet, on check la key pour avoir l'id puis on chercje les twwet du gars
    router.get('/myTweets/:key', function(req, res){
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


    //create, ajout d'un tweet a la liste
    router.put('/:key', function(req, res){
        if(!req.params.key ) res.status(401);
        var key = req.params.key;
        var username = db.loggedUserList[key];
        req.body.tweet.id = db.tweetList.length;
        req.body.tweet.username = username;
        db.tweetList.push(req.body.tweet);
        res.json({id: db.tweetList.length}).end();
    });

    //Edit, si c'est l'auteur ok pour l'edit
    router.post('/:key/:id', function(req, res){
        if(!req.params.key ) res.status(401);
        var key = req.params.key;
        var username = db.loggedUserList[key];

        if( db.tweetList[req.params.id].username == username ){
            db.tweetList[req.params.id] = req.body.tweet;
            res.end();
        } else {
            res.status(404).end();
        }
    });

    //DeleteMyTweet, si c'est l'auteur ok pour le delete
    router.delete('/:key/:id', function(req, res){
        if(!req.params.key ) res.status(401);
        var key = req.params.key;
        var username = db.loggedUserList[key];
        if( db.tweetList[req.params.id].username == username ){
            delete db.tweetList[req.params.id];
            res.end();
        } else {
            res.status(404).end();
        }

    });

    return router;
};
