/**
 * Created by Tor on 17/10/2015.
 */
var express = require('express');

module.exports = function() {

    var router = express.Router();
    router.get('/', function (req, res) {
        res.end("TP");
        //res.render("index");
    });
    return router;
};
