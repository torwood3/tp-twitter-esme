/**
 * Created by Tor on 17/10/2015.
 */

$().ready(function(){
    //Initialisation
    var pageList = ["login", "register", "wall"];
    var currentPage = 0;
    var user = {};
    var urlDomain = "http://localhost:3000/";

    //Binding events
    $(".changePage").click(changePage);
    $("#inputConfirmRegisterPassword").blur(changeCssConfirmButton);
    $("#login form").submit(login);
    $("#register form").submit(register);
    $(".logout").click(logout);
    $(".deleteUser").click(deleteUser);

    $("form#formPostTweet textarea").keypress(textLimitationCharacter);
    $("form#formPostTweet textarea").blur(textLimitationCharacter);

    $("form#formPostTweet").submit(sendTweet);
    $(".refreshTweetWall").click(refreshTweets);

    $('.tweetWall').on('click', 'button.deleteTweet', deleteTweet);

    /*******
     *      Functions
     ******/
    function changePage(page) {
        if( typeof page !== "string"){
            page = this.classList[0];
        }
        $("#" + pageList[currentPage]).hide();
        $("#" + page).show();
        currentPage = pageList.indexOf(page);
    }

    function logout(){
        $.get(urlDomain + "user/logout/" + user.key)
            .done( function(jqXHR){
                user = {};
                changePage("login");
                showAlert( jqXHR.message, "success");
            })
            .fail( function(jqXHR){
                if( jqXHR.status == 401 ){
                    changePage("login");
                } else if( jqXHR.status == 500 ){
                    showAlert( "Server Error, try again", "danger");
                    return;
                }
                showAlert( JSON.parse(jqXHR.responseText).error, "danger");
            });
        return false;
    }

    function deleteUser(){
        $.ajax({
            type: "DELETE",
            url: urlDomain + "user/" + user.key,
            contentType: "application/json; charset=utf-8",
            dataType: "json"
        }).done( function(jqXHR){
            user = {};
            changePage("login");
            showAlert( jqXHR.message, "success");
        }).fail( function(jqXHR){
            if( jqXHR.status == 401 ){
                changePage("login");
            } else if( jqXHR.status == 500 ){
                showAlert( "Server Error, try again", "danger");
                return;
            }
            showAlert( JSON.parse(jqXHR.responseText).error, "danger");
        });
        return false;
    }

    function login(){
        $.ajax({
            type: "POST",
            data: JSON.stringify({
                "user" : {
                    "password": $("#inputLoginPassword").val(),
                    "username": $("#inputLoginEmail").val()
                }
            }),
            url: urlDomain + "user/login",
            contentType: "application/json; charset=utf-8",
            dataType: "json"
        }).done( function(jqXHR){
            user.username = $("#inputLoginEmail").val();
            user.key = jqXHR.key;
            changePage("wall");
            refreshTweets();
            getUser();
        }).fail( function(jqXHR){
            showAlert( JSON.parse(jqXHR.responseText).error, "danger");
        });

        return false;
    }

    function register(){
        if( checkConfirmPassword() ) {
            $.ajax({
                type: "POST",
                data: JSON.stringify({
                    "user": {
                        "password": $("#inputRegisterPassword").val(),
                        "username": $("#inputRegisterEmail").val(),
                        "firstname": $("#inputRegisterFirstname").val(),
                        "lastname": $("#inputRegisterLastname").val()
                    }
                }),
                contentType: "application/json; charset=utf-8",
                dataType: "json",
                url: urlDomain + "user/register"
            }).done(function (jqXHR) {
                changePage("login");
                showAlert( jqXHR.message, "success");
             }).fail(function (jqXHR) {
                showAlert( JSON.parse(jqXHR.responseText).error, "danger");
            });
        }
        return false;
    }

    function changeCssConfirmButton() {
        if( checkConfirmPassword() ){
            $(this).parent().addClass("has-success");
            $(this).parent().removeClass("has-error");

        } else {
            $(this).parent().removeClass("has-success");
            $(this).parent().addClass("has-error");
        }
    }

    function deleteTweet(){
        var idTweet = $(this).parent().attr("id").split("-")[1];
        $.ajax({
            type: "DELETE",
            url: urlDomain + "tweet/" + user.key +"/"+ idTweet,
            contentType: "application/json; charset=utf-8",
            dataType: "json"
        }).done( function(jqXHR){
            $("#tweet-" + idTweet).remove();
            showAlert( jqXHR.message, "success");
        }).fail( function(jqXHR){
            if( jqXHR.status == 401 ){
                changePage("login");
            } else if( jqXHR.status == 500 ){
                showAlert( "Server Error, try again", "danger");
                return;
            }
            showAlert( JSON.parse(jqXHR.responseText).error, "danger");
        });
        return false;

    }

    function sendTweet(){
        $.ajax({
            type: "PUT",
            data: JSON.stringify({
                "tweet": {
                    "message": $("form#formPostTweet textarea").val()
                }
            }),
            contentType: "application/json; charset=utf-8",
            dataType: "json",
            url: urlDomain + "tweet/" + user.key
        }).done(function (jqXHR) {
            showAlert( jqXHR.message, "success");
            displayTweet(jqXHR.tweet);
        }).fail(function (jqXHR) {
            if( jqXHR.status == 401 ){
                changePage("login");
            } else if( jqXHR.status == 500 ){
                showAlert( "Server Error, try again", "danger");
                return;
            }
            showAlert( JSON.parse(jqXHR.responseText).error, "danger");
        });
        return false;
    };

    function textLimitationCharacter(){
        $("#textLenght").html( $(this).val().length );
        if( $(this).val().length >= 140 ){
            $(this).val($(this).val().substring(0, 139));
        }
    };

    var checkConfirmPassword = function(){
        return $("#inputConfirmRegisterPassword").val() === $("#inputRegisterPassword").val();
    };

    var showAlert = function(message, type) {
        var scope = ( currentPage == 2 ? ".tweet" : ".all");
        $(".message.alert"+scope).addClass("alert-" + type).empty().append(message + '<a href="#" class="close" data-dismiss="alert" aria-label="close">&times;</a>').show();
        setTimeout(function() {
            $(".message.alert"+scope).removeClass("alert-" + type).hide();
        }, 5000);
    };

    var displayTweet = function( tweet ) {
        var tweetDate = new Date(tweet.date);
        var actionBtn = '<button class="btn btn-danger deleteTweet right"><span class="glyphicon ' +
            'glyphicon-remove"></span> <span class="textBtn"></span></button>';

        var dateArea = "<span class=\"sub-text\"> " + tweetDate.getDate() + "/" + tweetDate.getMonth() + "/" +
            tweetDate.getFullYear() + " at " + tweetDate.toLocaleTimeString().toLowerCase() + " from " + tweet.username +
            "</span>";

        $("ul.tweetWall").append("<li class=\"list-group-item tweet\" id=\"tweet-" + tweet.id + "\" >" +
            ( user.username == tweet.username ? actionBtn : "") + tweet.message + dateArea + "</li>");
    };

    var getTweets = function(){
        $.get(urlDomain + "tweet/" + user.key, function(data){
            if(!data[0]) console.log(null)
            data.forEach(displayTweet)
        }, "json");
    };
    var getUser = function() {
        $.get(urlDomain + "user/" + user.key, function(data){
            $(".emailProfil .profil").html(data.user.username);
            $(".firstnameProfil .profil").html(data.user.firstname);
            $(".lastnameProfil .profil").html(data.user.lastname);
        }, "json");
    };

    function refreshTweets(){
        $("ul.tweetWall").empty();
        getTweets();
    }
});