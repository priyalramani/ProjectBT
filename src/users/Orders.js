import { openDB } from "idb";
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const Orders = () => {
  const [counters, setCounters] = useState([]);
  const [counterFilter, setCounterFilter] = useState("");
  const [routes, setRoutes] = useState([]);
 const Navigate=useNavigate()
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

  return (
    <div
      className="item-sales-container orders-report-container"
      style={{ overflow: "visible", left: "0" }}
    >
      <div
        style={{
          position: "absolute",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          flexDirection: "column",
          width:"100vw"
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
            }}
          >
            <table className="table" style={{ width: "100vw" }}>
              <tbody style={{ width: "100%" }}>
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
                      <tr key={item.counter_uuid} style={{ width: "100%",cursor:"pointer" }} onClick={()=>Navigate("/users/orders/"+item.counter_uuid)}>
                        <td style={{ width: "50%" }}>{item.counter_title}</td>
                        <td style={{ width: "50%" }}>
                          {
                            routes.find(
                              (a) => a?.route_uuid === item?.route_uuid
                            )?.route_title
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
  );
};

export default Orders;
