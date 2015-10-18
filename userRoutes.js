/**
 * Created by Tor on 18/10/2015.
 */

var express = require('express');
var db = require('./db.js');
var crypto = require('crypto');
var md5sum = crypto.createHash('md5');

module.exports = function() {

    var router = express.Router();

    //Register
    router.post('/register', function (req, res) {
        var newUser = req.body.user //lastname, firstname, password, username
        newUser.id = db.userList.length;
        var result  = db.userList.filter(function(user) {
            return user.username == newUser.username
        });
        if(result.length == 1 ) {
            res.json({error: "Username already used"}).end();
        }
        else {
            db.userList.push(newUser);
            res.end();
        }
    });

    //Login, on check si on le connait, si oui c'est ok on te donne une key, sinon, degage
    //Stockage Key / ID
    router.post("/login", function(req, res){
        var userLogin = req.body.user; //username && mdp
        var result  = db.userList.filter(function(user) {
            return user.password == userLogin.password && user.username == userLogin.username
        });
        if(result.length == 1 ){
            var key = db.hashCode(userLogin.username + new Date());
            db.loggedUserList[key] = userLogin.username;
            res.json({key: key}).end();
        }
        else
            res.status(404).end();
    });

    router.get("/:key", function(req, res){
        if(!req.params.key ) res.status(401);
        var key = req.params.key;
        var usernameToGet = db.loggedUserList[key];
        var result  = db.userList.filter(function(user) {
            return user.username == usernameToGet
        });
        if(result.length == 1 ) {
            res.json(result).end();
        } else res.status(404).end();
    });

    //// ------ Si logé
    //Logout, on supprime la key
    router.get("/logout/:key", function(req, res){
        if(!req.params.key ) res.status(401);
        var key = req.params.key;
        delete db.loggedUserList[key];
        res.end();
    });


    //Delete, on supp le user
    router.delete("/:key", function(req, res){
        if(!req.params.key ) res.status(401);
        var key = req.params.key;
        var usernameToDelete = db.loggedUserList[key];
        if( usernameToDelete ) {
            db.userList.forEach(function(element){
                if( element.username == usernameToDelete){
                    delete db.userList[element.id];
                }
            });
            res.end();
        } else res.status(401).end();
    });

    return router;
};
