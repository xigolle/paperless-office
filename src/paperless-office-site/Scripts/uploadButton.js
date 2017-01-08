$(function () {
    $("#upload").click(function (e) {
        e.preventDefault();
        $("#upload").toggleClass("uploadToggled");
        
    });
    $("#upload").children().not("p").click(function (e) {
        e.stopPropagation();
    })
    $("#submit").click(function (e) {
        if ($("#submit span").hasClass("upload-succes")) {

            $("#upload").removeClass("uploadToggled");
        }
    })
})

//$(document).ready(function () {
//    setTimeout(function () {
//        $("#upload").click(function (e) {
//            e.preventDefault();
//            $("#upload").toggleClass("uploadToggled");

//        });
//        $("#upload").children().not("p").click(function (e) {
//            e.stopPropagation();
//        })
//    }, 10);
//});

//$(function () {
//    $(document).on("click", "#upload", function (e) {
//        e.preventDefault();
//        $("#upload").toggleClass("uploadToggled");

//    });
//    $("#upload").children().not("p").on("click", function (e) {
//        e.stopPropagation();
//    })

//})