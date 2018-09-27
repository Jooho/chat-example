const redis = require('redis');
const request = require('request');
const bodyPaser = require('body-parser');
const express = require('express');
const app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);


const REDIS_URL = 'redis';
const AUTH_URL = 'auth'

// Redis
// create and connect redis client to local instance.
const client = redis.createClient(6379, REDIS_URL, {password: 'SpYHEmq5iAkp8CYo'});

const room_name = 'tonronto_cc';
var chat_members = [];
var chat_msgs = [];
client.on('ready', function () {

    // Flush Redis DB
    // client.flushdb();


    // client.set(
    //     room_name, JSON.stringify({
    //         "chat_members": [
    //             "a",
    //             "b",
    //             "c",
    //             "d",
    //             "e"
    //         ],
    //         "chat_msgs": [{
    //             "sender": "a",
    //             "msg": "hi"
    //         }, {
    //             "sender": "b",
    //             "msg": "hi"
    //         }]
    //     })
    // );

// Initialize User/Msgs
    client.get(room_name, function (err, reply) {

        if (reply) {
            chat_members = JSON.parse(reply).chat_members;
            chat_members = JSON.parse(reply).chat_msgs;
        }

    });


})

// Print redis errors to the console
client.on('error', (err) => {
    console.log("Error " + err);
});

//
// client.get(room_name, function (err, result) {
//     console.log(JSON.parse(result).chat_msgs);
// });

app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

// app.use(bodyParser.urlencoded({
//     extended: true
// }));


app.get('/login', function (req, res, next) {
    var id = req.query.id;
    var pw = req.query.pw;

    var auth = false;

    request('http://' + AUTH_URL + ':8080/auth?id=' + id, {json: true}, (err, res2, body) => {
        if (err) {
            return console.log(err);
        }

        if (body === 'Auth OK') {
            auth = true;
        }

        if (auth && chat_members.indexOf(id) === -1) {
            chat_members.push(id);

            client.set(room_name, formattedData(chat_members, chat_msgs));
            res.send({
                'chat_members': chat_members,
                'status': 'OK'
            });
        } else {
            res.send({
                'status': 'FAILED',
                'msg': 'DUPLICATE NAME'
            });
        }

        client.get(room_name, function (err, result) {
            console.log(JSON.parse(result));
        });
    });


});


app.get('/join', function (req, res, next) {
    var nickName = req.query.nickName;
    console.log(nickName);
    if (chat_members.indexOf(nickName) === -1) {
        chat_members.push(nickName);
        client.set(room_name, formattedData(chat_members, chat_msgs));

        res.send({
            'chat_members': chat_members,
            'status': 'OK'
        });
    } else {
        res.send({
            'status': 'FAILED'
        });
    }
    console.log(chat_members);console.log(chat_msgs);
    client.get(room_name, function (err, result) {
        console.log(JSON.parse(result));
    });
});


app.get('/leave', function (req, res, next) {
    var nickName = req.query.nickName;

    if (chat_members.indexOf(nickName) > -1) {
        chat_members.splice(chat_members.indexOf(nickName), 1);
        client.set(room_name, formattedData(chat_members, chat_msgs));
        console.log('leave: ' + nickName);
        res.send({
            'status': 'OK'
        });
    }
});


io.on('connection', function (socket) {
    console.log('a user connected');

    socket.on('disconnect', function () {
        console.log('user disconnected');
    });

    socket.on('add-message', (nickName, message) => {
        const timeStamp = new Date().getTime();
        chat_msgs.push({sender:nickName, msg: message, date: timeStamp});
        client.set(room_name, formattedData(chat_members, chat_msgs));
        io.emit('message', {

            sender: nickName,
            msg: message,
            date: timeStamp
        });
        client.get(room_name, function (err, result) {
            console.log(JSON.parse(result));
        });

        console.log(message);
    });
});


app.get('/get_messages', function (req, res) {
    console.log("getMes");
    console.log(chat_msgs)
    res.send(chat_msgs);
});


app.get('/get_chat_members', function (req, res) {
    res.send(chat_members);
});


function formattedData(chat_members, chat_msgs) {


    return JSON.stringify({
        "chat_members": chat_members,
        "chat_msgs": chat_msgs
    });
}


http.listen(3000, '0.0.0.0', function (err) {
    if (err) throw err
    console.log('listening on 0.0.0.0 port 3000')
})