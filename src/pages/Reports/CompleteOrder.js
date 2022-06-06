import axios from "axios";
import React, { useEffect, useState } from "react";
import Header from "../../components/Header";
import { OrderDetails } from "../../components/OrderDetails";
import Sidebar from "../../components/Sidebar";
const CompleteOrder = () => {
  const [searchData, setSearchData] = useState({
    startDate: "",
    endDate: "",
  });
  const [popupOrder, setPopupOrder] = useState(null);
  const [items, setItems] = useState([]);

  const getCompleteOrders = async () => {
    let startDate = new Date(searchData.startDate + " 00:00:00 AM");
    startDate = startDate.getTime();
    let endDate = new Date(searchData.endDate + " 00:00:00 AM");
    endDate = endDate.getTime();
    const response = await axios({
      method: "post",
      url: "/orders/getCompleteOrderList",
      data: { startDate, endDate },
      headers: {
        "Content-Type": "application/json",
      },
    });
    console.log("activity", response);
    if (response.data.success) setItems(response.data.result);
  };

  useEffect(() => {
    let time = new Date();
    let curTime = "yy-mm-dd"
      .replace("mm", ("00" + (time?.getMonth() + 1).toString()).slice(-2))
      .replace("yy", ("0000" + time?.getFullYear().toString()).slice(-4))
      .replace("dd", ("00" + time?.getDate().toString()).slice(-2));
    setSearchData((prev) => ({
      ...prev,
      startDate: curTime,
      endDate: curTime,
    }));
   
  }, []);
  console.log(searchData);
  return (
    <>
      <Sidebar />
      <Header />
      <div className="item-sales-container orders-report-container">
        <div id="heading">
          <h2>User Activity </h2>
        </div>
        <div id="item-sales-top">
          <div
            id="date-input-container"
            style={{
              overflow: "visible",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              width: "100%",
            }}
          >
            <input
              type="date"
              onChange={(e) =>
                setSearchData((prev) => ({
                  ...prev,
                  startDate: e.target.value,
                }))
              }
              value={searchData.startDate}
              placeholder="Search Counter Title..."
              className="searchInput"
            />
            <input
              type="date"
              onChange={(e) =>
                setSearchData((prev) => ({ ...prev, endDate: e.target.value }))
              }
              value={searchData.endDate}
              placeholder="Search Route Title..."
              className="searchInput"
            />

            <button
              className="item-sales-search"
              onClick={() => getCompleteOrders()}
            >
              Search
            </button>
          </div>
        </div>
        <div className="table-container-user item-sales-container">
          <Table itemsDetails={items} setPopupOrder={setPopupOrder}/>
        </div>
      </div>
     {popupOrder ? (
        <OrderDetails
          onSave={() => {
            setPopupOrder(null);
          }}
          order={popupOrder}
        />
      ) : (
        ""
      )}
    </>
  );
};

export default CompleteOrder;

function Table({ itemsDetails,setPopupOrder }) {
  function formatAMPM(date) {
    var hours = date.getHours();
    var minutes = date.getMinutes();
    var ampm = hours >= 12 ? "pm" : "am";
    hours = hours % 12;
    hours = hours ? hours : 12; // the hour '0' should be '12'
    minutes = minutes < 10 ? "0" + minutes : minutes;
    var strTime = hours + ":" + minutes + " " + ampm;
    return strTime;
  }
 
  return (
    <table
      className="user-table"
      style={{ maxWidth: "100vw", height: "fit-content", overflowX: "scroll" }}
    >
      <thead>
        <tr>
          <th>S.N</th>
          <th colSpan={2}>Order Date</th>
          <th colSpan={2}>Delivery Date</th>
          <th colSpan={3}>Counter</th>
          <th colSpan={2}>Invoice</th>
          <th colSpan={2}>Qty</th>
          <th colSpan={2}>Amount</th>
        </tr>
      </thead>
      <tbody className="tbody">
        {itemsDetails
          ?.sort((a, b) => a.order_date - b.order_date)
          ?.map((item, i, array) => (
            <tr key={Math.random()} style={{ height: "30px" }} onClick={() => setPopupOrder(item)}>
              <td>{i + 1}</td>
              <td colSpan={2}>
                {new Date(item.order_date).toDateString()} -{" "}
                {formatAMPM(new Date(item.order_date))}
              </td>
              <td colSpan={2}>
                {new Date(item.delivery_date).toDateString()} -{" "}
                {formatAMPM(new Date(item.delivery_date))}
              </td>
              <td colSpan={3}>{item.counter_title || ""}</td>
              <td colSpan={2}>{item.invoice_number || ""}</td>
              <td colSpan={2}>{item.qty || ""}</td>
              <td colSpan={2}>{item.amt || ""}</td>
            </tr>
          ))}
      </tbody>
    </table>
  );
}
