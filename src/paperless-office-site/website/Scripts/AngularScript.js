//Here goes the code to developer with Angular
var app = angular.module("app", []);
var fd = new FormData();
var uploaded = false;

app.controller("uploadController", function ($scope, $http) {

    $scope.upload = function () {
     
        $http.post("/api/uploadDocuments", fd, {
            withCredentials: true,
            headers: { 'Content-Type': undefined },
            transformRequest: angular.identity
        }).then(function successCallback(response) {
            console.log("success");
            
            // this callback will be called asynchronously
            // when the response is available
        }, function errorCallback(response) {
            console.log("failure");

            // called asynchronously if an error occurs
            // or server returns response with an error status.
        });

        fd = new FormData();
        uploaded = false;
            
    }

    $scope.addFile = function (files) {

        if (!uploaded) {
            //Met deze lijn kunnen we de user meegeven
            fd.append("user", "Mathias Samyn");
            uploaded = true;
        }
        angular.forEach(files, function (file) {
            fd.append("file", file);
        });
        
    }

});





