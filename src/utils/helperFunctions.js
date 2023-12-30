export function getOrderStage(status=[]){
    let numbers=status.map((item)=>+item.stage)
    let max=Math.max(...numbers)
    return max
}

const stagesData = [
    { value: "all", label: "All" },
    { value: 1, label: "Processing" },
    { value: 2, label: "Checking" },
    { value: 3, label: "Out for Delivery" },
    { value: 3.5, label: "Delivered" },
  ];
export function getStageName(stage){
    let name=stagesData.find((item)=>item.value===stage)
    return name.label
}
export function formatAMPM(date) {
    var hours = date.getHours()
    var minutes = date.getMinutes()
    var ampm = hours >= 12 ? "pm" : "am"
    hours = hours % 12
    hours = hours ? hours : 12 // the hour '0' should be '12'
    minutes = minutes < 10 ? "0" + minutes : minutes
    var strTime = hours + ":" + minutes + " " + ampm
    return strTime
}