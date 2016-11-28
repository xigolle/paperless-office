﻿
var app = angular.module("app", []);
Array.prototype.remove = function (from, to) {
    //Code from:
    //http://stackoverflow.com/questions/500606/deleting-array-elements-in-javascript-delete-vs-splice
    //makes it easier to delete from array. Array Remove - By John Resig (MIT Licensed)
    var rest = this.slice((to || from) + 1 || this.length);
    this.length = from < 0 ? this.length + from : from;
    return this.push.apply(this, rest);
};

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
            console.log("error" + response);
        });
    }
    this.getAmountDocuments = function () {
        console.log("Get amount of documents and name");
        return $http.get("http://paperless-office.westeurope.cloudapp.azure.com/api/getDocuments");

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
            function sortNumber(a, b) {
                return b.date - a.date;
            }
            var test = Date.parse(documentNames.data[0].date);
            for (var i = 0; i < documentNames.data.length; i++) {
                documentNames.data[i].date = Date.parse(documentNames.data[i].date);

            }
          

            documentNames.data.sort(sortNumber);
            for (var i = 0; i < documentNames.data.length; i++) {

                
                var newDocumentHolder = document.createElement('div');

                var documentCanvas = document.createElement('canvas');
                var documentIdentifier = document.createElement('span');

                var documentIdentifierText = document.createTextNode(decodeURI(documentNames.data[i].name));
                documentIdentifier.className = "document-identifier";
                documentIdentifier.appendChild(documentIdentifierText);

                newDocumentHolder.className = "Canvas-Document ";
                documentCanvas.width = 306;
                documentCanvas.height = 396;
                documentCanvas.id = "canvass"+i;
                var PDFWrapper = document.getElementById("Canvas-Document-Holder");
                
                newDocumentHolder.appendChild(documentIdentifier);
                newDocumentHolder.appendChild(documentCanvas);
                PDFWrapper.appendChild(newDocumentHolder);
                var URLReadyDocument = encodeURI(documentNames.data[i].name);
                

                showMultiplePDFDocument("http://paperless-office.westeurope.cloudapp.azure.com/api/getDocumentURL/" + URLReadyDocument, "canvass" + i, URLReadyDocument);
            }
        });

    }
});


app.controller("uploadController", function ($scope, $http) {

    var fd = new FormData();
    var userAdded = false;
    var docNameAdded = false;

    $scope.collapseDetails = "collapse";
    $scope.collapseZone = "";
    $scope.docName = "";
    $scope.docLabels = "";


    $scope.upload = function () {

        if (userAdded) {
            $scope.collapseDetails = "";
            $scope.collapseZone = "collapse";
            console.log($scope.docName);
            if ($scope.docName.split(' ').join('') != "") {
                docNameAdded = true;
                fd.append("docName", $scope.docName);
                fd.append("docLabels", $scope.docLabels);
                $scope.docName = "";
                console.log("User Added!!!");
                console.log(fd.keys);
            }
            if (docNameAdded) {
                $http.post("http://paperless-office.westeurope.cloudapp.azure.com/api/uploadDocuments", fd, {
                    //withCredentials: true,
                    headers: { 'Content-Type': undefined },
                    transformRequest: angular.identity
                }).then(function successCallback(response) {
                    console.log("success");                 
                }, function errorCallback(response) {
                    console.log("failure");
                });

                $scope.collapseDetails = "collapse";
                $scope.collapseZone = "";
                console.log("Logging FD!");
                console.log(fd.keys());
                fd = new FormData();
                userAdded = false;
                docNameAdded = false;
            } else {
                $scope.myStyle = { "border-color": "red" };
            }
            
        } else {
            $scope.myStyle = { "border-color": "darkred" };
        }
        
    }
    $scope.removeFromFormData = function (name) {
        
        var tempArray = fd.getAll("file");
        for (var i = 0; i < tempArray.length; i++) {
            if (tempArray[i].name === name) {
                tempArray.remove(i);
            }
        }
        fd = new FormData();
        for (var i = 0; i < tempArray.length; i++) {
            fd.append("file", tempArray[i]);
        }

    }
    $scope.addFile = function (files) {
        $scope.myStyle = { "border-color": "gray" };
        console.log($scope.myStyle);
        if (!userAdded) {
            //Met deze lijn kunnen we de user meegeven
            fd.append("user", "mathiassamyn@hotmail.com");
            userAdded = true;
        }
        angular.forEach(files, function (file) {
            fd.append("file", file);
        });
        
       
        //console.log(files);
    }

});


