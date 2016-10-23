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
          // Create the document canvas
          var newDocumentHolder = document.createElement('div');
          //newDocumentHolder.className = "Canvas-Document";
          var documentCanvas = document.createElement('canvas');
          var documentIdentifier = document.createElement('span');
         
          var documentIdentifierText = document.createTextNode(decodeURI(currentDoc));
          documentIdentifier.className = "document-identifier";
          documentIdentifier.appendChild(documentIdentifierText);

          newDocumentHolder.className = "Canvas-Document ";

          documentCanvas.width = 306;
          documentCanvas.height = 396;
          documentCanvas.id = canvasID;
          var PDFWrapper = document.getElementById("PDFDocumentWrapper");
          //PDFWrapper.appendChild(newDocumentHolder);
          //newDocumentHolder.appendChild(newCanvas);
          newDocumentHolder.appendChild(documentIdentifier);
          newDocumentHolder.appendChild(documentCanvas);
          PDFWrapper.appendChild(newDocumentHolder);
          // Get canvas#the-canvas
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
          $("#" + documentCanvas.id).parent().data("currentDoc", currentDoc).click(function () {

              //openSinglePDFReader($(this).data("url"));
              //encode the url to a format the pdf reader can use to get the document
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
          var PDFWrapper = document.getElementById("PDFDocumentWrapper");
          
          
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
    $("canvas").toggle();
    $("#DocumentIFrame").toggle();
    $("#SuggestedDocumentSection").toggle();
    $("#PDFDocumentWrapper").toggleClass("col-md-10");
    
}
function openSinglePDFReader(url) {
    $("canvas").toggle();
    //$("#DocumentIFrame")
    $("#PDFDocumentWrapper").toggleClass("col-md-10");
    $("#SuggestedDocumentSection").toggle();
    $("#DocumentIFrame").attr('src', "/web/viewer.html?file="+url).toggle();
    
}


