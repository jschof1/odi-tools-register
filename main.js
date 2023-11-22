

document.addEventListener("DOMContentLoaded", function () {
  var table;
  fetch("./tools.json")
    .then((response) => response.json())
    .then((data) => {
      console.log(data);
   table = $("#toolTable").DataTable({
     // Notice we're using the jQuery function here
     data: data,
     columns: [
       { data: "ObjectName" },
       { data: "Publisher" },
       { data: "PublisherURL" },
       { data: "YearPublished" },
       {
         data: "ToolURL",
         render: function (data, type, row) {
           // Return the data wrapped in an anchor tag
           return type === "display" && data
             ? '<span class="tool-url"><a href="' +
                 data +
                 '" target="_blank">Visit webpage</a></span>'
             : "";
         },
       },
       { data: "Type" },
       { data: "Language" },
       { data: "Origin" },
       { data: "PracticeArea" },
       { data: "IndustryFocus" },
       { data: "KeyWords" },
       { data: "ReportIssue" },
     ],
   });

      // Ensure checkboxes are set up after the DataTable is initialized
      var columnCheckboxes = document.querySelectorAll(
        '#columnToggles input[type="checkbox"]'
      );
      columnCheckboxes.forEach(function (checkbox) {
        checkbox.addEventListener("change", function () {
          // Get the column index from the data-column attribute
          var columnIdx = parseInt(this.getAttribute("data-column"), 10);
          // Toggle the visibility of the column
          table.column(columnIdx).visible(!table.column(columnIdx).visible());
        });
      });
    })
    .catch((error) => console.error("Error:", error));
});