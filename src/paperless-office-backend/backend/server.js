var express = require("express");
var azure = require("azure-storage");
var fs = require("fs");
var config = require("../config.json");
//var bodyparser = require("body-parser");
var app = express();
//Let's us work with containers and blobs
var blobSvc = azure.createBlobService(config.storageAccountName, config.primaryKey);

var testArray = [];
app.listen(3000);

app.use(function (req, res, next) {

    // Website you wish to allow to connect
    res.setHeader('Access-Control-Allow-Origin', '*');

    // Request methods you wish to allow
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');

    // Request headers you wish to allow
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type,test,Accept-Ranges');

    // Set to true if you need the website to include cookies in the requests sent
    // to the API (e.g. in case you use sessions)
    res.setHeader('Access-Control-Allow-Credentials', true);

    // Pass to next layer of middleware
    next();
});
app.use(express.static('/website'));
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

app.get("/api/uploadDocuments", function(req, res) {
    //werken met block blobs, append blobs of page blobs?
    //blob maken adhv een file die naar de server wordt gestuurd en er dus opstaat
    //of werken met write stream?

    //local file
    blobSvc.createBlockBlobFromLocalFile("test", "test.txt", "test.txt", function(error, result, response) {
	if(!error) {
	    res.send("file uploaded");
        };
    });

    //writeStream
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




