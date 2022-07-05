
var myTable = document.getElementById("datatablesSimple");

// load data tu database
$(document).ready(function () {

  update();

});
// setInterval(update, 1000);
function update() {
  // gui request xuong database de lay data
  $.get("/api/report", function (data) {
    var data1 = [];
    var data2 = [];
    var data3 = [];
    var data4 = [];
    var data5 = [];
    var data6 = [];
    // var data7 = [];
    x = 1;
    for (var i in data) {
      id = data[i].id;
      date = (new Date(data[i].date)).toLocaleDateString();
      quantity = data[i].quantity;
      start_time = (new Date(data[i].start_time)).toLocaleTimeString();
      finish_time = (new Date(data[i].finish_time)).toLocaleTimeString();
      diff = (new Date(data[i].finish_time)).getTime() - 
      (new Date(data[i].start_time)).getTime();

      var msec = diff;
      var hh = Math.floor(msec / 1000 / 60 / 60);
      msec -= hh * 1000 * 60 * 60;
      var mm = Math.floor(msec / 1000 / 60);
      msec -= mm * 1000 * 60;
      var ss = Math.floor(msec / 1000);
      msec -= ss * 1000;
      total_time = hh + ":" + mm + ":" + ss;

      data1.push(id);
      data2.push(date);
      data3.push(start_time);
      data4.push(finish_time);
      data5.push(total_time);
      data6.push(quantity);
      // data7.push(data[i].power);

      var row = myTable.insertRow(x);
      x++;

      // Insert new cells (<td> elements) at the 1st and 2nd position of the "new" <tr> element:
      var cell1 = row.insertCell(0);
      var cell2 = row.insertCell(1);
      var cell3 = row.insertCell(2);
      var cell4 = row.insertCell(3);
      var cell5 = row.insertCell(4);
      var cell6 = row.insertCell(5);
      // var cell7 = row.insertCell(6);

      cell1.innerHTML = data1[i];
      cell2.innerHTML = data2[i];
      cell3.innerHTML = data3[i];
      cell4.innerHTML = data4[i];
      cell5.innerHTML = data5[i];
      cell6.innerHTML = data6[i];
      // cell7.innerHTML = data7[i];
    }
    if (myTable) {
      new simpleDatatables.DataTable(myTable);
    }
  });
}

function exportData() {
  // gui request xuong database de lay data
  var rows = [];
  $.get("/api/report", function (data) {
    //header
    row = myTable.rows[0]
    column1 = row.cells[0].innerText;
    column2 = row.cells[1].innerText;
    column3 = row.cells[2].innerText;
    column4 = row.cells[3].innerText;
    column5 = row.cells[4].innerText;
    column6 = row.cells[5].innerText;
    // column7 = row.cells[6].innerText;
    rows.push(
      [
        column1,
        column2,
        column3,
        column4,
        column5,
        column6
        // column7
      ]
    );



    //body
    for (var i in data) {
      id = data[i].id;
      date = (new Date(data[i].date)).toLocaleDateString();
      quantity = data[i].quantity;
      start_time = (new Date(data[i].start_time)).toLocaleTimeString();
      finish_time = (new Date(data[i].finish_time)).toLocaleTimeString();
      diff = (new Date(data[i].finish_time)).getTime() - 
      (new Date(data[i].start_time)).getTime();

      var msec = diff;
      var hh = Math.floor(msec / 1000 / 60 / 60);
      msec -= hh * 1000 * 60 * 60;
      var mm = Math.floor(msec / 1000 / 60);
      msec -= mm * 1000 * 60;
      var ss = Math.floor(msec / 1000);
      msec -= ss * 1000;
      total_time = hh + ":" + mm + ":" + ss;
      rows.push(
        [
          id,
          date,
          start_time,
          finish_time,
          total_time,
          quantity
        ]
      );
    }

    var CsvString = "";
    var universalBOM = "\uFEFF";
    rows.forEach(function (RowItem, RowIndex) {
      RowItem.forEach(function (ColItem, ColIndex) {
        CsvString += ColItem + ',';
      });
      CsvString += "\r\n";
    });
    CsvString = "data:application/csv;charset=utf-8," + encodeURIComponent(universalBOM + CsvString);
    var x = document.createElement("A");
    x.setAttribute("href", CsvString);
    x.setAttribute("download", "Thống kê.csv");
    document.body.appendChild(x);
    x.click();

  });
}
