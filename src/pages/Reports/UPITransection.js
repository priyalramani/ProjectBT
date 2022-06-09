import axios from "axios";
import React, { useEffect, useState } from "react";
import Header from "../../components/Header";
import Sidebar from "../../components/Sidebar";
const UPITransection = () => {
  const [items, setItems] = useState([]);
  const getActivityData = async () => {
    const response = await axios({
      method: "get",
      url: "/receipts/getReceipt",
      headers: {
        "Content-Type": "application/json",
      },
    });
    console.log("transactions", response);
    if (response.data.success) setItems(response.data.result);
  };
  const putActivityData = async (order_uuid,mode_uuid) => {
    const response = await axios({
      method: "put",
      url: "/receipts/putReceiptUPIStatus",
      data:{order_uuid,status:1,mode_uuid},
      headers: {
        "Content-Type": "application/json",
      },
    });
    console.log("transactions", response);
    if (response.data.success) getActivityData();
  };
  useEffect(() => {
      getActivityData();
    }, []);
    return (
        <>
      <Sidebar />
      <Header />
      <div className="item-sales-container orders-report-container">
        <div id="heading">
          <h2>UPI and Cheque Transaction </h2>
        </div>

        <div className="table-container-user item-sales-container">
          <Table itemsDetails={items} putActivityData={putActivityData}/>
        </div>
      </div>
    </>
  );
};

export default UPITransection;
function Table({ itemsDetails,putActivityData }) {
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
          <th colSpan={3}>Counter Title</th>
          <th colSpan={2}>Amount</th>
          <th colSpan={2}>Invoice Number</th>
          <th colSpan={2}>Order Date</th>
          <th colSpan={2}>Payment Date</th>
          <th colSpan={3}>User</th>
          <th colSpan={3}>Type</th>
          <th colSpan={2}>Action</th>
        </tr>
      </thead>
      <tbody className="tbody">
        {itemsDetails
          // ?.sort((a, b) => a.timestamp - b.timestamp)
          ?.map((item, i, array) => (
            <tr key={Math.random()} style={{ height: "30px" }}>
              <td>{i + 1}</td>

              <td colSpan={3}>{item.counter_title || ""}</td>
              <td colSpan={2}>{item.amt || ""}</td>
              <td colSpan={2}>{item.invoice_number || ""}</td>

              <td colSpan={2}>{(new Date(item.order_date)).toDateString() } -{formatAMPM(new Date(item.order_date)) || ""}</td>
              <td colSpan={2}>
              {(new Date(item.payment_date)).toDateString() } -{formatAMPM(new Date(item.payment_date)) || ""}
              </td>
              <td colSpan={3}>
              {item.user_title || ""}
              </td>
              <td colSpan={3}>
              {item.mode_title || ""}
              </td>
              <td colSpan={2}>
                  <button type="button" className="item-sales-search"  onClick={()=>putActivityData(item.order_uuid,item.mode_uuid)}>Complete</button>
              </td>
            </tr>
          ))}
      </tbody>
    </table>
  );
}
