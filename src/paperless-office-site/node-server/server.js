var express = require("express");
var azure = require("azure-storage");
var fs = require("fs");
var multer = require("multer");
var config = require("../config.json");
//var bodyparser = require("body-parser");
var app = express();
//Let's us work with containers and blobs
var blobSvc = azure.createBlobService(config.storageAccountName, config.primaryKey);

var testArray = [];

app.listen(3000);


//This will show the website when a person visits 13.94.234.60:3000
app.use(express.static("../website"));

app.get("/api/getDocument", function (req, res) {
    //console.log(req.params.name);
    console.log(req.get('test'));
    //blobSvc.createReadStream("test", req.params.name).pipe(res)

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
	    result.entries.forEach(function(name) {
	        getDoc("test", name.name);
	        testArray.push(name.name);
            
   	        
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
        var userFolder = "./users/" + req.body.user

        //voor demo: documenten worden ineens naar storage gestuurd
        fs.readdir( userFolder, function( err, files ) {
            files.forEach(function (file, index) {
                blobSvc.createBlockBlobFromLocalFile("test", file, userFolder + "/" + file, function (error, result, response) {
                    if (!error) {
                        console.log("success");
                        fs.unlinkSync(userFolder + "/" + file);
                    } else console.log(error);
                });
            });
        });      

        res.end();
    })
});

//Function that can be called to download a document to the server
var getDoc = function(container, name) {
    blobSvc.getBlobToStream(container, name, fs.createWriteStream(name), function(error, result, response){
    	if(!error){
	     console.log("blob retrieved");
             //res.sendFile('/home/PaperlessOffice/node-server/output.pdf');
        } else res.send("Could not retrieve file");
    });
}




