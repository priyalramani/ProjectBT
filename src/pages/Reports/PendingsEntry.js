import axios from "axios";
import React, { useState, useEffect } from "react";
import Header from "../../components/Header";
import { OrderDetails } from "../../components/OrderDetails";
import Sidebar from "../../components/Sidebar";

const PendingsEntry = () => {
  const [orders, setOrders] = useState([]);
  const [popupOrder, setPopupOrder] = useState(false);

  const [counters, setCounters] = useState([]);

  const getOrders = async () => {
    const response = await axios({
      method: "get",
      url: "/orders/getPendingEntry",

      headers: {
        "Content-Type": "application/json",
      },
    });
    console.log("users", response);
    if (response.data.success)
      setOrders(
        response.data.result.map((a) => ({
          ...a,
          counter_title: counters.find((b) => b.counter_uuid === a.counter_uuid)
            ?.counter_title,
        }))
      );
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
  }, []);
  useEffect(() => {
    getOrders();
  }, [counters]);
  const putOrder = async (order_uuid) => {
    const response = await axios({
      method: "put",
      url: "/orders/putCompleteOrder",
      data: { entry: 1, order_uuid },
      headers: {
        "Content-Type": "application/json",
      },
    });
    if (response.data.success) {
      getOrders();
    }
  };
  return (
    <>
      <Sidebar />
      <Header />
      <div className="item-sales-container orders-report-container">
        <div id="heading">
          <h2>Pending Entry</h2>
        </div>

        <div className="table-container-user item-sales-container">
          <Table
            itemsDetails={orders}
            setPopupOrder={setPopupOrder}
            putOrder={putOrder}
          />
        </div>
      </div>
      {popupOrder ? (
        <OrderDetails
          onSave={() => {
            setPopupOrder(null);
            getOrders();
          }}
          order={popupOrder}
          orderStatus="edit"
        />
      ) : (
        ""
      )}
    </>
  );
};

function Table({ itemsDetails, setPopupOrder, putOrder }) {
  return (
    <table
      className="user-table"
      style={{ maxWidth: "100vw", height: "fit-content", overflowX: "scroll" }}
    >
      <thead>
        <tr>
          <th>S.N</th>
          <th colSpan={2}>Counter</th>
          <th colSpan={2}>Invoice Number</th>
          <th colSpan={2}>Amount</th>
          <th colSpan={2}>Cash</th>
          <th colSpan={2}>Cheque</th>
          <th colSpan={2}>UPI</th>
          <th colSpan={2}>Unpaid</th>
          <th colSpan={2}>Action</th>
        </tr>
      </thead>
      <tbody className="tbody">
        {itemsDetails
          ?.sort((a, b) => a.time - b.time)
          ?.map((item, i, array) => (
            <tr
              key={Math.random()}
              style={{ height: "30px" }}
              onClick={(e) => {
                e.stopPropagation();
                setPopupOrder(item);
              }}
            >
              <td>{i + 1}</td>

              <td colSpan={2}>{item.counter_title || ""}</td>
              <td colSpan={2}>{item.invoice_number || ""}</td>
              <td colSpan={2}>{item.order_grandtotal || ""}</td>
              <td colSpan={2}>
                {item.modes.find(
                  (a) => a.mode_uuid === "c67b54ba-d2b6-11ec-9d64-0242ac120002"
                )?.amt || 0}
              </td>
              <td colSpan={2}>
                {item.modes.find(
                  (a) => a.mode_uuid === "c67b5794-d2b6-11ec-9d64-0242ac120002"
                )?.amt || 0}
              </td>
              <td colSpan={2}>
                {item.modes.find(
                  (a) => a.mode_uuid === "c67b5988-d2b6-11ec-9d64-0242ac120002"
                )?.amt || 0}
              </td>
              <td colSpan={2}>{item.unpaid || 0}</td>
              <td colSpan={2}>
                <button
                  className="item-sales-search"
                  onClick={(e) => {
                    e.stopPropagation();
                    putOrder(item.order_uuid);
                  }}
                >
                  Done
                </button>
              </td>
            </tr>
          ))}
      </tbody>
    </table>
  );
}

export default PendingsEntry;
