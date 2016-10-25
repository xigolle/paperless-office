$(function () {
    $("#upload").click(function (e) {
        e.preventDefault();
        $("#upload").toggleClass("uploadToggled");
        
    });
    $("#fileInput").click(function (e) {
        e.stopPropagation();
    });
    $("#submit").click(function (e) {
        e.stopPropagation();
    });
    $("#submit span").click(function (e) {
        e.stopPropagation();
    });
    $("#upload input").click(function (e) {
        e.stopPropagation();
    });
    $("#docLabels").click(function (e) {
        e.stopPropagation();
    });
})