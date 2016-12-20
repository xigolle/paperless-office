$(function () {
    $("#menu-toggle").click(function (e) {
        e.preventDefault();
        $("#wrapper").toggleClass("toggled");
        $("#upload").toggleClass("toggled");
    });
})

//$(document).ready(function () {
//    setTimeout(function () {
//        $("#menu-toggle").click(function (e) {
//            e.preventDefault();
//            $("#wrapper").toggleClass("toggled");
//            $("#upload").toggleClass("toggled");
//        });
//    });
//});
