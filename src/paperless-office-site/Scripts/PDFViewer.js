// URL of PDF document
//needs to be on own server else you get cross server exception
$(function () {
    //showThumbnailOfDocuments(5);
    $("#HomeButton").click(function () {
        openListOfDocuments();
    })
    //$("#loaddocuments").click(function () {
    //    showThumbnailOfDocuments(5);
    //});
    $("#loaddocument").click(function () {
        openSinglePDFDocument("http://localhost:7152/Files/test0.pdf");
    });
    $("#DocumentIFrame").toggle();
    $("#SuggestedDocumentSection").toggle();
    $("#PDFDocumentWrapper").toggleClass("col-md-10");
});


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
    console.log(url);
    $("#DocumentIFrame").attr('src', "/web/viewer.html?file=../" + url).toggle();;
}


