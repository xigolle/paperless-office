$(function () {
    $("#upload").click(function (e) {
        e.preventDefault();
        $("#upload").toggleClass("uploadToggled");
        $("#upload-zone-wrapper").toggleClass("collapse");
    });
})