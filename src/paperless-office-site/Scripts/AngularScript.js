//Here goes the code to developer with Angular
var app = angular.module("app", []);

app.service('DocumentService', function ($http) {

    this.items = [];
    this.DocumentNames = [];
    this.getDocument = function () {
        console.log("get document function started");
        $http({
            method: 'GET',
            url: "http://paperless-office.westeurope.cloudapp.azure.com/api/getDocument",
            headers: {
                "test": "Bedrijven.pdf"
            }

        }).then(function successCallback(response) {
            console.log("success log");
            console.log(response);
        }, function errorCallback(response) {
            console.log("error log");
            console.log(response);
        });
    }
    this.getAmountDocuments = function () {
        console.log("Get amount of documents and name");
        return $http.get("http://localhost:3000/api/getDocuments");
       //return $http({
       //     method: 'GET',
       //     url: "http://localhost:3000/api/getDocuments"
       // }).then(function succes(response) {
       //     console.log("successfell got array of documents");
       //     //console.log(response);
       //     return response;
       //     DocumentNames = response.data;
       //     //return DocumentNames;
       //     //console.log(DocumentNames);
            
       // }, function error(response) {
       //     console.log("error getting array of documents")
       //     console.log(response);
       // });
    }
})



app.controller("testCTRL", function ($scope, DocumentService) {
   
    
    //var DocumentArray = DocumentService.getAmountDocuments();
    //console.log(DocumentArray);
    //start function to show thumbnails of documents
    showThumbnailOfDocuments();
    //console.log(DocumentService.DocumentNames[0]);
    $scope.testfunction = function () {
        alert("this is a test function!");
        //DocumentService.getDocument();
        //alert(getDocuments.items);
    };
    //function getAvailableDocuments() {
    //    DocumentService.getAmountDocuments();
    //}
    function showThumbnailOfDocuments() {
        var promise = DocumentService.getAmountDocuments();
        promise.then(function (payload) {
            ////after the list of documents is collected start getting documents
            //console.log("Logged promise");
            //console.log(payload.data);
            //showThumbnailOfDocuments(payload.data)
            for (var i = 0; i < payload.data.length; i++) {
                var URLReadyDocument = encodeURI(payload.data[i]);
                //showMultiplePDFDocument("Files/test" + i + ".pdf", "canvas" + i);
                console.log(URLReadyDocument);
                showMultiplePDFDocument("http://localhost:3000/api/getDocumentURL/" + URLReadyDocument, "canvas" + i);
            }
        });
        //for (var i = 0; i < 5; i++) {
        //    showMultiplePDFDocument("Files/test" + i + ".pdf", "canvas" + i);
        //}
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
              var newDocumentHolder = document.createElement('div');
              //newDocumentHolder.className = "Canvas-Document";
              var newCanvas = document.createElement('canvas');
              newCanvas.className = "Canvas-Document ";

              newCanvas.width = 306;
              newCanvas.height = 396;
              newCanvas.id = canvasID;
              var PDFWrapper = document.getElementById("PDFDocumentWrapper");
              //PDFWrapper.appendChild(newDocumentHolder);
              //newDocumentHolder.appendChild(newCanvas);
              PDFWrapper.appendChild(newCanvas);
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
              $("#" + newCanvas.id).data("url", url).click(function () {

                  console.log("clicked");
                  //console.log($(this).data("url"));
                  //openSinglePDFReader($(this).data("url"));
                  
                  openSinglePDFReader("http://localhost:3000/api/getDocumentURL/");
              });
              //alert($("#" + newCanvas.id).data("foo"));

              // Render PDF page
              page.render(renderContext);
          });
    }
    DocumentService.test;
    console.log(DocumentService.items);
    console.log("testing");
    $scope.name = "joey";
});


