//Here goes the code to developer with Angular
var app = angular.module("app", []);

app.controller("testCTRL", function ($scope) {
    console.log("testing");
    $scope.name = "joey";
});