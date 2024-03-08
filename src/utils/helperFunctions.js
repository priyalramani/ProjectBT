export function getOrderStage(status = []) {
  let numbers = status.map((item) => +item.stage);
  let max = Math.max(...numbers);
  return max;
}

const stagesData = [
  { value: "all", label: "All" },
  { value: 1, label: "Processing" },
  { value: 2, label: "Checking" },
  { value: 3, label: "Out for Delivery" },
  { value: 3.5, label: "Delivered" },
];
export function getStageName(stage) {
  let name = stagesData.find((item) => item.value === stage);
  return name.label;
}
export function formatAMPM(date) {
  var hours = date.getHours();
  var minutes = date.getMinutes();
  var ampm = hours >= 12 ? "pm" : "am";
  hours = hours % 12;
  hours = hours ? hours : 12; // the hour '0' should be '12'
  minutes = minutes < 10 ? "0" + minutes : minutes;
  var strTime = hours + ":" + minutes + " " + ampm;
  return strTime;
}
export function getLastWeekDates() {
  // Get the current date
  var currentDate = new Date();

  // Set the date to the first day of the current month

  // Subtract one day to get the last day of the previous month
  currentDate.setDate(currentDate.getDay() - 7);

  // Return the date
  return currentDate;
}
export function getLastMonthDate() {
  // Get the current date
  var currentDate = new Date();

  // Set the date to the first day of the current month
  // currentDate.setDate(1);

  // Subtract one day to get the last day of the previous month
  currentDate.setMonth(currentDate.getMonth() - 1);

  // Return the date
  return currentDate;
}
export function getFormateDate(time) {
  let curTime = "yy-mm-dd"
    .replace("mm", ("00" + (time?.getMonth() + 1)?.toString()).slice(-2))
    .replace("yy", ("0000" + time?.getFullYear()?.toString()).slice(-4))
    .replace("dd", ("00" + time?.getDate()?.toString()).slice(-2));
  return curTime;
}
