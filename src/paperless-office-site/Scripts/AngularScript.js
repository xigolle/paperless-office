//Here goes the code to developer with Angular
var app = angular.module("app", []);

app.service('DocumentService', function ($http) {

    this.items = [];
    this.DocumentNames = [];

    //this call doesn't get used at the moment will be maybe used in later us when we decide to use headers.
    this.getDocument = function () {
        console.log("get document function started");
        $http({
            method: 'GET',
            url: "http://paperless-office.westeurope.cloudapp.azure.com/api/getDocument",
            headers: {
                "test": "Bedrijven.pdf"
            }

        }).then(function successCallback(response) {
            console.log("succes" + response);
        }, function errorCallback(response) {
            console.log("error" +response);
        });
    }
    this.getAmountDocuments = function () {
        console.log("Get amount of documents and name");
        return $http.get("http://localhost:3000/api/getDocuments");
    
    }
})



app.controller("testCTRL", function ($scope, DocumentService) {
   
    

    //start function to show thumbnails of documents
    //makes sure it runs when the website starts
    showThumbnailOfDocuments();


    function showThumbnailOfDocuments() {
        var documentCallback = DocumentService.getAmountDocuments();
        documentCallback.then(function (documentNames) {
            ////after the list of documents is collected start getting documents
            //console.log("Logged promise");
            //console.log(payload.data);
            //showThumbnailOfDocuments(payload.data)
            for (var i = 0; i < documentNames.data.length; i++) {
                var URLReadyDocument = encodeURI(documentNames.data[i]);

                showMultiplePDFDocument("http://localhost:3000/api/getDocumentURL/" + URLReadyDocument, "canvas" + i, URLReadyDocument);
            }
        });

    }
    
   
});


