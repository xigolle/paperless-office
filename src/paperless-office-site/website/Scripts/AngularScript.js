
var app = angular.module("app", []);
var fd = new FormData();
var userAdded = false;


app.controller("uploadController", function ($scope, $http) {

    

    $scope.upload = function () {
       
        if (userAdded) {
             $http.post("/api/uploadDocuments", fd, {
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





