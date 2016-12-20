var express = require("express");
var azure = require("azure-storage");
var fs = require("fs");
var multer = require("multer");
//-------------------
var PDF = require('pdfkit');
var merge = require('easy-pdf-merge');
//-------------------
var MongoClient = require('mongodb').MongoClient;
var assert = require('assert');
//-------------------
var config = require("../config.json");

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

//---------------------------

app.use(bodyParser.json());

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
    blobSvc.createReadStream(routes.currentUser, req.params.url).pipe(res)
});

app.get("/api/getDocument", function (req, res) {
    //console.log(req.params.name);
    //console.log(req.get('test'));
	
    console.log(req.get('test'));
    blobSvc.createReadStream(routes.currentUser, req.get('test')).pipe(res)

});
app.get("/api/getDocuments", function (req, res) {
    //console.log(routes.currentUser);
    //empty array
    console.log("running api/getDocuments");
    testArray = [];
    //This can be used to 'pipe' ONE document directly to the site    
    //blobSvc.createReadStream("test", "Mathias/Knipsel.JPG").pipe(res);

    //Gets all the document names that are in the specified container
    blobSvc.listBlobsSegmented(routes.currentUser, null, function (error, result, response) {
        //console.log("error" + error);
        //console.log("result" + result);
        //console.log("response" + response);
        console.log("currentUser " + routes.currentUser);

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
};

//This will define the full storage path for the uploaded files.
var storage = multer.diskStorage({
    destination: function (req, file, callback) {
        mkdirSync("./users/" + routes.currentUser);     
        callback(null, "./users/"+ routes.currentUser);
    },
    filename: function (req, file, callback) {
        callback(null, file.originalname)
    }
});

var upload = multer({ storage: storage }).any("myFile");

app.post("/api/uploadDocuments", function (req, res) {
   upload(req, res, function (err) {
        if (err) {
            console.log("Error Occured: " + err);
            return;
        }  
        
       
        console.log(req.body.docName + "    " + req.body.docLabels);
        var userFolder = "./users/" + routes.currentUser + "/";
        var docName = req.body.docName + ".pdf";
        var docLabels = req.body.docLabels;
        var tempLabelArray = docLabels.split("#");
        var labelArray = [];
        tempLabelArray.forEach(function (label) {
            if (label != "") {
                labelArray.push("#" + label.trim());
            }
        });
        var fileArray = [];
        var fileExt;
        fs.readdir( userFolder, function( err, files ) {
            files.forEach(function (file, index) {
                
                fileExt = file.split(".");
               
                if (fileExt[fileExt.length - 1] != "pdf") {
                    fileArray.push(makePDF(userFolder, file, fileExt[0]));
                } else fileArray.push(userFolder + file);
                
                
            });

            merge(fileArray, docName, function (err) {

                if (err) {
                    blobSvc.createBlockBlobFromLocalFile(routes.currentUser, docName, userFolder + fileExt[0] + ".pdf", function (error, result, response) {
                        if (!error) {
                            console.log("success");                        
                            fileArray.forEach(function (file, index) {
                                fs.unlinkSync(file);
                            });

                        } else console.log(error);
                    });
                    return console.log("Not enough files to merge");
                }
                    

                
                blobSvc.createBlockBlobFromLocalFile(routes.currentUser, docName, docName, function (error, result, response) {
                    if (!error) {
                        console.log("success");
                        fs.unlinkSync(docName);
                        fileArray.forEach(function (file, index) {
                            fs.unlinkSync(file);
                        });
                      
                    } else console.log(error);
                });
            });


     


            MongoClient.connect(mongoUrl,function(err,db)
            {
                assert.equal(null,err);
                console.log("Connected succesfully to server");
    
                var collection = db.collection(routes.currentUser);
                
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
                                    "ocrOutput": "OCR_output"
                                }
                                                                  
                            }
                        });
                    
                    
                });
                

              
                setTimeout(function () {
                  
                    db.close();
                }, 100);
                
            });
            
            
        });
        


        res.end();
    })
    
});

app.post('/api/search', function(req,res){
    
        var searchLabels = req.body.searchLabel;
    
                MongoClient.connect(mongoUrl,function(err,db)
            {
                assert.equal(null,err);
                console.log("Connected succesfully to server");
    
                var collection = db.collection(routes.currentUser);
                
                collection.find({
                    "docs":{
                        "labels":req.body.searchLabel
                    }
                },function(err,searchLabels){
                    
                    console.log("I FOUND SOMETHING");
                    console.log(searchLabels);
                });
                

              
                setTimeout(function () {
                  
                    db.close();
                }, 100);
                
            });
    
})
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
        } else res.send("Could not retrieve file");
    });
};

app.post("/api/delete", function (req, res) {
    blobSvc.deleteBlob(routes.currentUser, req.body.docName, function (error, response) {
        if (!error) {
            // Blob has been deleted
        }
    });

    MongoClient.connect(mongoUrl, function (err, db) {
        assert.equal(null, err);
        console.log("Connected succesfully to server");

        var collection = db.collection(routes.currentUser);

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
                });
        });


        setTimeout(function () {db.close();}, 100);

    });
});

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

// error handlers
app.use(function (req, res, next) {
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
})

app.listen(5000);


