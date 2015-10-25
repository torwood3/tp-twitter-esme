/**
 * Created by Tor on 18/10/2015.
 */

/*
    user => { username, password, firstname, lastname, id }
    tweet => { message, username, timestamp, id }
 */
var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
hashCode = function(str) {
    var hash = 0, i, chr, len;
    if (str.length == 0) return hash;
    for (i = 0, len = str.length; i < len; i++) {
        chr   = str.charCodeAt(i);
        hash  = ((hash << 5) - hash) + chr;
        hash = hash & hash; // Convert to 32bit integer
    }
    return possible.charAt(Math.floor(Math.random() * possible.length))+hash;
};

var db = {
    userList: [], tweetList: [], loggedUserList: [], hashCode: hashCode,
    login: function(name){
        var key = hashCode(name + new Date());
        this.loggedUserList[key] = name;
        return key;
    }
};

module.exports = db;