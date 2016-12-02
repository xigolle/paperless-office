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
    $("#liquid").liquidcarousel({
        height: 140,
        hidearrows: false
    });



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
    function createImageWrapper(src) {
        var divWrapper = document.getElementById("previewDocuments");
        console.log("Should have done something??");
        var image = new Image();
        image.src = src;
        image.onload = function () {
            var li = document.createElement('li');
            var link = document.createElement('a');
            link.appendChild(image);
            li.appendChild(link);
            $("#" + divWrapper.id).prepend(li);
            //need this code to "reboot" the carousel to update with the new image
            $("#liquid").liquidcarousel({
                height: 140,
                hidearrows: false
            });
        }
    }
    $("#inputUpload").change(function () {
        console.log("We are changing stuff!");
        console.log(this.files);
        for (var i = 0; i < this.files.length; i++) {
            if (this.files && this.files[i]) {
                console.log("logging type");
                console.log(this.files[i]["type"]);
                //var thisCanvas = showImageInCanvas(i);
                //console.log(thisCanvas.id);
                switch (this.files[i]["type"]) {
                    case "image/png":
                    case "image/jpg":
                    case "image/jpeg":
                        if (this.files && this.files[i]) {
                            var reader = new FileReader();
                            reader.onload = function (e) {
                                createImageWrapper(e.target.result);
                                
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
                        reader.readAsDataURL(this.files[i]);
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

    function showInCanvas(url) {
        // See README for overview
        'use strict';
        // Fetch the PDF document from the URL using promises
        var pdfAsArray = convertDataURIToBinary(url);
        console.log("trollings");
        PDFJS.getDocument(pdfAsArray).then(function (pdf) {
            // Using promise to fetch the page
            pdf.getPage(1).then(function (page) {
                var scale = 0.5;
                var viewport = page.getViewport(scale);
                // Prepare canvas using PDF page dimensions
                //var canvas = document.getElementById('the-canvas');
                var newCanvas = document.createElement('canvas');
                newCanvas.id = "Canvas" + number;

                //var divWrapper = document.getElementById("previewDocuments");
                //console.log("Should have done something??");
                //divWrapper.appendChild(newCanvas);
                //canvas = document.getElementById("Canvas" + number);
                number++;
                var context = newCanvas.getContext('2d');
                newCanvas.height = 306;
                newCanvas.width = 396;
                // Render PDF page into canvas context
                var renderContext = {
                    canvasContext: context,
                    viewport: viewport
                };
                var task = page.render(renderContext);
                task.promise.then(function () {
                    
                    createImageWrapper(newCanvas.toDataURL());

                    

                })
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


