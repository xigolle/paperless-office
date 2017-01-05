var express = require("express");
var azure = require("azure-storage");
var fs = require("fs");
var multer = require("multer");
var PDF = require('pdfkit');
var Tesseract = require('tesseract.js');
var tesseract = require('node-tesseract');
var merge = require('easy-pdf-merge');
var MongoClient = require('mongodb').MongoClient;
var assert = require('assert');
var config = require("../config.json");
var extract = require("pdf-text-extract");
var commonWords = require("./models/commonWords.js");
//---------------------
// dependencies
var debug = require('debug')('passport-mongo');

var logger = require('morgan');
//var cookieParser = require('cookie-parser'); sinds versie 1.5.0 van express-session is deze niet meer nodig
var bodyParser = require('body-parser');
var expressSession = require('express-session');
var mongoose = require('mongoose');
var hash = require('bcrypt-nodejs');
var path = require('path');
var passport = require('passport');
var localStrategy = require('passport-local').Strategy;

// mongoose
mongoose.connect('mongodb://localhost/mydb');

// user schema/model
var User = require('./models/user.js');

// create instance of express
var app = express();

// require routes
var routes = require('./routes/api.js');


//--------------login-------------------


// define middleware
app.use(express.static(path.join(__dirname, '../../paperless-office-site')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
//app.use(cookieParser()); sinds versie 1.5.0 van express-session is deze niet meer nodig
app.use(require('express-session')({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: false
    //cookie: { secure: true } cookie werkt dan enkel bij https
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(express.static(path.join(__dirname, 'public')));

// configure passport
passport.use(new localStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// routes
app.use('/user/', routes.routes);


//Let's us work with containers and blobs
var blobSvc = azure.createBlobService(config.storageAccountName, config.primaryKey);

var testArray = [];
var mongoUrl = 'mongodb://localhost/mydb';
//app.listen(3000);

app.use(function (req, res, next) {

    // Website you wish to allow to connect
    res.setHeader('Access-Control-Allow-Origin', '*');

    // Request methods you wish to allow
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');

    // Request headers you wish to allow
    res.setHeader('Access-Control-Allow-Headers', '*');

    // Set to true if you need the website to include cookies in the requests sent
    // to the API (e.g. in case you use sessions)
    res.setHeader('Access-Control-Allow-Credentials', true);

    // Pass to next layer of middleware
    next();
});
app.use(express.static('../../paperless-office-site'));

app.get("/api/getDocumentURL/:url", function (req, res) {
    console.log(req.params.url);
    blobSvc.createReadStream(req.user.username, req.params.url).pipe(res)
})

app.get("/api/getDocument", function (req, res) {
    //console.log(req.params.name);
    //console.log(req.get('test'));

    console.log(req.get('test'));
    blobSvc.createReadStream(req.user.username, req.get('test')).pipe(res)

});
app.get("/api/ocr/:url", function (req, res) {

    console.log("run ocr: " + req.params.url);
    Tesseract.recognize("images/eng_bw.png").then(function (result) {

        console.log(result.text);
        console.log("done?");
    })
});
app.get("/api/getDocuments", function (req, res) {
    //console.log(req.user.username);
    //empty array
    console.log("running api/getDocuments");
    testArray = [];
    //This can be used to 'pipe' ONE document directly to the site    
    //blobSvc.createReadStream("test", "Mathias/Knipsel.JPG").pipe(res);

    //Gets all the document names that are in the specified container
    blobSvc.listBlobsSegmented(req.user.username, null, function (error, result, response) {
        //console.log("error" + error);
        //console.log("result" + result);
        //console.log("response" + response);
        console.log("currentUser " + req.user.username);

        if (!error) {

            //Will download all the documents in the specified container
            result.entries.forEach(function (name) {
                //commented out because else it downloads the whole file to the server
                //getDoc("test", name.name);
                //testArray.push(name.name);
                //console.log("logging names");
                //console.log(name);
                testArray.push({ "name": name.name, "date": name.lastModified });


            });

            // result.entries contains the entries
            // If not all blobs were returned, result.continuationToken has the continuation token. 
            res.send(testArray);
            //console.log("log testArray");
            //console.log(testArray);
            //res.send(result.continuationToken);

        } else res.send("Could not get names");
    });

});

//Tries to make a user folder, and catches the error if it already exists. Bad code --> needs to be fixed: empty catch.
var mkdirSync = function (path) {
    try {
        fs.mkdirSync(path);
    } catch (e) {
        //if (e.code != 'EEXIST') console.log( e);
    }
}

//This will define the full storage path for the uploaded files.
var storage = multer.diskStorage({
    destination: function (req, file, callback) {
        mkdirSync("./users/" + req.user.username);
        callback(null, "./users/" + req.user.username);
    },
    filename: function (req, file, callback) {
        callback(null, file.originalname)
    }
});

var upload = multer({ storage: storage }).any("myFile");
function cleanOCROutput(text) {
    var newArray = [];
    strippedResult = text.toString().replace(/[^\w‡‰‚ÙÈËÎÍÔÓÁ˘˚¸ˇÊú¿¬ƒ‘…»À œŒü«Ÿ€‹∆å'`¥^«Á]/g, "").toLowerCase();
    var splitResult = strippedResult.split(" ");
    //console.log("split result length");
    for (var i = 0; i < splitResult.length; i++) {
        if (splitResult[i] != '') {
            //console.log("add to array");
            newArray.push(splitResult[i]);
        }
        //console.log("inside for loops");
        splitResult[i].length;
        //if (splitResult[i] ) {
        //    newArray.push[i];
        //}
    }
    return newArray;
}

var getLabelArray = function (docLabels) {

    var tempLabelArray = docLabels.split("#");
    var labelArray = [];
    tempLabelArray.forEach(function (label) {
        if (label != "") {
            labelArray.push("#" + label.trim());
        }
    });
    return labelArray;
}
function addOcrMongo(text, username, docName) {
    console.log("add extracted text to Mongo");
    MongoClient.connect(mongoUrl, function (err, db) {
        var ocrOutput;
        assert.equal(null, err);
        console.log("Connected succesfully to server");

        var collection = db.collection(username);

        collection.find().toArray(function (err, items) {
            id = items;
            ocrOutput = cleanOCROutput(text);

            ocrOutput.forEach(function (ocrWord) {
                collection.update(
               {
                   "_id": id[0]['_id'],
                   "docs.name": docName
               },
               {

                   $push: {
                       "docs.$.ocrOutput": ocrWord
                   }
               });
            })

        });


        setTimeout(function () {

            db.close();
        }, 100);

    });
}

app.post("/api/uploadDocuments", function (req, res) {
    var aSyncCounter = 0;
    upload(req, res, function (err) {
        if (err) {
            console.log("Error Occured: " + err);
            return;
        }


        console.log(req.body.docName + "    " + req.body.docLabels);
        var userFolder = "./users/" + req.user.username + "/";
        var docName = req.body.docName + ".pdf";

        var labelArray = getLabelArray(req.body.docLabels);
        var fileArray = [];
        var ocrTextArray = [];

        //var ocrTextString;
        var fileExt;
        fs.readdir(userFolder, function (err, files) {
            console.dir(files);
            files.forEach(function (file, index) {
                
              
                fileExt = file.split(".");
                var completeFileUri = userFolder + file;
                console.log("completeFileURI " + completeFileUri);
                console.log("docName" + docName);
                
                if (fileExt[fileExt.length - 1] != "pdf") {
                    //images
                    console.log("file URI" + completeFileUri);
                    tesseract.process(completeFileUri.replace(" ","\\ "), function (err, text) {

                        if (err) {
                            console.error("err" + err);
                        } else {
                            fileArray.push(makePDF(userFolder, file, fileExt[0]));
                            var ocrResult = cleanOCROutput(text);
                            ocrResult.forEach(function (ocrWord) {
                                ocrTextArray.push(ocrWord);
                            });
                            aSyncCounter++;
                            //addOcrMongo(text, req.user.username, docName);
                           
                            if (aSyncCounter === files.length) {
                                //console.dir(ocrTextArray);

                               oCRAsyncCallback()
                            }

                        }
                    });



                } else {
                    //pdfs
                    extract(completeFileUri, { splitPages: false }, function (err, result) {
                        console.log("start extracting PDF text");
                        if (err) {
                            console.dir(err);
                            return
                        }
                        var ocrResult = cleanOCROutput(result);
                        ocrResult.forEach(function (ocrWord) {
                            ocrTextArray.push(ocrWord);
                        });
                        aSyncCounter++;
                        //addOcrMongo(result, req.user.username, docName);

                        if (aSyncCounter === files.length) {
                            console.log("We are at the end lets do a callback!");
                            //console.dir(ocrTextArray);
                            oCRAsyncCallback();
                        }
                    });
                    fileArray.push(userFolder + file);

                }


               
                
            });
            function oCRAsyncCallback() {
                merge(fileArray, docName, function (err) {

                    if (err) {
                        blobSvc.createBlockBlobFromLocalFile(req.user.username, docName, userFolder + fileExt[0] + ".pdf", function (error, result, response) {
                            if (!error) {
                                console.log("success");
                                fileArray.forEach(function (file, index) {
                                    fs.unlinkSync(file);
                                });

                            } else {
                                res.status(500).send("Internal server error.");
                                return;
                            };
                        });
                        return console.log("Not enough files to merge");
                    }


                    blobSvc.createBlockBlobFromLocalFile(req.user.username, docName, docName, function (error, result, response) {
                        if (!error) {
                            console.log("success");
                            fs.unlinkSync(docName);
                            fileArray.forEach(function (file, index) {
                                fs.unlinkSync(file);
                            });

                        } else {
                            res.status(500).send("Internal server error.");
                            return;
                        };
                    });
                });





                MongoClient.connect(mongoUrl, function (err, db) {
                    assert.equal(null, err);
                    console.log("Connected succesfully to server");

                    var collection = db.collection(req.user.username);

                    collection.find().toArray(function (err, items) {
                        id = items;
                        console.log(id[0]['_id']);


                        collection.update(
                    {
                        "_id": id[0]['_id']
                    },
                    {
                        $push: {
                            "docs": {
                                "name": docName,
                                "labels": labelArray,
                                "ocrOutput": ocrTextArray
                            }

                        },
                        function (err, result) {
                            if (err) {
                                return;
                                res.status(500).send("Internal server error.");
                            }
                        }
                    });
                    });





                    setTimeout(function () {

                        db.close();
                    }, 100);

                });
            }

        });



        res.end();
    })

});

//This function will convert images to pdf
var makePDF = function (userFolder, fileName, pdfName) {
    var doc = new PDF();
    var newDoc = userFolder + pdfName + '.pdf';
    doc.pipe(fs.createWriteStream(newDoc));
    doc.image(userFolder + fileName, 0, 0, { fit: [doc.page.width, doc.page.height] });
    doc.end();
    fs.unlinkSync(userFolder + fileName);
    return newDoc;
}

//Function that can be called to download a document to the server
var getDoc = function (container, name) {
    blobSvc.getBlobToStream(container, name, fs.createWriteStream(name), function (error, result, response) {
        if (!error) {
            console.log("blob retrieved");
            //res.sendFile('/home/PaperlessOffice/node-server/output.pdf');
        } else res.status(500).send("Could not retrieve file");
    });
};

app.post("/api/delete", function (req, res) {
    blobSvc.deleteBlob(req.user.username, req.body.docName, function (error, response) {
        if (error) {
            res.status(500).send("Internal server error.");
            return;
        }
    });

    MongoClient.connect(mongoUrl, function (err, db) {
        assert.equal(null, err);
        console.log("Connected succesfully to server");

        var collection = db.collection(req.user.username);

        collection.find().toArray(function (err, items) {
            id = items;
            console.log(id[0]['_id']);


            collection.update(
                {
                    "_id": id[0]['_id']
                },
                {
                    $pull: {
                        "docs": {
                            "name": req.body.docName
                        }

                    }
                },
                function (err, result) {
                    if (err) {
                        res.status(500).send("Internal server error.");
                        return;
                    }
                    if (result) {
                        res.status(200).send("OK");
                    }
                });
        });


        setTimeout(function () { db.close(); }, 100);

    });
});

app.get("/api/getLabels/:url", function (req, res) {
    console.log("in getLabels   " + req.params.url);
    MongoClient.connect(mongoUrl, function (err, db) {
        assert.equal(null, err);
        console.log("Connected succesfully to server");

        var collection = db.collection(req.user.username);

        collection.find({ "docs.name": req.params.url }, { "docs.$": 1 })
            .toArray(function (err, items) {
                console.log(items[0].docs[0].labels);
                res.send(items[0].docs[0].labels);
            });

        setTimeout(function () { db.close(); }, 100);

    });
});

app.get("/api/getLabelSuggestions/:url", function (req, res) {
    MongoClient.connect(mongoUrl, function (err, db) {
        assert.equal(null, err);
        console.log("Connected succesfully to server");

        var collection = db.collection(req.user.username);

        collection.aggregate([
            { "$unwind": "$docs" },
            { "$unwind": "$docs.ocrOutput" },
            { "$match": { "docs.name": req.params.url } },
            {
                "$group": {
                    "_id": "$docs.ocrOutput",
                    "id": { "$first": "$_id" },
                    "count": { "$sum": 1 }
                }
            },
            {
                "$group": {
                    "_id": "$id",
                    "counts": {
                        "$push": {
                            "item": "$_id",
                            "count": "$count"
                        }
                    }
                }
            }
        ]).toArray(function (err, items) {
            for (j = 0; j < commonWords.length; j++) {
                for (i = 0; i < commonWords[j].words.length; i++) {
                    items[0].counts.forEach(function (count) {
                        if (count.item.toLowerCase() === commonWords[j].words[i].toLowerCase()) {
                            var index = items[0].counts.indexOf(count);
                            items[0].counts.splice(index, 1);
                        };
                    });
                };
            };

            var highest = 0;
            items[0].counts.forEach(function (count) {
                if (count.count > highest) {
                    highest = count.count;
                };
            });
            console.log(highest);
            var sortedArray = [];
            for (i = highest; i > 0; i--) {
                items[0].counts.forEach(function (count) {
                    if (count.count === i) {
                        sortedArray.push(count.item);
                    };
                });
            }
            res.send(sortedArray.slice(0, 20));
        });

        setTimeout(function () { db.close(); }, 100);

    });
});

app.post("/api/addLabels", function (req, res) {

    var labelArray = getLabelArray(req.body.newLabel);
    var labelArraySuccess = [];
    var i = 0;

    MongoClient.connect(mongoUrl, function (err, db) {
        assert.equal(null, err);
        console.log("Connected succesfully to server");

        var collection = db.collection(req.user.username);

        collection.find().toArray(function (err, items) {
            id = items;
            console.log(id[0]['_id']);

            labelArray.forEach(function (label) {
                collection.update(
                    {
                        "_id": id[0]['_id'],
                        "docs.name": req.body.docName
                    },
                    {
                        $push: {
                            "docs.$.labels": label

                        }
                    },
                    function (err, result) {
                        if (err) {
                            //adding this label failed, so it won't be send back with the other labels that succeeded.
                        }
                        if (result) {
                            labelArraySuccess.push(label);
                        }
                        i++;
                        if (i === labelArray.length) {
                            res.status(200).send(labelArraySuccess);
                        }
                    });
            });
        });
    })
});

app.post("/api/deleteLabel", function (req, res) {
    console.log(req.body.deleteLabel);
    MongoClient.connect(mongoUrl, function (err, db) {
        assert.equal(null, err);
        console.log("Connected succesfully to server");

        var collection = db.collection(req.user.username);

        collection.find().toArray(function (err, items) {

            id = items;
            console.log(id[0]['_id']);


            collection.update(
                {
                    "_id": id[0]['_id'],
                    "docs.name": req.body.docName
                },
                {
                    $pull: {
                        "docs.$.labels": req.body.deleteLabel

                    }
                },
                function (err, result) {
                    if (err) {
                        res.status(500).send("Internal server error.");
                        return;
                    }
                    if (result) {
                        res.status(200).send("OK.");
                    }
                });
        });

        setTimeout(function () { db.close(); }, 100);
    })
});

app.get("/api/search/:url", function (req, res) {
    console.log("in search   " + req.params.url);
    MongoClient.connect(mongoUrl, function (err, db) {
        assert.equal(null, err);
        console.log("Connected succesfully to server");

        var collection = db.collection(req.user.username);

        var firstSplit = req.params.url.match(/\S+/g);
        var secondSplit = [];
        var labelArray = [];
        var textArray = [];
        var finalArray = [];
        var labelDocsArray = [];
        var textDocsArray = [];

        firstSplit.forEach(function (text) {
            secondSplit.push(text.split("#"));
        })

        secondSplit.forEach(function (text) {
            if (text.length > 1) {
                text.forEach(function (label) {
                    if (label !== "") {
                        labelArray.push("#" + label);
                    }
                })
            } else {
                textArray.push(text[0]);
            }
        })

        let inputLabels = labelArray;
        console.log(inputLabels);
        collection.aggregate([
            { "$match": { "docs.labels": { "$all": inputLabels } } },
            {
                "$project": {
                    "docs": {
                        "$filter": {
                            "input": "$docs",
                            "as": "doc",
                            "cond": { "$setIsSubset": [inputLabels, "$$doc.labels"] }
                        }
                    }
                }
            }
        ]).toArray(function (err, items) {
            if (items.length > 0) {
                labelDocsArray = items[0].docs;
                //console.log(labelArray);
            };
            let inputText = textArray;
            console.log(inputText);
            collection.aggregate([
                { "$match": { "docs.ocrOutput": { "$all": inputText } } },
                {
                    "$project": {
                        "docs": {
                            "$filter": {
                                "input": "$docs",
                                "as": "doc",
                                "cond": { "$setIsSubset": [inputText, "$$doc.ocrOutput"] }
                            }
                        }
                    }
                }
            ]).toArray(function (err, items) {
                if (items.length > 0) {
                    textDocsArray = items[0].docs;
                    //console.log(textArray);
                };
                if (labelArray.length === 0) {
                    res.send(textDocsArray);
                } else if (textArray.length === 0) {
                    res.send(labelDocsArray);
                } else {
                    textDocsArray.forEach(function (text) {
                        labelDocsArray.forEach(function (label) {
                            if (text.name === label.name) {
                                finalArray.push(label);
                            }
                        });
                    });
                    res.send(finalArray);
                }
            });
        });

        setTimeout(function () { db.close(); }, 100);

    });
});

app.get("/api/getDocumentSuggestions/:url", function (req, res) {
    MongoClient.connect(mongoUrl, function (err, db) {
        assert.equal(null, err);
        console.log("Connected succesfully to server");

        var collection = db.collection(req.user.username);

        collection.find({ "docs.name": req.params.url }, { "docs.$": 1 }).toArray(function (err, items) {
            
            var docArray = [];
            var counter = 1;
            var labelArray = items[0].docs[0].labels;

            for (i = 0; i < labelArray.length; i++) {
                let label = [labelArray[i]];
                collection.aggregate([
                    // Get just the docs that contain a shapes element where color is 'red'
                    { "$match": { "docs.labels": { "$all": label } } },
                    {
                        "$project": {
                            "docs": {
                                "$filter": {
                                    "input": "$docs",
                                    "as": "doc",
                                    "cond": { "$setIsSubset": [label, "$$doc.labels"] }
                                }
                            }
                        }
                    }
                ]).toArray(function (err, items) {
                    for (j = 0; j < items[0].docs.length; j++) {
                        if (items[0].docs[j].name !== req.params.url) {
                            docArray.push(items[0].docs[j].name);
                        };
                    };                                     
                    if (counter === labelArray.length) {
                        docArray.sort();
                        var docCountArray = [];
                        var current = null;
                        var cnt = 0;
                        for (var i = 0; i <= docArray.length; i++) {
                            if (docArray[i] != current) {
                                if (cnt > 0) {
                                    docCountArray.push({"count": cnt, "name":current})
                                    console.log(current + ' comes --> ' + cnt + ' times');
                                }
                                current = docArray[i];
                                cnt = 1;
                            } else {
                                cnt++;
                            }
                        }
                        var highest = 0;
                        docCountArray.forEach(function (count) {
                            if (count.count > highest) {
                                highest = count.count;
                            };
                        });
                        docArray = [];
                        for (i = highest; i > 0; i--) {
                            docCountArray.forEach(function (count) {
                                if (count.count === i) {
                                    docArray.push(count.name);
                                };
                            });
                        }
                        res.send(docArray);
                    }
                    counter++;
                });
               
            };
            
           
        });

        setTimeout(function () { db.close(); }, 100);

    });
});

// error handlers
/*app.use(function (req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

app.use(function (err, req, res) {
    res.status(err.status || 500);
    res.end(JSON.stringify({
        message: err.message,
        error: {}
    }));
});*/

app.listen(3000);
