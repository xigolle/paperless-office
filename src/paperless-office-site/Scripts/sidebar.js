$(function () {
    $("#menu-toggle").click(function (e) {
        e.preventDefault();
        $("#wrapper").toggleClass("toggled");
        $("#upload").toggleClass("toggled");
    });
})
$("#btnDeleteAccount").click(function (e) {
    $("#modalDeleteUserAccount").modal('hide');
    angular.element("#btnDeleteAccount").scope().deleteUser();
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
