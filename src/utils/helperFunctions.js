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
