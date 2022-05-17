import { openDB } from "idb";
import React, { useState, useEffect } from "react";

const Orders = () => {
  const [counters, setCounters] = useState([]);
  const [counterFilter, setCounterFilter] = useState("");
  const [routes, setRoutes] = useState([]);
  const getIndexedDbData = async () => {
    const db = await openDB("BT", +localStorage.getItem("IDBVersion") || 1);
    let tx = await db
      .transaction("counter", "readwrite")
      .objectStore("counter");
    let counter = await tx.getAll();
    setCounters(counter);
    let store = await db
      .transaction("routes", "readwrite")
      .objectStore("routes");
    let route = await store.getAll();
    setRoutes(route);
  };
  useEffect(() => getIndexedDbData(), []);
  console.log(
    routes,
    counters,
    counters.filter(a=>a.counter_title).filter(
      (a) =>
        !counterFilter ||
        a.counter_title
          .toLocaleLowerCase()
          .includes(counterFilter.toLocaleLowerCase())
    )
  );
  return (
    <div className="item-sales-container orders-report-container" style={{overflow:"visible"}}>
      <div id="item-sales-top" style={{overflow:"visible"}}>
        <div
          id="date-input-container"
          style={{
            overflow: "visible",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: "100%",
            position: "relative",
          }}
        >
          <input
            type="text"
            onChange={(e) => setCounterFilter(e.target.value)}
            value={counterFilter}
            placeholder="Search Counter Title..."
            className="searchInput"
          />
          {counterFilter.length >= 3 ? (
           <div
           style={{
             overflowY: "scroll",
             height: "45vh",
             position:"absolute",
             top:"100%"
           }}
         >
           <table className="table">
             <thead>
               <tr>
                 <th className="description" style={{ width: "25%" }}>
                   Counter
                 </th>
                 <th className="description" style={{ width: "25%" }}>
                   Routes
                 </th>
     
            
               </tr>
             </thead>
     
             <tbody>
               {counters
                 ?.filter((a) => a.counter_title)
                 .filter(
                    (a) =>
                      !counterFilter ||
                      a.counter_title
                        .toLocaleLowerCase()
                        .includes(counterFilter.toLocaleLowerCase())
                  )
                 .map((item, index) => {
                   return (
                     <tr key={item.counter_uuid}>
                       <td>{item.counter_title}</td>
                       <td>
                         {
                           routes.find((a) => a?.route_uuid === item?.route_uuid)
                             ?.route_title
                         }
                       </td>
                      
                     </tr>
                   );
                 })}
             </tbody>
           </table>
         </div>
          ) : (
            ""
          )}
        </div>
      </div>
    </div>
  );
};

export default Orders;
