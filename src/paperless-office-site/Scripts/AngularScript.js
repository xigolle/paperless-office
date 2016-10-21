//Here goes the code to developer with Angular
var app = angular.module("app", []);

app.service('getDocuments', function ($http) {

    this.items = [];
    $http({
        method: 'GET',
        url: "bla bla"
    }).then(function success(response) {
        console.log("success log");
        console.log(response);
    }, function error(resonse) {
        console.log("error log");
        console.log(response);
    });
})



app.controller("testCTRL", function ($scope, getDocuments) {

    $scope.testfunction = function () {
        alert("this is a test function!");
        alert(getDocuments.items);
    };
    getDocuments.test;
    console.log(getDocuments.items);
    console.log("testing");
    $scope.name = "joey";
});


