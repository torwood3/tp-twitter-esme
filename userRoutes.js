/**
 * Created by Tor on 18/10/2015.
 */

var express = require('express');
var db = require('./db.js');

module.exports = function() {

    var router = express.Router();
    function usernameCheck(user) {
        return user.username == this.username
    };
    function passwordCheck(user) {
        return user.password == this.password
    };

    function checkKey(req, res, next){
        if(req.params.key ) {
            var username = db.loggedUserList[req.params.key];

            if( username !== undefined ) {
                req.params.username = username;
                next();
                return;
            }
        }
        res.status(401).end();
    }

    //Register
    router.post('/register', function (req, res) {
        req.body.user.id = db.userList.length;

        var newUser = req.body.user;

        if ( newUser.username == "" || newUser.password == "") {
            res.status(400).json({error: "User data not comply"}).end();
            return;
        }

        if(db.userList.filter(usernameCheck, newUser).length == 1 ) {
            res.status(409).json({error: "Username already used"}).end();
        } else {
            db.userList.push(newUser);
            res.json({message: "User registered"}).end();
        }

    });

    //Login
    router.post("/login", function(req, res){
        var userLogin = req.body.user;

        if ( userLogin.username == "" || userLogin.password == "") {
            res.status(400).json({error: "User data not comply"}).end();
            return;
        }

        var result = db.userList.filter(usernameCheck, userLogin).filter(passwordCheck, userLogin);
        if( result.length == 1 ){
            var key = db.login(userLogin.username);
            res.json({key: key}).end();
        } else
            res.status(401).json({error: "Login failed"}).end();


    });

    //Get User
    router.get("/:key", checkKey, function(req, res){
         var result  = db.userList.filter(function(user) {
            return user.username == req.params.username
        });
        if(result.length == 1 ) {
            delete result[0].id;
            res.json({ user: result[0]} ).end();
        } else {
            res.status(401).end();
        }
    });

    //Logout
    router.get("/logout/:key", checkKey, function(req, res){
        var key = req.params.key;
        delete db.loggedUserList[key];
        res.json({message: "User logged-out"}).end();
    });


    //Delete
    router.delete("/:key", checkKey, function(req, res){
        db.userList.forEach(function(element){
            if( element.username == req.params.username){
                db.userList.splice(element.id, 1);
            }
        });
        var indexList = [];
        db.tweetList.forEach(function(tweet, index){
            if (tweet.username == req.params.username){
                indexList.push(index);
            }
        });
        indexList.reverse().forEach(function(value){
            db.tweetList.splice(value,1);
        });

        res.json({message: "User & tweets deleted"}).end();
    });

    return router;
};
