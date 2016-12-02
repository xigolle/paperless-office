var express = require('express');
var router = express.Router();
var passport = require('passport');
var MongoClient = require('mongodb').MongoClient;
var assert = require('assert');
var azure = require("azure-storage");
var User = require('../models/user.js');

var config = require("../../config.json");
var blobSvc = azure.createBlobService(config.storageAccountName, config.primaryKey);


router.post('/register', function (req, res) {
    
    User.register(new User({ username: req.body.username }),
      req.body.password, function (err, account) {
          if (err) {
              return res.status(500).json({
                  err: err
              });
          }
          passport.authenticate('local')(req, res, function () {
              return res.status(200).json({
                  status: 'Registration successful!'
              });
          });
          //Make collection for new user
          var url = 'mongodb://localhost/mydb';


          MongoClient.connect(url, function (err, db) {
              assert.equal(null, err);
              console.log("Connected succesfully to server");
              db.createCollection(req.body.username);
          });

          //Make container for new user
          blobSvc.createContainerIfNotExists(req.body.username, function (error, result, response) {
              if (!error) {
                  // Container exists and is private
              } else if (result.created) {
                  //container has been created
              } else if (!result.created) {
                  //container already exists
              }

          });

      });
});

router.post('/login', function (req, res, next) {
    passport.authenticate('local', function (err, user, info) {
        if (err) {
            return next(err);
        }
        if (!user) {
            return res.status(401).json({
                err: info
            });
        }
        req.logIn(user, function (err) {
            if (err) {
                return res.status(500).json({
                    err: 'Could not log in user'
                });
            }
            res.status(200).json({
                status: 'Login successful!'
            });
            //makes sure that we can use the username to determine which files to show
            module.exports.currentUser = user.username;
        });
    })(req, res, next);
});

router.get('/logout', function (req, res) {
    req.logout();
    res.status(200).json({
        status: 'Bye!'
    });
});

router.get('/status', function (req, res) {
    debugger;
    if (!req.isAuthenticated()) {
        return res.status(200).json({
            status: false
        });
    }
    res.status(200).json({
        status: true
    });
});


module.exports.routes = router;