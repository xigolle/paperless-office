
var app = angular.module("app", ["ngRoute"]);

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
    var userAdded = false; //TODO: rename var to resemble tha fact that at least 1 file has been added
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
                console.log(fd);
            }
            if (docNameAdded) {
                $http.post("/api/uploadDocuments", fd, {
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

    $scope.addFile = function (files) {
        $scope.myStyle = { "border-color": "gray" };
        console.log($scope.myStyle);
        if (!userAdded) {
            //Met deze lijn kunnen we de user meegeven
            //fd.append("user", "mathiassamyn@hotmail.com");
            userAdded = true;
        }
        angular.forEach(files, function (file) {
            console.log("logging result of angularScript");
            console.log(file);
            fd.append("file", file);
        });

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

