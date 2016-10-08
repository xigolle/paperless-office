// URL of PDF document
//needs to be on own server else you get cross server exception
$(function () {
    showThumbnailOfDocuments(5);
    $("#HomeButton").click(function () {
        openListOfDocuments();
    })
    $("#loaddocuments").click(function () {
        showThumbnailOfDocuments(5);
    });
    $("#loaddocument").click(function () {
        openSinglePDFDocument("http://localhost:7152/Files/test0.pdf");
    });
    $("#DocumentIFrame").toggle();
    $("#SuggestedDocumentSection").toggle();
});


function openListOfDocuments() {
    $("canvas").toggle();
    $("#DocumentIFrame").toggle();
    $("#SuggestedDocumentSection").toggle();

}
function openSinglePDFReader(url) {
    $("canvas").toggle();
    $("#DocumentIFrame").toggle();
    $("#SuggestedDocumentSection").toggle();
    $("#DocumentIFrame").attr('src', url);
}
function showThumbnailOfDocuments(amount) {
    for (var i = 0; i < 5; i++) {
        showMultiplePDFDocument("http://localhost:7152/Files/test" + i + ".pdf", "canvas" + i);
    }
}
function showMultiplePDFDocument(url, canvasID) {
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
          var newCanvas = document.createElement('canvas');
          newCanvas.id = canvasID;
          var PDFWrapper = document.getElementById("PDFDocumentWrapper");
          
          PDFWrapper.appendChild(newCanvas);
          // Get canvas#the-canvas
          var canvas = document.getElementById(canvasID);

          // Fetch canvas' 2d context
          var context = canvas.getContext('2d');

          // Set dimensions to Canvas
          canvas.height = viewport.height;
          canvas.width = viewport.width;

          // Prepare object needed by render method
          var renderContext = {
              canvasContext: context,
              viewport: viewport
          };

          //set on click listener
          //$("#" + newCanvas.id).data("foo", 52);
          $("#" + newCanvas.id).data("url",url).click(function () {
             
              console.log("clicked");
              //console.log($(this).data("url"));
              openSinglePDFReader($(this).data("url"));
          });
          //alert($("#" + newCanvas.id).data("foo"));

          // Render PDF page
          page.render(renderContext);
      });
}
