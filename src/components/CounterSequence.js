import React, { useEffect, useState } from "react";
import Select from "react-select";
const CounterSequence = ({ onSave, counters, routesData }) => {
  const [route, setRoute] = useState("");
  const [counterData, setCounterData] = useState([]);
  useEffect(() => {
    setCounterData(counters.filter((a) => a.route_uuid === route));
  }, [route]);
  return (
    <div className="overlay">
      <div
        className="modal"
        style={{
          height: "fit-content",
          width: "fit-content",
          paddingTop: "40px",
        }}
      >
        <div
          className="content"
          style={{
            height: "fit-content",
            padding: "20px",
            width: "fit-content",
          }}
        >
          <div style={{ overflowY: "scroll" }}>
            {route ? (
              <div style={{ width: "500px" }}>
                <Table counterData={counterData} />
              </div>
            ) : (
              <div style={{ width: "200px" }}>
                <h1>Select Route</h1>
                <Select
                  options={routesData.map((a) => ({
                    value: a.route_uuid,
                    label: a.route_title,
                  }))}
                  onChange={(doc) => setRoute((prev) => doc.value)}
                  value={
                    route
                      ? {
                          value: route,
                          label: routesData?.find(
                            (j) => j.counter_uuid === route
                          )?.route_title,
                        }
                      : ""
                  }
                  openMenuOnFocus={true}
                  menuPosition="fixed"
                  menuPlacement="auto"
                  placeholder="Select"
                />
              </div>
            )}
          </div>
          <button onClick={onSave} className="closeButton">
            x
          </button>
        </div>
      </div>
    </div>
  );
};

export default CounterSequence;
function Table({ counterData }) {
  return (
    <table
      className="user-table"
      style={{ Width: "500px", height: "fit-content", overflowX: "scroll" }}
    >
      <thead>
        <tr>
          <th>Sort Order</th>
          <th colSpan={2}>Counter Title</th>
          <th colSpan={2}>Address</th>
        </tr>
      </thead>
      <tbody className="tbody">
        {counterData.length ? (
          counterData
            ?.sort((a, b) => +a.sort_order - b.sort_order)
            ?.map((item, i) => (
              <tr key={item.counter_uuid} style={{ height: "30px" }}>
                <td>{item.sort_order}</td>
                <td colSpan={2}>{item.counter_title}</td>
                <td colSpan={2}>{item?.address}</td>
              </tr>
            ))
        ) : (
          <tr>
            <td colSpan={5}>No Counter</td>
          </tr>
        )}
      </tbody>
    </table>
  );
}
