function filterData() {
  var Type = $("#filterType").val();
  var practiceArea = $("#filterPracticeArea").val();
  var countryOrigin = $("#filterOrigin").val();

  var filteredData = originalData.filter(function (item) {
    return (
      (Type === "" || item.Type === Type) &&
      (practiceArea === "" || item["Practice Area"] === practiceArea) &&
      (countryOrigin === "" || item.Origin === countryOrigin)
    );
  });

  table.clear().rows.add(filteredData).draw();
}
function populateDropdown(selector, data, property) {
  var unique = new Set(data.map((item) => item[property]));
  unique.forEach((value) => {
    if (value && value.trim() !== "") {
      // Check if the value is not empty
      $(selector).append(`<option value="${value}">${value}</option>`);
    }
  });
}
function csvToJson(csv) {
  const lines = csv.split("\n");
  const result = [];
  const headers = lines[0].match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g);

  lines.slice(1).forEach((line) => {
    const data = line.match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g);
    if (data) {
      const obj = {};
      headers.forEach((header, i) => {
        obj[header.trim().replace(/^"|"$/g, "")] = data[i]
          ? data[i].trim().replace(/^"|"$/g, "")
          : "";
      });
      result.push(obj);
    }
  });

  return result;
}

$(document).ready(function () {
  fetch(
    "https://docs.google.com/spreadsheets/d/e/2PACX-1vTzbq_MeHU3eC-CKnr6D0pfkugIV_o_mEj8wpQqNmt3qg-oCceOJNWNh789ymsMF_h0Ib7ZEv6J8w5D/pub?gid=1252094585&single=true&output=csv"
  )
    .then((response) => response.text())
    .then((csvData) => {
      Papa.parse(csvData, {
        header: true,
        complete: function (results) {
          const data = results.data;
          originalData = data; // Store the original data

          populateDropdown("#filterType", data, "Type");
          populateDropdown("#filterPracticeArea", data, "Practice Area");
          populateDropdown("#filterOrigin", data, "Origin");

          table = $("#toolTable").DataTable({
            responsive: true,
            dom:
              "<'row'<'col-sm-4'l><'col-sm-4'B><'col-sm-4'f>>" +
              "<'row'<'col-sm-12'tr>>" +
              "<'row'<'col-sm-12 col-md-5'i><'col-sm-12 col-md-7'p>>",
            data: data,
            buttons: [
              "csv",
              {
                text: '<i class="fa fa-id-badge fa-fw" aria-hidden="true"></i><p>Click to view as table</p>',
                action: function (e, dt, node) {
                  $(dt.table().node()).toggleClass("cards");
                  if ($(dt.table().node()).hasClass("cards")) {
                    $(".fa", node)
                      .removeClass("fa-table")
                      .addClass("fa-id-badge");
                    $("p", node).text("Click to view as table");
                  } else {
                    $(".fa", node)
                      .removeClass("fa-id-badge")
                      .addClass("fa-table");
                    $("p", node).text("Click to view as cards");
                  }
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
              { data: "Author/Publisher", title: "Author/Publisher" },
              { data: "Practice Area", title: "Practice Area" },
              { data: "Year Published", title: "Year Published" },
              {
                data: "Tool URL",
                title: "Tool URL",
                render: function (data, type, row) {
                  return type === "display"
                    ? '<a href="' + data + '">Visit tool page</a>'
                    : data;
                },
              },
              { data: "Type", title: "Type" },
              { data: "Origin", title: "Country of Origin" },
              { data: "Tags", title: "Tags" },
              {
                data: "Citation",
                title: "Citation",
                render: function (data, type, row) {
                  // If data is empty or undefined, return 'N/A'
                  return data && data.trim() ? data : "N/A";
                },
              },
            ],
            drawCallback: function (settings) {
              var api = this.api();
              var $table = $(api.table().node());

              if ($table.hasClass("cards")) {
                var labels = [];
                $("thead th", $table).each(function () {
                  labels.push($(this).text());
                });

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
                $("tbody td", $table).each(function () {
                  $(this).removeAttr("data-label");
                });

                $("tbody tr", $table).each(function () {
                  $(this).height("auto");
                });
              }
            },
          });

          $(table.table().node()).addClass("cards");
          $(".fa", this).toggleClass(["fa-table", "fa-id-badge"]);
          table.draw();

          table.on("click", "tr", function () {
            var data = table.row(this).data();
            var dialogContent = `
          Resource: ${data.Resource}<br>
          Publisher: ${data.Publisher}<br>
          Country of Origin: ${data.Origin}<br>
          Practice Area: ${data["Practice Area"]}<br>
          Year: ${data["Year Published"]}<br>
          URL: <a href="${data["Tool URL"]}">${data["Tool URL"]}</a><br>
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

          $("#filterType, #filterPracticeArea, #filterOrigin").on(
            "change",
            filterData
          );
        },
        error: function (error) {
          console.error("Error parsing CSV: ", error);
        },
      });
    });
});

$("#closeDialog").on("click", function () {
  $("#cardDetailsDialog")[0].close();
});

// assign different colors to the tags in the table
var tags = document.getElementsByClassName("tags");
