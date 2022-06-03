import axios from "axios";
import React, { useState, useEffect, useContext } from "react";

export default function ItemAvilibility({
  isItemAvilableOpen,
  setIsItemAvilableOpen,
}) {
  const [itemsData, setItemsData] = useState([]);
  const [btn, setBtn] = useState(false);
  const [itemFilter, setItemFilter] = useState("");
  const getTripData = async () => {
    const response = await axios({
      method: "get",
      url: "/trips/GetTripList",

      headers: {
        "Content-Type": "application/json",
      },
    });
    if (response.data.success)
      setItemsData(response.data.result.filter((a) => a.status));
  };
  useEffect(() => {
    getTripData();
  }, [btn]);
  const completeFuntion = async (data) => {
    const response = await axios({
      method: "put",
      url: "/trips/putTrip",
      data: { ...data, status: 0 },
      headers: {
        "Content-Type": "application/json",
      },
    });
    if (response.data.success) {
      setBtn((prev) => !prev);
    }
  };
  return (
    <div className="itemavilablelity">
      <div className="itemavilabelitycontainer">
        <div className="itemavilablelity_header">
          <h2>Trips</h2>
        </div>

        <div className="availablecontainer">
          <div className="itemavilablelitybox">
            <input
              className="numberInput"
              type="text"
              name="item_filter"
              value={itemFilter}
              onChange={(e) => {
                setItemFilter(e.target.value);
              }}
              placeholder="Items Filter"
              style={{ width: "200px", margin: "10px 0" }}
            />
            <div className="items_table">
              <table className="f6 w-100 center" cellSpacing="0">
                <thead className="lh-copy">
                  <tr className="white">
                    <th
                      className="pa3 bb b--black-20 "
                      style={{ borderBottom: "2px solid rgb(189, 189, 189)" }}
                    >
                      Created At
                    </th>
                    <th
                      className="pa3 bb b--black-20 "
                      style={{ borderBottom: "2px solid rgb(189, 189, 189)" }}
                    >
                      Title
                    </th>
                    <th
                      className="pa3 bb b--black-20 "
                      style={{ borderBottom: "2px solid rgb(189, 189, 189)" }}
                    >
                      Order
                    </th>
                    <th
                      className="pa3 bb b--black-20 "
                      style={{ borderBottom: "2px solid rgb(189, 189, 189)" }}
                    >
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="lh-copy">
                  {itemsData
                    .sort((a, b) => a.trip_title.localeCompare(b.trip_title))
                    .filter(
                      (a) =>
                        (itemFilter !== ""
                          ? a.trip_title
                              .toLowerCase()
                              .includes(itemFilter.toLowerCase())
                          : true) && a.trip_title
                    )
                    .map((item, index) => (
                      <tr
                        key={index}
                        style={{ borderBottom: "2px solid rgb(189, 189, 189)",height:"50px" }}
                      >
                        <td
                          className="ph3 bb b--black-20 tc bg-white"
                          style={{ textAlign: "center" }}
                        >
                          {new Date(item.created_at).toDateString()}
                        </td>
                        <td
                          className="ph3 bb b--black-20 tc bg-white"
                          style={{ textAlign: "center" }}
                        >
                          {item.trip_title}
                        </td>
                        <td
                          className="ph3 bb b--black-20 tc bg-white"
                          style={{ textAlign: "center" }}
                        >
                          {item.orderLength}
                        </td>
                        <td
                          className="ph3 bb b--black-20 tc bg-white"
                          style={{ textAlign: "center" }}
                        >
                          <button
                            className="item-sales-search"
                            style={{ display: "inline",cursor:item?.orderLength?"not-allowed":"pointer" }}
                            type="button"
                            onClick={() => {
                              completeFuntion(item);
                            }}
                            disabled={item?.orderLength}
                          >
                            Complete
                          </button>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div onClick={() => {setIsItemAvilableOpen(false)}}>
          <button className="savebtn">Done</button>
        </div>
      </div>
    </div>
  );
}
