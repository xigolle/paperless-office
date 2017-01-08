
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

app.directive('disallowSpaces', function () {
    return {
        restrict: 'A',

        link: function ($scope, $element) {
            $element.bind('input', function () {
                $(this).val($(this).val().replace(/ /g, ''));
            });
        }
    };
});

app.controller("styleController", function ($scope) {
    
    $scope.changeStyle = function (login, readDoc) {
        if (login) {
            $scope.divStyle = { "background": "white", "height": "0" };
            $scope.bodyStyle = { "background": "white", "overflow-y": "auto" };
        } else if (readDoc) {
            $scope.bodyStyle = { "overflow": "hidden" };
        } else {
            console.log("in login style");
            $scope.divStyle = { "background": "darkgrey", "height": "100%" };
            $scope.bodyStyle = { "background": "black" };
        }
    };
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

                    var documentIdentifierText = document.createTextNode(decodeURI(documentNames.data[i].name).slice(13));
                    documentIdentifier.className = "document-identifier";
                    documentIdentifier.appendChild(documentIdentifierText);

                    newDocumentHolder.className = "Canvas-Document ";
                    newDocumentHolder.setAttribute("id", decodeURI(documentNames.data[i].name));
                    documentCanvas.width = 306;
                    documentCanvas.height = 396;
                    documentCanvas.id = "canvass" + i;
                    var PDFWrapper = document.getElementById("Canvas-Document-Holder");

                    newDocumentHolder.appendChild(documentIdentifier);
                    newDocumentHolder.appendChild(documentCanvas);
                    PDFWrapper.appendChild(newDocumentHolder);
                    var URLReadyDocument = encodeURI(documentNames.data[i].name);


                    showMultiplePDFDocument("/api/getDocumentURL/" + URLReadyDocument, "canvass" + i, URLReadyDocument, false);
                    //cfpLoadingBar.start();

                }
            }
        });

    }
});

