function update_control(status, mode, run, set, pump) {
  if (status == 1) {
    document.getElementById("btn-status-on").className = "btn-success btn";
    document.getElementById("btn-status-off").className = "btn-secondary2 btn";

    document.querySelector("#btn-mode-1c").disabled = false;
    document.querySelector("#btn-mode-nc").disabled = false;
    document.querySelector("#btn-run-on").disabled = false;
    document.querySelector("#btn-set-on").disabled = false;
    document.querySelector("#btn-pump-off").disabled = false;
    document.querySelector("#btn-pump-on").disabled = false;
    document.querySelector("#submit").disabled = false;
  } else {
    document.getElementById("btn-status-off").className = "btn-danger btn";
    document.getElementById("btn-status-on").className = "btn-secondary btn";

    document.querySelector("#btn-mode-1c").disabled = true;
    document.querySelector("#btn-mode-nc").disabled = true;
    document.querySelector("#btn-run-on").disabled = true;
    document.querySelector("#btn-set-on").disabled = true;
    document.querySelector("#btn-pump-off").disabled = true;
    document.querySelector("#btn-pump-on").disabled = true;
    document.querySelector("#submit").disabled = true;
  }

  if (mode == 1) {
    document.getElementById("btn-mode-nc").className = "btn-primary btn";
    document.getElementById("btn-mode-1c").className = "btn-secondary btn";
  } else {
    document.getElementById("btn-mode-1c").className = "btn-primary btn";
    document.getElementById("btn-mode-nc").className = "btn-secondary btn";
  }

  if (run == 1) {
    document.getElementById("btn-run-on").className = "btn-primary btn";

    var delayInMilliseconds = 500; //1 second

    setTimeout(function () {
      //executed after 1 second
      document.getElementById("btn-run-on").className = "btn-secondary btn";
    }, delayInMilliseconds);
  }

  if (set == 1) {
    document.getElementById("btn-set-on").className = "btn-primary btn";

    var delayInMilliseconds = 500; //1 second
    setTimeout(function () {
      //executed after 1 second
      document.getElementById("btn-set-on").className = "btn-secondary btn";
    }, delayInMilliseconds);
  }

  if (pump == 1) {
    document.getElementById("btn-pump-on").className = "btn-primary btn";
    document.getElementById("btn-pump-off").className = "btn-secondary btn";
  } else {
    document.getElementById("btn-pump-off").className = "btn-primary btn";
    document.getElementById("btn-pump-on").className = "btn-secondary btn";
  }
}
$(document).ready(function () {
  // Init
  var status = 0;
  var mode = 0;
  var run = 0;
  var set = 0;
  var pump = 0;

  var reset_time = 0;
  var dip_time = 0;
  var dry_time = 0;
  var extract_time = 0;

  // Read parameters from Control table via API
  $.get("/api/control", function (data) {
    status = data[0].status;
    mode = data[0].mode;
    run = data[0].run;
    set = data[0].set_init;
    pump = data[0].pump;

    reset_time = data[0].reset_time;
    dip_time = data[0].dip_time;
    dry_time = data[0].dry_time;
    extract_time = data[0].extract_time;

    //Update control
    update_control(status, mode, run, set, pump);

    //Update timer
    document.getElementById("reset_time").value = reset_time;
    document.getElementById("dip_time").value = dip_time;
    document.getElementById("dry_time").value = dry_time;
    document.getElementById("extract_time").value = extract_time;
  });

  document.getElementById("submit").onclick = fn_submit;
  function fn_submit() {
    $.post("/api/update-timer", $("#form").serialize(), function () {
      console.log("data sent");
      alert("Thiết lập thành công!");
    });
    var delayInMilliseconds = 1000; //1 second

    setTimeout(function () {
      //your code to be executed after 1 second
    }, delayInMilliseconds);

    return false;
  }

  document.getElementById("btn-status-off").onclick = fn_btn_status_off;
  function fn_btn_status_off() {
    console.log("btn-status-off click");
    status = 0;
    update_control(status, mode, run, set, pump)
    fn_connect();
  }

  document.getElementById("btn-status-on").onclick = fn_btn_status_on;
  function fn_btn_status_on() {
    console.log("btn-status-on click");
    status = 1;
    update_control(status, mode, run, set, pump)
    fn_connect();
  }

  document.getElementById("btn-mode-1c").onclick = fn_btn_mode_1c;
  function fn_btn_mode_1c() {
    console.log("btn-mode-1c click");
    mode = 0;
    update_control(status, mode, run, set, pump)
    fn_connect();
  }

  document.getElementById("btn-mode-nc").onclick = fn_btn_mode_nc;
  function fn_btn_mode_nc() {
    console.log("btn-mode-nc click");
    mode = 1;
    update_control(status, mode, run, set, pump)
    fn_connect();
  }

  document.getElementById("btn-run-on").onclick = fn_btn_run_on;
  function fn_btn_run_on() {
    console.log("btn-run-on click");
    run = 1;
    update_control(status, mode, run, set, pump)
    fn_connect();
    run = 0;
  }

  document.getElementById("btn-set-on").onclick = fn_btn_set_on;
  function fn_btn_set_on() {
    console.log("btn-set-on click");
    set = 1;
    update_control(status, mode, run, set, pump)
    fn_connect();
    set = 0;
  }

  document.getElementById("btn-pump-off").onclick = fn_btn_pump_off;
  function fn_btn_pump_off() {
    console.log("btn-pump-off click");
    pump = 0;
    update_control(status, mode, run, set, pump)
    fn_connect();
  }

  document.getElementById("btn-pump-on").onclick = fn_btn_pump_on;
  function fn_btn_pump_on() {
    console.log("btn-pump-on click");
    pump = 1;
    update_control(status, mode, run, set, pump)
    fn_connect();
  }

  function fn_connect() {
    var data = {
      dtStatus: status,
      dtMode: mode,
      dtRun: run,
      dtSet: set,
      dtPump: pump,
    };
    $.post("/api/update-control", data);
    // $.post("/api/mqtt");
  }
});
