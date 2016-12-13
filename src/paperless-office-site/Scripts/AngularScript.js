
var app = angular.module("app", ["ngRoute", "angular-loading-bar"])
.config(['cfpLoadingBarProvider', function (cfpLoadingBarProvider) {
    cfpLoadingBarProvider.parentSelector = '#upload';
    cfpLoadingBarProvider.spinnerTemplate = '<div id="loading-bar-spinner"><div class="spinner-icon"></div></div><div id="uploading-text" class="fa fa-spinner">Uploading...</div>';
    cfpLoadingBarProvider.includeSpinner = true;
}])

function addUploadStatus(classname) {
    var spanObject = "#submit span";
    var SuccesfullyUploaded = false;
    if ($(spanObject).hasClass("upload-succes")) SuccesfullyUploaded = true;  
    else SuccesfullyUploaded = false;
    


    $(spanObject).removeClass("upload-noDocuments");
    $(spanObject).removeClass("upload-error");
    $(spanObject).removeClass("upload-hasDocuments");
    $(spanObject).removeClass("upload-succes");
    $(spanObject).removeClass("upload-progress");
    $(spanObject).removeClass("glyphicon-ok-sign");
    $(spanObject).removeClass("glyphicon-remove-circle");
    $(spanObject).removeClass("glyphicon-ok-circle");
    if (!SuccesfullyUploaded) {
        switch (classname) {
            case "upload-noDocuments":
            case "upload-error":
                $(spanObject).addClass("glyphicon-remove-circle");
                break;
            case "upload-progress":
            case "upload-hasDocuments":
                $(spanObject).addClass("glyphicon-ok-circle");

                break;
            case "upload-succes":
                $(spanObject).addClass("glyphicon-ok-sign");
                $("#previewDocuments").empty();

                break;

            default:

        }
        $(spanObject).addClass(classname);
    } else {
        console.log("else gets called");
        //there are no documents and there is pressed on the upload button
        $("#upload").removeClass("uploadToggled");
        $(spanObject).addClass("upload-noDocuments");

    }


}
Array.prototype.remove = function (from, to) {
    //Code from:
    //http://stackoverflow.com/questions/500606/deleting-array-elements-in-javascript-delete-vs-splice
    //makes it easier to delete from array. Array Remove - By John Resig (MIT Licensed)
    var rest = this.slice((to || from) + 1 || this.length);
    this.length = from < 0 ? this.length + from : from;
    return this.push.apply(this, rest);
};

app.service('DocumentService', function ($http, cfpLoadingBar) {

    this.items = [];
    this.DocumentNames = [];

    //this call doesn't get used at the moment will be maybe used in later us when we decide to use headers.
    this.getDocument = function () {
        $http({
            method: 'GET',
            url: "/api/getDocument",
            ignoreLoadingBar: true,
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
        return $http.get("/api/getDocuments");

    }
})



app.controller("testCTRL", function ($scope, DocumentService, cfpLoadingBar) {



    //start function to show thumbnails of documents
    //makes sure it runs when the website starts
    showThumbnailOfDocuments();

    function showThumbnailOfDocuments() {
        var documentCallback = DocumentService.getAmountDocuments();
        documentCallback.then(function (documentNames) {
            if (!(documentNames.length <= 0)) {
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
                    documentCanvas.id = "canvass" + i;
                    var PDFWrapper = document.getElementById("Canvas-Document-Holder");

                    newDocumentHolder.appendChild(documentIdentifier);
                    newDocumentHolder.appendChild(documentCanvas);
                    PDFWrapper.appendChild(newDocumentHolder);
                    var URLReadyDocument = encodeURI(documentNames.data[i].name);


                    showMultiplePDFDocument("/api/getDocumentURL/" + URLReadyDocument, "canvass" + i, URLReadyDocument);
                    //cfpLoadingBar.start();

                }
            }
        });

    }
});


app.controller("uploadController", function ($scope, $http) {

    var fd = new FormData();
    var firstDocAdded = false;
    var docNameAdded = false;

    $scope.collapseDetails = "collapse";
    $scope.collapseZone = "";
    $scope.docName = "";
    $scope.docLabels = "";


    $scope.upload = function () {

        console.log("calling upload function");
        addUploadStatus("upload-progress");
        if (firstDocAdded) {
            $scope.collapseDetails = "";
            $scope.collapseZone = "collapse";
            if ($scope.docName.split(' ').join('') != "") {
                docNameAdded = true;
                fd.append("docName", $scope.docName);
                fd.append("docLabels", $scope.docLabels);
                $scope.docName = "";
            }
            if (docNameAdded) {
                $http.post("/api/uploadDocuments", fd, {
                    //withCredentials: true,
                    headers: { 'Content-Type': undefined },
                    transformRequest: angular.identity
                }).then(function successCallback(response) {
                    console.log("success");

                    addUploadStatus("upload-succes");
                }, function errorCallback(response) {
                    console.log("failure");
                    addUploadStatus("upload-error");

                });

                $scope.collapseDetails = "collapse";
                $scope.collapseZone = "";
                fd = new FormData();
                firstDocAdded = false;
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
        if (tempArray.length <= 0) {
            docNameAdded = false;
            addUploadStatus("upload-noDocuments");
        }
        for (var i = 0; i < tempArray.length; i++) {

            fd.append("file", tempArray[i]);
        }

    }
    $scope.addFile = function (files) {
        $scope.myStyle = { "border-color": "gray" };
        console.log($scope.myStyle);
        if (!firstDocAdded) {
            //Met deze lijn kunnen we de user meegeven
            //fd.append("user", "mathiassamyn@hotmail.com");
            firstDocAdded = true;
        }
        angular.forEach(files, function (file) {
            fd.append("file", file);
        });

    }

});

app.controller('deleteController', function ($scope, $http, $route, cfpLoadingBar) {
    $scope.delete = function () {
app.controller("searchController", function( $scope, $http){
    
    $scope.searchLabel = "";
    $scope.find = function (){
        $http.post('http://paperless-office.westeurope.cloudapp.azure.com/api/search',$scope.searchLabel)
            .then(function(response){
            $scope.searchLabels = response.data;
        })
    }
});

        console.log(getDocName());

        $http.post("/api/delete", { "docName": getDocName() }, { ignoreLoadingBar: true }).then(function successCallback(response) {
            console.log("delete was a success");
        }, function errorCallback(response) {
            console.log("delete was a failure");
        });

        $route.reload();
    }
});



//--------------------------------

app.config(function ($routeProvider) {
    $routeProvider
      .when('/', {
          templateUrl: 'partials/home.html',
          access: { restricted: true }
      })
      .when('/login', {
          templateUrl: 'partials/login.html',
          controller: 'loginController',
          access: { restricted: false }
      })
      .when('/logout', {
          controller: 'logoutController',
          access: { restricted: true }
      })
      .when('/register', {
          templateUrl: 'partials/register.html',
          controller: 'registerController',
          access: { restricted: false }
      })
      .otherwise({
          redirectTo: '/'
      });
});

app.run(function ($rootScope, $location, $route, AuthService) {
    $rootScope.$on('$routeChangeStart',
      function (event, next, current) {
          AuthService.getUserStatus()
          .then(function () {
              if (next.access.restricted && !AuthService.isLoggedIn()) {
                  $location.path('/login');
                  $route.reload();
              }
          });
      });
});

