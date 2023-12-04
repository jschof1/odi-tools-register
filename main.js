var table; // Declare the table variable outside the $(document).ready function
var originalData = []; // Variable to store the original data

// Custom function to filter data
function filterData() {
  var resourceType = $("#filterResource").val();
  var practiceArea = $("#filterPracticeArea").val();
  var countryOrigin = $("#filterOrigin").val();

  // Filter original data based on dropdown values
  var filteredData = originalData.filter(function (item) {
    return (
      (resourceType === "" || item.Resource === resourceType) &&
      (practiceArea === "" || item.PracticeArea === practiceArea) &&
      (countryOrigin === "" || item.Origin === countryOrigin)
    );
  });

  // Update the DataTable with filtered data
  table.clear().rows.add(filteredData).draw();
}

function populateDropdown(selector, data, property) {
  var unique = new Set(data.map((item) => item[property]));
  unique.forEach((value) => {
    $(selector).append(`<option value="${value}">${value}</option>`);
  });
}

$(document).ready(function () {
  fetch("tools.json")
    .then((response) => {
      if (!response.ok) throw new Error("Network response was not ok");
      return response.json();
    })
    .then((data) => {
      originalData = data; // Store the original data
      populateDropdown("#filterResource", data, "Resource");
      populateDropdown("#filterPracticeArea", data, "PracticeArea");
      populateDropdown("#filterOrigin", data, "Origin");

      // Initialize the DataTable with the fetched data
      table = $("#toolTable").DataTable({
        dom:
          "<'row'<'col-sm-12 col-md-6'l><'col-sm-12 col-md-6'<'float-md-right ml-2'B>f>>" +
          "<'row'<'col-sm-12'tr>>" +
          "<'row'<'col-sm-12 col-md-5'i><'col-sm-12 col-md-7'p>>",
        data: data,
        buttons: [
          "csv",
          {
            text: '<i class="fa fa-id-badge fa-fw" aria-hidden="true"></i>',
            action: function (e, dt, node) {
              $(dt.table().node()).toggleClass("cards");
              $(".fa", node).toggleClass(["fa-table", "fa-id-badge"]);

              dt.draw("page");
            },
            className: "btn-sm",
            attr: {
              title: "Change views",
            },
          },
        ],
        select: "single",
        columns: [
          { data: "Resource", title: "Resource" },
          { data: "Publisher", title: "Publisher" },
          { data: "YearPublished", title: "Year Published" },
          {
            data: "ToolURL",
            title: "Tool URL",
            render: function (data, type, row) {
              return type === "display"
                ? '<a href="' + data + '">Visit tool page</a>'
                : data;
            },
          },
          { data: "PracticeArea", title: "Practice Area" },
          { data: "Tags", title: "Tags" },
          { data: "ReportIssue", title: "Report Issue" },
        ],
        drawCallback: function (settings) {
          var api = this.api();
          var $table = $(api.table().node());

          if ($table.hasClass("cards")) {
            // Create an array of labels containing all table headers
            var labels = [];
            $("thead th", $table).each(function () {
              labels.push($(this).text());
            });

            // Add data-label attribute to each cell
            $("tbody tr", $table).each(function () {
              $(this)
                .find("td")
                .each(function (column) {
                  $(this).attr("data-label", labels[column]);
                });
            });

            var max = 0;
            $("tbody tr", $table)
              .each(function () {
                max = Math.max($(this).height(), max);
              })
              .height(max);
          } else {
            // Remove data-label attribute from each cell
            $("tbody td", $table).each(function () {
              $(this).removeAttr("data-label");
            });

            $("tbody tr", $table).each(function () {
              $(this).height("auto");
            });
          }
        },
      });

      // Event bindings for select and deselect
      table.on("click", "tr", function () {
        var data = table.row(this).data();
        var dialogContent = `
          Resource: ${data.Resource}<br>
          Publisher: ${data.Publisher}<br>
          Country of Origin: ${data.Origin}<br>
          Practice Area: ${data.PracticeArea}<br>
          Year: ${data.YearPublished}<br>
          URL: <a href="${data.ToolURL}">${data.ToolURL}</a><br>
          Tags: ${data.Tags}<br>
      `;
        $("#cardDetailsContent").html(dialogContent);
        $("#cardDetailsDialog")[0].showModal();
      });

      $("#closeDialog")
        .on("click", function () {
          $("#cardDetailsDialog")[0].close();
        })
        .on("select", function (e, dt, type, indexes) {
          var rowData = table.rows(indexes).data().toArray();
          $("#row-data").html(JSON.stringify(rowData));
        })
        .on("deselect", function () {
          $("#row-data").empty();
        });
      // Dropdown filter event listeners
      $("#filterResource, #filterPracticeArea, #filterOrigin").on(
        "change",
        filterData
      );
    })

    .catch((error) => {
      console.error("Error fetching data: ", error);
      // Handle errors in fetching data here, such as displaying a message to the user
    });
});

$("#closeDialog").on("click", function () {
  $("#cardDetailsDialog")[0].close();
});
