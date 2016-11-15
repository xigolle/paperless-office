// URL of PDF document
//needs to be on own server else you get cross server exception
$(function () {
    //showThumbnailOfDocuments(5);
    $("#HomeButton").click(function () {
        openListOfDocuments();
    })

    $("#loaddocument").click(function () {
        openSinglePDFDocument("http://localhost:7152/Files/test0.pdf");
    });
    $("#DocumentIFrame").toggle();
    $("#SuggestedDocumentSection").toggle();
    $("#PDFDocumentWrapper").toggleClass("col-md-10");


    var number = 0;
    if (!PDFJS.workerSrc && typeof document !== 'undefined') {
        // workerSrc is not set -- using last script url to define default location

        PDFJS.workerSrc = (function () {
            'use strict';
            var scriptTagContainer = document.body ||
                                     document.getElementsByTagName('head')[0];
            var pdfjsSrc = scriptTagContainer.lastChild.src;
            return pdfjsSrc && pdfjsSrc.replace(/\.js$/i, '.worker.js');
        })();

        PDFJS.workerSrc = 'pdfjs-dist-master/build/pdf.worker.js';
    }

    $("#inputUpload").change(function () {
        console.log("We are changing stuff!");
        console.log(this.files);
        for (var i = 0; i < this.files.length; i++) {
            if (this.files && this.files[i]) {

                var thisCanvas = showImageInCanvas(i);
                console.log(thisCanvas.id);
                switch (this.files[i]["type"]) {
                    case "image/png":
                        console.log("We got an image");
                        if (this.files && this.files[i]) {


                            var reader = new FileReader();

                            reader.onload = function (e) {
                                //console.log("We aren't doing anything!?");
                                var img = new Image();
                                img.src = e.target.result;
                                img.onload = function () {
                                    var ctx = canvas.getContext("2d");
                                    ctx.drawImage(img, 0, 0);
                                }
                                //$('#thisCanvas.id').css('background-image', e.target.result);
                            }

                            reader.readAsDataURL(this.files[i]);
                        }
                        break;
                    case "application/pdf":
                        var reader = new FileReader();
                        reader.onload = function (e) {
                            console.log("Should show in a canvas!");
                            showInCanvas(e.target.result);
                        }
                        reader.readAsDataURL(this.files[0]);
                        break;
                    default:
                        console.log("sorry we do not support this file format!");
                        break;
                }

            }
        }

    });

    function convertDataURIToBinary(dataURI) {
        var BASE64_MARKER = ';base64,';
        var base64Index = dataURI.indexOf(BASE64_MARKER) + BASE64_MARKER.length;
        var base64 = dataURI.substring(base64Index);
        var raw = window.atob(base64);
        var rawLength = raw.length;
        var array = new Uint8Array(new ArrayBuffer(rawLength));

        for (i = 0; i < rawLength; i++) {
            array[i] = raw.charCodeAt(i);
        }
        return array;
    }
    function showImageInCanvas(id) {
        var newCanvas = document.createElement('canvas');
        newCanvas.id = "Canvas" + id;

        var divWrapper = document.getElementById("previewDocuments");
        console.log("Should have done something??");
        divWrapper.appendChild(newCanvas);
        canvas = document.getElementById("Canvas" + id);
        canvas.height = 306;
        canvas.width = 396;
        return canvas;

    }
    function showInCanvas(url) {
        // See README for overview
        'use strict';
        // Fetch the PDF document from the URL using promises
        var pdfAsArray = convertDataURIToBinary(url);
        console.log("show in canvas function");
        PDFJS.getDocument(pdfAsArray).then(function (pdf) {
            // Using promise to fetch the page
            pdf.getPage(1).then(function (page) {
                var scale = 0.5;
                var viewport = page.getViewport(scale);
                // Prepare canvas using PDF page dimensions
                var canvas = document.getElementById('the-canvas');
                var newCanvas = document.createElement('canvas');
                newCanvas.id = "Canvas" + number;

                var divWrapper = document.getElementById("previewDocuments");
                console.log("Should have done something??");
                divWrapper.appendChild(newCanvas);
                canvas = document.getElementById("Canvas" + number);
                number++;
                var context = canvas.getContext('2d');
                canvas.height = 306;
                canvas.width = 396;
                // Render PDF page into canvas context
                var renderContext = {
                    canvasContext: context,
                    viewport: viewport
                };
                page.render(renderContext);
            });
        });
    }
});
function showMultiplePDFDocument(url, canvasID, currentDoc) {
    var url = url;
    // Asynchronous download PDF
    PDFJS.getDocument(url)
      .then(function (pdf) {
          return pdf.getPage(1);
      })
      .then(function (page) {
          // Set scale (zoom) level
          var scale = 0.5;

          // Get viewport (dimensions)
          var viewport = page.getViewport(scale);
          var canvas = document.getElementById(canvasID);

          // Fetch canvas' 2d context
          var context = canvas.getContext('2d');

          // Set dimensions to Canvas
          canvas.height = viewport.height;
          canvas.width = viewport.width;
          canvas.width = 306;
          canvas.height = 396;

          // Prepare object needed by render method
          var renderContext = {
              canvasContext: context,
              viewport: viewport
          };

          //set on click listener
          //$("#" + newCanvas.id).data("foo", 52);
          $("#" + canvasID).parent().data("currentDoc", currentDoc).click(function () {

              var SingleDocumentURL = encodeURIComponent("http://paperless-office.westeurope.cloudapp.azure.com/api/getDocumentURL/" + $(this).data("currentDoc"));
              openSinglePDFReader(SingleDocumentURL);
          });

          // Render PDF page
          page.render(renderContext);
      });
}

function openSinglePDFDocument(url) {
    var url = url;
    // Asynchronous download PDF
    PDFJS.getDocument(url)
      .then(function (pdf) {
          console.log("first then");
          return pdf.getPage(1);
      })
      .then(function (page) {
          console.log("second then");
          // Set scale (zoom) level
          var scale = 0.5;

          // Get viewport (dimensions)
          var viewport = page.getViewport(scale);
          // Create the document canvas
          var newCanvas = document.createElement('canvas');
          newCanvas.id = canvasID;
          var newDiv = document.createElement('div');
          newDiv.className = "overlay-document";
          var PDFWrapper = document.getElementById("Canvas-Document-Holder");


          PDFWrapper.appendChild(newCanvas);

          console.log("test");
          // Get canvas#the-canvas
          var canvas = document.getElementById(canvasID);

          // Fetch canvas' 2d context
          var context = canvas.getContext('2d');

          // Set dimensions to Canvas
          //viewport.height = 396;
          //viewport.width = 306;
          //canvas.height = viewport.height;
          //canvas.width = viewport.width;
          canvas.width = 306;
          canvas.height = 396;

          // Prepare object needed by render method
          var renderContext = {
              canvasContext: context,
              viewport: viewport
          };

          // Render PDF page
          page.render(renderContext);
      });
}
function openListOfDocuments() {
    $("#Canvas-Document-Holder").toggle();
    $("#DocumentIFrame").toggle();
    $("#SuggestedDocumentSection").toggle();
    $("#PDFDocumentWrapper").toggleClass("col-md-10");

}
function openSinglePDFReader(url) {
    $("#Canvas-Document-Holder").toggle();
    //$("#DocumentIFrame")
    $("#PDFDocumentWrapper").toggleClass("col-md-10");

    $("#SuggestedDocumentSection").toggle();
    $("#DocumentIFrame").attr('src', "/web/viewer.html?file=" + url).toggle();

}


