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
    var numb = 0;
    function createImageWrapper(src, file) {
        var divWrapper = document.getElementById("previewDocuments");
        var image = new Image();
        image.src = src;
        image.onload = function () {
            var li = document.createElement('li');
            var link = document.createElement('a');
            var removeIcon = document.createElement('span');
           
            removeIcon.className = "glyphicon glyphicon glyphicon-remove remove-preview-icon";
            link.appendChild(removeIcon);
            link.appendChild(image);
            li.appendChild(link);
            li.className = "li" + numb;

            $(removeIcon).click(function (e) {
                //alert(e);
                $(this).closest("li").remove();
                var doclist = angular.element("#upload").scope().removeFromFormData(file);
            });
            numb++;
            $("#" + divWrapper.id).prepend(li);
            //need this code to "reboot" the carousel to update with the new image
            $("#liquid").liquidcarousel({
                height: 140,
                hidearrows: false
            });
        }
    }
    $("#inputUpload").change(function () {
        for (var i = 0; i < this.files.length; i++) {
            if (this.files && this.files[i]) {
                addUploadStatus("upload-hasDocuments");
                var reader = new FileReader();
                var currentFile = this.files[i];

                var prom = new Promise(function (resolve, reject) {
                    var fileData = "";
                    var returnArray = [];
                    var testFile = currentFile;
                    reader.onload = function (e) {
                        returnArray[0] = e.target.result;
                        returnArray[1] = testFile.name;
                        resolve(returnArray);
                    }
                    reader.onerror = function (e) {
                        reject(e);
                    }

                });

                switch (this.files[i]["type"]) {
                    case "image/png":
                    case "image/jpg":
                    case "image/jpeg":
                        if (this.files && this.files[i]) {
                            var currentFile = this.files[i];
                            prom.then(function (response) {
                                //response[0] is the data of the file response[1] is the name of the image
                                createImageWrapper(response[0], response[1]);
                            }, function (error) {
                                console.error("Failed promise", error);
                            })

                           

                            reader.readAsDataURL(this.files[i]);
                        }
                        break;
                    case "application/pdf":
                        var currentFile = this.files[i];

                        prom.then(function (response) {
                            //response[0] is the data of the file response[1] is the name of the document
                            showInCanvas(response[0], response[1]);
                        }, function (error) {
                            console.error("Failed promise", error);
                        })

                        reader.readAsDataURL(this.files[i]);
                        break;
                    default:
                        console.log("sorry we do not support this file format!");
                        break;
                }
                addUploadStatus("upload-hasDocuments");

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

    function showInCanvas(url, file) {
        // See README for overview
        'use strict';
        // Fetch the PDF document from the URL using promises
        var pdfAsArray = convertDataURIToBinary(url);
        PDFJS.getDocument(pdfAsArray).then(function (pdf) {
            // Using promise to fetch the page
            pdf.getPage(1).then(function (page) {
                var scale = 0.5;
                var viewport = page.getViewport(scale);
                // Prepare canvas using PDF page dimensions
                var newCanvas = document.createElement('canvas');
                newCanvas.id = "Canvas" + number;

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
                    createImageWrapper(newCanvas.toDataURL(), file);
                })
            });
        });
    }
});

function showMultiplePDFDocument(url, canvasID, currentDoc, suggestion) {
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
         

          // Render PDF page
          page.render(renderContext).promise.then(function () {
              console.log("logging canvasID");
              console.log(currentDoc);
              console.log(canvasID);
              $("#" + canvasID).parent().data("currentDoc", currentDoc).click(function () {
                  console.log(suggestion);
                  console.log("start on click for dock " + canvasID);
                  var SingleDocumentURL = encodeURIComponent("/api/getDocumentURL/" + $(this).data("currentDoc"));
                  openSinglePDFReader(SingleDocumentURL, suggestion);
                  angular.element("#labelSection").scope().getLabels("/api/getLabels/" + $(this).data("currentDoc"));
                  angular.element("#labelSection").scope().getLabelSuggestions("/api/getLabelSuggestions/" + $(this).data("currentDoc"));
                  angular.element("#docs").scope().getDocumentSuggestions("/api/getDocumentSuggestions/" + $(this).data("currentDoc"));
                  angular.element("body").scope().changeStyle(false, true);
                  angular.element("#docs").scope().destroyDocSuggestions();
                  angular.element("#labels").scope().destroyLabels();
                  //bring doc name to angularscript
                  getDocName(decodeURIComponent($(this).data("currentDoc")));
              });
          });
          //$("#"+currentDoc).parent().on("click", function (e) {
          //    alert("I clicked the dock!");
          //})
         
      });
}


function openListOfDocuments() {
    $("#Canvas-Document-Holder").toggle();
    $("#DocumentIFrame").toggle();
    $("#SuggestedDocumentSection").toggle();
    $("#PDFDocumentWrapper").toggleClass("col-md-10");
    $("#DeleteButton, #HomeButton, hr").toggleClass("hidden");
}
function openSinglePDFReader(url, suggestion) {
    if (!suggestion) {
        $("#Canvas-Document-Holder").toggle();
        //$("#DocumentIFrame")
        $("#PDFDocumentWrapper").toggleClass("col-md-10");

        $("#SuggestedDocumentSection").toggle();

        $("#DeleteButton, #HomeButton, hr").toggleClass("hidden");
        $("#DocumentIFrame").attr('src', "/web/viewer.html?file=" + url).toggle();
    } else {
        $("#DocumentIFrame").attr('src', "/web/viewer.html?file=" + url);
    }

    
}

//AngularScript will us the url var to know which doc is being deleted
function getDocName(url) {
    if (url === undefined) {
        console.log("in url undefined if statement");
        return docName;
    } else {
        docName = url;
    };
}
