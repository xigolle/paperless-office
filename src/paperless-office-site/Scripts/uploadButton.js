$(function () {
    $("#upload").click(function (e) {
        e.preventDefault();
        $("#upload").toggleClass("uploadToggled");
        
    });
    $("#upload").children().not("p").click(function (e) {
        e.stopPropagation();
    })

})