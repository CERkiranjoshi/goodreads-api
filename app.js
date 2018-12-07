'use strict';
const express = require("express");
const bodyParser = require("body-parser");
const config = require("config")
const request = require('request');
const xml2js = require('xml2js');
const HttpStatus = require('http-status-codes');
var app = express();
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PATCH, DELETE, OPTIONS"
  );
  next();
});

const opt = {
  trim: true,
  ignoreAttrs: true,
  explicitArray: false
}

const parser = new xml2js.Parser(opt)
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.set('port', process.env.PORT || 5000);
app.set('view engine', 'ejs');

/*
 * Be sure to setup your config values before running this code. You can
 * set them using environment variables or modifying the config file in /config.
 *
 */

const APP_KEY = (process.env.APP_KEY) ?
  process.env.APP_KEY :
  config.get('goodReadsKey');

const API_URL = (process.env.API_URL) ?
  (process.env.API_URL) :
  config.get('goodReadsAPIURL');

if (!(APP_KEY && API_URL)) {
  console.error("Missing config values");
  process.exit(1);
}

app.get("/api/books/search/id", (req, res, next) => {
  request({
    url: API_URL + "book/show/18646.xml?key=" + APP_KEY,
    method: 'GET',
    format: 'json',
    headers: { 'Content-Type': 'application/json' }
  },
    function (error, response, body) {
      if (!error && response.statusCode == 200) {
        console.log(response)
        parser.parseString(body, function (err, optdata) {
          res.status(HttpStatus.OK).json({
            result: "success",
            message: "Bookd deatils retrieved successfully",
            data: optdata
          });
        });

      } else {
        res.status(HttpStatus.BAD_REQUEST).json({
          result: "error",
          message: HttpStatus.getStatusText(HttpStatus.BAD_REQUEST),
          data: error
        });
      }
    });
});

app.get("/api/books/search", (req, res, next) => {
  request({
    url: API_URL + "search/index.xml?key=" + APP_KEY + "&q=science",
    method: 'GET',
    headers: { 'Content-Type': 'application/json' }
  },
    function (error, response, body) {
      if (!error && response.statusCode == 200) {
        parser.parseString(body, function (err, optdata) {
          res.status(HttpStatus.OK).json({
            result: "success",
            message: "Books search completed successfully",
            data: optdata
          });
        });

      } else {
        res.status(HttpStatus.BAD_REQUEST).json({
          result: "error",
          message: HttpStatus.getStatusText(HttpStatus.BAD_REQUEST),
          data: error
        });
      }
    });
});

app.listen(app.get('port'), function () {
  console.log('Node app is running on port', app.get('port'));
});

module.exports = app;
