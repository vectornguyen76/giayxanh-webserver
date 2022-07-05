// Set new default font family and font color to mimic Bootstrap's default styling
Chart.defaults.global.defaultFontFamily =
  '-apple-system,system-ui,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Arial,sans-serif';
Chart.defaults.global.defaultFontColor = "#292b2c";

// Area Chart Example
var ctx = document.getElementById("mycanvas");
var myLineChart = new Chart(ctx, {
  type: "line",
  data: {
    labels: [1,2,3,4,5,6,7,8,9,10],
    datasets: [
      {
        label: "Số lượng",
        lineTension: 0.3,
        backgroundColor: "#ff7c43",
        borderColor: "#003f5c",
        pointRadius: 5,
        pointBackgroundColor: "rgba(249, 93, 106, 0.8)",
        pointBorderColor: "rgba(255,255,255,0.8)",
        pointHoverRadius: 5,
        pointHoverBackgroundColor: "rgba(249, 93, 106, 1)",
        pointHitRadius: 50,
        pointBorderWidth: 2,
        data: [0,1,2,3,4,5,6,7,8,9,10],
      },
    ],
  },
  options: {
    animation: false,
    scales: {
      xAxes: [
        {
          time: {
            unit: "time",
          },
          gridLines: {
            display: false,
          },
          ticks: {
            maxTicksLimit: 20,
          },
        },
      ],
      yAxes: [
        {
          ticks: {
            min: 0,
            max: 10,
            maxTicksLimit: 20,
          },
          gridLines: {
            color: "rgba(0, 0, 0, .125)",
          },
        },
      ],
    },
    legend: {
      display: false,
    },
  },
});

// load data tu database
$(document).ready(function () {
  updateChart();
});

setInterval(updateChart, 1000);
function updateChart() {
  // gui request xuong database de lay data

  //chu y duong dan
  $.get("/api/get-quantity", function (data) {
    var stt = [];
    var quantity = [];

    for (var i in data) {
      var time = new Date(data[i].datetime);
      stt.push(time.toLocaleTimeString());
      quantity.push(data[i].quantity);
    }
    myLineChart.data.labels = stt;
    myLineChart.data.datasets[0].data = quantity;
    myLineChart.options.scales.yAxes[0].ticks.max = Math.max( ...quantity) + 5;
   
    myLineChart.update();
  });
}


