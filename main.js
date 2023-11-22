

document.addEventListener("DOMContentLoaded", function () {
  // Fetch the JSON data and initialize DataTables
  fetch("./tools.json")
    .then((response) => response.json())
    .then((data) => {
        console.log(data);
      new DataTable(document.getElementById("toolTable"), {
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
                ? '<span class="tool-url"><a href="' + data + '" target="_blank">Visit webpage</a></span>'
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
    });
    
});
