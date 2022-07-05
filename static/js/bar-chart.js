// Set new default font family and font color to mimic Bootstrap's default styling
Chart.defaults.global.defaultFontFamily = '-apple-system,system-ui,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Arial,sans-serif';
Chart.defaults.global.defaultFontColor = '#292b2c';

// Bar Chart Example
var ctx = document.getElementById("myBarChart");
var myBarChart = new Chart(ctx, {
  type: 'bar',
  data: {
    labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
    datasets: [{
      label: "Sản lượng",
      backgroundColor: "#003f5c",
      borderColor: "rgba(2,117,216,1)",
      data: [415, 532, 651, 741, 821, 194,425, 532, 251, 741, 982, 484],
    }],
  },
  options: {
    scales: {
      xAxes: [{
        time: {
          unit: 'month'
        },
        gridLines: {
          display: false
        },
        ticks: {
          maxTicksLimit: 12
        }
      }],
      yAxes: [{
        ticks: {
          min: 0,
          max: 200,
          maxTicksLimit: 12
        },
        gridLines: {
          display: true
        }
      }],
    },
    legend: {
      display: false
    }
  }
});


// load data tu database
$(document).ready(function () {
    updateChart();
  });
  
  setInterval(updateChart, 5000);
  function updateChart() {
    // gui request xuong database de lay data
  
    //chu y duong dan
    $.get("/api/report", function (data) {
      var month = [];
      var quantity = [];
  
      const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun",
      "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    
      for (var i in data) {
        var date = new Date(data[i].date);
        month.push(monthNames[date.getMonth()]);
        quantity.push(data[i].quantity);
      }

      result = []
      for (const monthName of monthNames){
        var sum = 0;
        for (var i in month){
          if(month[i] == monthName)
          {
            sum = sum + Number(quantity[i]);
          }
        }
        result.push(sum);
      }

      myBarChart.data.labels = monthNames;
      myBarChart.data.datasets[0].data = result;
      myBarChart.options.scales.yAxes[0].ticks.max = 1000;
  
      myBarChart.update();
    });
  }
  