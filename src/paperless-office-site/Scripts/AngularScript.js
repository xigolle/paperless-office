
var app = angular.module("app", []);
var fd = new FormData();
var userAdded = false;

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
        //console.log("DocumentCallback" + documentCallback);
        //console.log(documentCallback);
        documentCallback.then(function (documentNames) {
            ////after the list of documents is collected start getting documents
            //console.log("Logged promise");
            //console.log(payload.data);
            //showThumbnailOfDocuments(payload.data)
            //console.log(documentNames);
            function sortNumber(a, b) {
                //console.log(a.date);
                //console.log(b.date);
                return b.date - a.date;
                //return a - b;
            }
            var test = Date.parse(documentNames.data[0].date);
            //console.log(test);
            //console.log(newArray);
            console.log("unsorted");
            console.log(documentNames.data);
            for (var i = 0; i < documentNames.data.length; i++) {
                documentNames.data[i].date = Date.parse(documentNames.data[i].date);

            }
            //console.log(documentNames.data);
            console.log("test array");
            var testArray = ['40', '45000', '30', '200'];
            //console.log(testArray);
            //testArray.sort(sortNumber);
            console.log("test array sorted");
            //console.log(testArray);

            documentNames.data.sort(sortNumber);
            console.log(documentNames.data);
            console.log("sorted");
            //console.log(documentNames.data);
            for (var i = 0; i < documentNames.data.length; i++) {

                //documentNames.data[i].date = Date.parse(documentNames.data[i].date);
                //console.log("unsorted");
                //console.log(documentNames.data[i].date);

                //console.log("sorted");
                //console.log(documentNames.data[i].date);
                //console.log(documentNames.data[i]);
                var newDocumentHolder = document.createElement('div');

                var documentCanvas = document.createElement('canvas');
                var documentIdentifier = document.createElement('span');

                //var documentIdentifierText = document.createTextNode(decodeURI(currentDoc));
                documentIdentifier.className = "document-identifier";
                //documentIdentifier.appendChild(documentIdentifierText);

                newDocumentHolder.className = "Canvas-Document ";
                documentCanvas.width = 306;
                documentCanvas.height = 396;
                documentCanvas.id = "canvass"+i;
                var PDFWrapper = document.getElementById("Canvas-Document-Holder");
                //PDFWrapper.appendChild(newDocumentHolder);
                //newDocumentHolder.appendChild(newCanvas);
                newDocumentHolder.appendChild(documentIdentifier);
                newDocumentHolder.appendChild(documentCanvas);
                PDFWrapper.appendChild(newDocumentHolder);
                var URLReadyDocument = encodeURI(documentNames.data[i].name);
                //console.log("Test" + URLReadyDocument);
                //console.log("test"+documentNames.data[i]);

                showMultiplePDFDocument("http://paperless-office.westeurope.cloudapp.azure.com/api/getDocumentURL/" + URLReadyDocument, "canvass" + i, URLReadyDocument);
            }
        });

    }
});


app.controller("uploadController", function ($scope, $http) {



    $scope.upload = function () {

        if (userAdded) {
            $http.post("paperless-office.westeurope.cloudapp.azure.com/api/uploadDocuments", fd, {
                withCredentials: true,
                headers: { 'Content-Type': undefined },
                transformRequest: angular.identity
            }).then(function successCallback(response) {
                console.log("success");
            }, function errorCallback(response) {
                console.log("failure");
            });

            fd = new FormData();
            userAdded = false;
        }
    }

    $scope.addFile = function (files) {

        if (!userAdded) {
            //Met deze lijn kunnen we de user meegeven
            fd.append("user", "Mathias Samyn");
            userAdded = true;
        }
        angular.forEach(files, function (file) {
            fd.append("file", file);
        });

    }

});