app.controller("deleteUserCtrl", function ($scope, $http, $route) {
    $scope.deleteUser = function () {
        console.log("delete User function called!");
        $http({
            method: 'DELETE',
            url: "/api/deleteUser",
            ignoreLoadingBar: true
            //headers: {
            //    "test": "Bedrijven.pdf"
            //}

        }).then(function successCallback(response) {
            if (response.data == "succes") {
                $route.reload();
            }
            console.dir(response);
        }, function errorCallback(response) {
            console.dir("error" + response);
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
        
        dropContainer.ondragover = dropContainer.ondragenter = function(evt) {
  evt.preventDefault();
};

dropContainer.ondrop = function(evt) {
  // pretty simple -- but not for IE :(
  fileInput.files = evt.dataTransfer.files;
  evt.preventDefault();
};

        console.log("calling upload function");
        addUploadStatus("upload-progress");
        if (firstDocAdded) {
            $scope.collapseDetails = "";
            $scope.collapseZone = "collapse";
            if ($scope.docName.split(' ').join('') != "") {
                docNameAdded = true;
                var timeStamp = new Date().getTime();
                fd.append("docName", timeStamp + $scope.docName);
                fd.append("docLabels", $scope.docLabels);
                $scope.docName = "";
            }
            if (docNameAdded) {
                console.log("logging fd");
                console.dir(fd.getAll("file"));
                $http.post("/api/uploadDocuments", fd, {
                    //withCredentials: true,
                    headers: { 'Content-Type': undefined },
                    transformRequest: angular.identity
                }).then(function successCallback(response) {
                    console.log("Document upload was a success.");

                    addUploadStatus("upload-succes");
                }, function errorCallback(response) {
                    console.log("Document upload failed.");
                    addUploadStatus("upload-error");

                });

                $scope.collapseDetails = "collapse";
                $scope.collapseZone = "";
                fd = new FormData();
                firstDocAdded = false;
                docNameAdded = false;
            }

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

        console.log(getDocName());

        $http.post("/api/delete", { "docName": getDocName() }, { ignoreLoadingBar: true }).then(function successCallback(response) {
            console.log("Document was successfully deleted.");
        }, function errorCallback(response) {
            console.log("Document could not be deleted.");
        });

        $route.reload();
    }
});

app.controller('labelController', function ($scope, $http) {

    var createLabels = function (labels) {
        angular.forEach(labels, function (label) {
            var labelSpan = document.createElement('span');
            var labelDeleteSpan = document.createElement('span');
            labelDeleteSpan.setAttribute("class", "glyphicon glyphicon-remove");
            $(labelSpan).click(function (e) {
                if (e.target !== e.currentTarget) return;
                angular.element("#search-bar").scope().searchInput = $(this).text();
                angular.element(".glyphicon-search").click();
                openListOfDocuments();               
            });
            $(labelDeleteSpan).click(function (e) {
                deleteLabel($(this).parent().text(), $(this).parent());
            });
            var text = document.createTextNode(label)
            labelSpan.appendChild(labelDeleteSpan);
            labelSpan.appendChild(text);
            document.getElementById("labelSection").appendChild(labelSpan);
        });
    };

    $scope.getLabels = function (docURL) {
        $http.get(docURL).then(function successCallback(response) {
            console.log(response.data);
            if (response.data.length != 0) {
                $scope.labelText = "";
                createLabels(response.data);
            } else {
                $scope.labelText = "No labels";
            }
        }, function errorCallback(response) {
            console.log(response.data);
        });

    }

    $("#labels input").autocomplete({
        minLength: 0,
        select: function (event, ui) { $scope.newLabel = ui.item.value; }
    }).focus(function () {
        $(this).autocomplete("search");
    });

    $scope.getLabelSuggestions = function (docURL) {
        $http.get(docURL).then(function successCallback(response) {
            console.log(response.data);
            $("#labels input").autocomplete("option", "source", response.data);
        }, function errorCallback(response) {
            console.log(response.data);
        });
    }

    $scope.destroyLabels = function () {
        //$scope.labelSectionStyle = ""; werkt niet :s wrm?     
        //angular.element("#labelSection").empty(); verwijderd ook de tekstbinding, daarom doen we via jquery.
        $("#labelSection").children("span").remove();
    }

    $scope.labelSectionStyle = "";
    $scope.buttonText = "View more";

    $scope.showLabels = function () {
        if ($scope.labelSectionStyle === "") {
            $scope.buttonText = "View less";
            $scope.labelSectionStyle = { "overflow-y": "auto", "max-height": "280px" };
        } else {
            $scope.buttonText = "View more";
            angular.element("#labelSection").scrollTop(0);
            $scope.labelSectionStyle = "";
        }
    }

    $scope.newLabel = "";

    $scope.addLabel = function () {
        if ($scope.newLabel != "") {
            $http.post("/api/addLabels", { "newLabel": $scope.newLabel, "docName": getDocName() }, { ignoreLoadingBar: true }).then(function successCallback(response) {
                console.log("add was a success");
                $scope.newLabel = "";
                $scope.labelText = "";
                createLabels(response.data);
            }, function errorCallback(response) {
                console.log(response.data);
            });
        }
    }

    var deleteLabel = function (labelText, label) {
        $http.post("/api/deleteLabel", { "deleteLabel": labelText, "docName": getDocName() }, { ignoreLoadingBar: true }).then(function successCallback(response) {
            label.remove();
        }, function errorCallback(response) {
            console.log(response.data);
        });
    }
});

app.controller('searchController', function ($scope, $http) {
    $scope.searchInput = "";
    $scope.search = function () {
        console.log("in search: " + $scope.searchInput);
        if ($scope.searchInput.trim() != "") {
            $http.get("/api/search/" + encodeURIComponent($scope.searchInput.toLowerCase()), { ignoreLoadingBar: true }).then(function successCallback(response) {
                console.log(response.data);
                hideFiles(response.data);
            }, function errorCallback(response) {
                console.log(response.data);
            });
        } else {
            $("#Canvas-Document-Holder > div").each(function () {
                $(this).removeClass("hidden");
            });
        }
    };

    var hideFiles = function (docs) {
        $("#Canvas-Document-Holder > div").each(function () {
            $(this).addClass("hidden");
        });
        for (var i = 0; i < docs.length; i++) {
            $("#Canvas-Document-Holder > div").each(function () {
                if (docs[i].name === $(this).attr("id")) {
                    $(this).removeClass("hidden");
                };
            });
        };
    };
});

app.controller('docsSuggestionController', function ($scope, $http, $window) {
    $scope.getDocumentSuggestions = function (docURL) {
        console.log("in suggestions");
        $http.get(docURL).then(function successCallback(response) {
            console.log(response.data);
            setDocuments(response.data);
        }, function errorCallback(response) {
            console.log(response.data);
        });
    };

    var setDocuments = function (data) {
        for (var i = 0; i < data.length; i++) {


            var newDocumentHolder = document.createElement('div');

            var documentCanvas = document.createElement('canvas');
            var documentIdentifier = document.createElement('span');

            var documentIdentifierText = document.createTextNode(data[i].slice(13));
            documentIdentifier.className = "document-identifier";
            documentIdentifier.appendChild(documentIdentifierText);

            newDocumentHolder.className = "Canvas-Document ";
            newDocumentHolder.setAttribute("id", decodeURI(data[i]));
            //documentCanvas.width = 100;
            //documentCanvas.height = 100;
            documentCanvas.id = "suggestionCanvas" + i;         
            var PDFWrapper = document.getElementById("docs");

            newDocumentHolder.appendChild(documentIdentifier);
            newDocumentHolder.appendChild(documentCanvas);
            PDFWrapper.appendChild(newDocumentHolder);
            var URLReadyDocument = encodeURI(data[i]);


            showMultiplePDFDocument("/api/getDocumentURL/" + URLReadyDocument, "suggestionCanvas" + i, URLReadyDocument, true);
            //cfpLoadingBar.start();

        }
    }

    $scope.destroyDocSuggestions = function () {
        console.log("destroy docsuggestions");
        $("#docs").children("div").remove();
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

