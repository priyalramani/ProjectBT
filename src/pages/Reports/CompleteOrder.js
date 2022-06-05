import axios from "axios";
import React, { useEffect, useState } from "react";
import Header from "../../components/Header";
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
        <AddOrder
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
function AddOrder({ order, onSave }) {
  const [counters, setCounters] = useState([]);
  const [itemsData, setItemsData] = useState([]);
console.log(order)
  const getItemsData = async () => {
    const response = await axios({
      method: "get",
      url: "/items/GetItemList",

      headers: {
        "Content-Type": "application/json",
      },
    });
    if (response.data.success) setItemsData(response.data.result);
  };

  const getCounter = async () => {
    const response = await axios({
      method: "get",
      url: "/counters/GetCounterList",

      headers: {
        "Content-Type": "application/json",
      },
    });
    if (response.data.success) setCounters(response.data.result);
  };
  useEffect(() => {
    getCounter();
    getItemsData();
  }, []);

  return (
    <>
      <div className="overlay">
        <div className="modal" style={{ height: "fit-content", width: "80vw" }}>
          <div
            className="content"
            style={{
              height: "fit-content",
              padding: "20px",
              width: "fit-content",
            }}
          ></div>
          <div className="inventory">
            <div
              className="accountGroup"
              id="voucherForm"
              action=""
              style={{
                height: "max-content",
                maxHeight: "500px",
                overflow: "scroll",
              }}
            >
              <div className="inventory_header">
                <h2>Order Details</h2>
              </div>

              <div className="topInputs">
                <div className="inputGroup">
                  <h2>
                    {counters.find((a) => a.counter_uuid === order.counter_uuid)
                      ?.counter_title || ""}
                  </h2>
                </div>
              </div>

              <div
                className="items_table"
                style={{ flex: "1", paddingLeft: "10px" }}
              >
                <table className="f6 w-100 center" cellSpacing="0">
                  <thead className="lh-copy" style={{ position: "static" }}>
                    <tr className="white">
                      <th className="pa2 tl bb b--black-20 w-30">Item Name</th>
                      <th className="pa2 tc bb b--black-20">Quantity(b)</th>
                      <th className="pa2 tc bb b--black-20">Quantity(p)</th>
                      <th className="pa2 tc bb b--black-20 ">Price</th>
                    </tr>
                  </thead>
                  
                    <tbody className="lh-copy">
                      {order?.item_details?.map((item, i) => {
                        return (
                          <tr key={i} style={{height:"50px"}}>
                            <td className="ph2 pv1 tl bb b--black-20 bg-white">
                              <div className="inputGroup">
                                {itemsData.find(
                                  (a) => a.item_uuid === item.item_uuid
                                )?.item_title || ""}
                              </div>
                            </td>
                            <td
                              className="ph2 pv1 tc bb b--black-20 bg-white"
                              style={{ textAlign: "center" }}
                            >
                              {item.b || 0}
                            </td>
                            <td
                              className="ph2 pv1 tc bb b--black-20 bg-white"
                              style={{ textAlign: "center" }}
                            >
                              {item.p || 0}
                            </td>
                            <td
                              className="ph2 pv1 tc bb b--black-20 bg-white"
                              style={{ textAlign: "center" }}
                            >
                              Rs {item?.item_price || 0}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                 
                </table>
              </div>
              <div className="bottomContent"></div>
            </div>
            <button onClick={onSave} className="closeButton">
              x
            </button>
          </div>
        </div>
      </div>
    </>
  );
}