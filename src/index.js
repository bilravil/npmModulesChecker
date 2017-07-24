const express = require('express');
const url = require('url');
const bodyParser = require('body-parser');
const jsonParser = bodyParser.json();
const app = express();
const http = require('http').Server(app);
const fs = require('fs');

const port = 8088;

const func = require('./app.js');

function Run(callback) {
    app.all('*', function(req, res, next) {
        res.header("Access-Control-Allow-Origin", "*");
        res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
        res.header('Access-Control-Allow-Headers', 'Content-type,Accept,X-Access-Token,X-Key');
        if (req.method == 'OPTIONS') {
            res.status(200).end();
        } else {
            +
            next();
        }
    });

    app.get('/Get', jsonParser, function(req, res) {
        if (!req.body) return res.send({ success: false, message: "Invalid arguments" });

        let pth = req.query.url;
        if(pth.indexOf('github.com') < 0)  {
        	res.status(400);
            return res.send('bad url!');
            }
        

        func.getPackageJSON(pth).then(
            result => {
                res.status(200);
                res.send(result);
            },
            error => {
                res.status(400);
                res.send(error);
            })


    });

    app.use(express.static(__dirname + '/app'));

    http.listen(port, function() {
        callback(`Server started on port ${port}`);
    });
}

Run(function(msg) { console.log(msg); });