var express = require("express");
//var bodyparser = require("body-parser");
var app = express();

app.listen(3000,'13.94.234.60');

app.get("/", function (req, res) {
    res.send("Hello world");
});
app.get("/api/getDocuments", function (req, res) {
    res.send("Api to get documents");
});