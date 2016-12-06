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
//var bodyparser = require("body-parser");
var app = express();
//Let's us work with containers and blobs
var blobSvc = azure.createBlobService(config.storageAccountName, config.primaryKey);

var testArray = [];
app.listen(5000);

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
app.get("/", function (req, res) {
});
app.get("/api/getDocumentURL/:url", function (req, res) {
    console.log(req.params.url);
    blobSvc.createReadStream("test", req.params.url).pipe(res)
})

app.get("/api/getDocument", function (req, res) {
    //console.log(req.params.name);
    //console.log(req.get('test'));
    console.log(req.get('test'));
    blobSvc.createReadStream("test", req.get('test')).pipe(res)

});
app.get("/api/getDocuments", function (req, res) {
    //empty array
    testArray = [];
    //This can be used to 'pipe' ONE document directly to the site    
    //blobSvc.createReadStream("test", "Mathias/Knipsel.JPG").pipe(res);

    //Gets all the document names that are in the specified container
    blobSvc.listBlobsSegmented("test", null, function(error, result, response){
  	if(!error){
	    //Will download all the documents in the specified container
  	    result.entries.forEach(function (name) {
            //commented out because else it downloads the whole file to the server
	        //getDoc("test", name.name);
  	        //testArray.push(name.name);
  	        testArray.push({ "name": name.name, "date": name.lastModified });
            
   	        
	    });
            
      	    // result.entries contains the entries
  	    // If not all blobs were returned, result.continuationToken has the continuation token. 
	    res.send(testArray);
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
        mkdirSync("./users/" + req.body.user);     
        callback(null, "./users/"+req.body.user);
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
        var userFolder = "./users/" + req.body.user + "/";
        var docName = req.body.docName + ".pdf";
        var docLabels = req.body.docLabels;
        var tempLabelArray = docLabels.split("#");
        var labelArray = [];
        tempLabelArray.forEach(function (label) {
            if (label != "") {
                labelArray.push(label.trim());
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
                    blobSvc.createBlockBlobFromLocalFile("test", docName, userFolder + fileExt[0] + ".pdf", function (error, result, response) {
                        if (!error) {
                            console.log("success");                        
                            fileArray.forEach(function (file, index) {
                                fs.unlinkSync(file);
                            });

                        } else console.log(error);
                    });
                    return console.log("Not enough files to merge");
                }
                    

                
                blobSvc.createBlockBlobFromLocalFile("test", docName, docName, function (error, result, response) {
                    if (!error) {
                        console.log("success");
                        fs.unlinkSync(docName);
                        fileArray.forEach(function (file, index) {
                            fs.unlinkSync(file);
                        });
                      
                    } else console.log(error);
                });
            });


            var url = 'mongodb://13.94.234.60:27017/mydb';


            MongoClient.connect(url,function(err,db)
            {
                assert.equal(null,err);
                console.log("Connected succesfully to server");
    
                var collection = db.collection(req.body.user);
                
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
    console.log(req.file);
    
});

app.post('http://paperless-office.westeurope.cloudapp.azure.com/api/search', function(req,res){
    
    var Query={};
    Query.searchLabel = new RegEXP(req.body.searchLabel, 'i');
    
    console.log(req.body.searchLabel);
    
    SearchLabel.find({docs:{$elemMatch:{labels:Query}}}, function(error,searchLabels){
        if(error){
            return res.status(400).send({msg:"error occured"});
        }
        return res.status(200).send(searchLabels);
        console.log(searchLabels);
    })
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
var getDoc = function(container, name) {
    blobSvc.getBlobToStream(container, name, fs.createWriteStream(name), function(error, result, response){
    	if(!error){
	     console.log("blob retrieved");
             //res.sendFile('/home/PaperlessOffice/node-server/output.pdf');
        } else res.send("Could not retrieve file");
    });
}