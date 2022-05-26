import axios from "axios";
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { AiFillPlayCircle } from "react-icons/ai";
import { openDB } from "idb";
const ProcessingOrders = () => {
  const [orders, setOrders] = useState([]);
  const params = useParams();
  const [items,setItems]=useState([])
  const [selectedOrder, setSelectedOrder] = useState();
  const getIndexedDbData = async () => {
    const db = await openDB("BT", +localStorage.getItem("IDBVersion") || 1);
    let tx = await db.transaction("items", "readwrite").objectStore("items");
    let item = await tx.getAll();
    setItems(item);
}
  const getTripOrders = async () => {
    const response = await axios({
      method: "post",
      url: "/orders/GetOrderProcessingList",
      data: {
        trip_uuid: params.trip_uuid,
      },
    });

    if (response.data.success) setOrders(response.data.result);
  };
  useEffect(() => {
    getTripOrders();
    getIndexedDbData()
  }, []);

  console.log(orders);
  return (
    <div
      className="item-sales-container orders-report-container"
      style={{ width: "100%", left: "0", top: "0", textAlign: "center" }}
    >
      {selectedOrder ? (
        <>
          <h1>{selectedOrder.counter_title}</h1>
          <button
            className="item-sales-search"
            style={{ width: "max-content" }}
          >
            Next
          </button>
        </>
      ) : (
        ""
      )}
      <div
        className="table-container-user item-sales-container"
        style={{ width: "100%", left: "0", top: "0", display: "flex" }}
      >
        {selectedOrder ? (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "10px",
            }}
          >
            <AiFillPlayCircle style={{ fontSize: "30px", cursor: "pointer" }} />
          </div>
        ) : (
          ""
        )}

        <table
          className="user-table"
          style={{
            maxWidth: "100vw",
            height: "fit-content",
            overflowX: "scroll",
          }}
        >
          <thead>
            <tr>
              <th>S.N</th>
              {selectedOrder ? (
                <>
                  <th colSpan={2}>
                    <div className="t-head-element">Item Name</div>
                  </th>
                  <th >
                    <div className="t-head-element">MRP</div>
                  </th>
                  <th >
                    <div className="t-head-element">Qty</div>
                  </th>
                </>
              ) : (
                <>
                  <th colSpan={2}>
                    <div className="t-head-element">Counter Title</div>
                  </th>
                  <th colSpan={2}>
                    <div className="t-head-element">Progress</div>
                  </th>
                </>
              )}
            </tr>
          </thead>
          <tbody className="tbody">
            {selectedOrder?
            selectedOrder.item_details
            ?.map((item, i) => (
              <tr
                key={Math.random()}
                style={{ height: "30px" }}
                onClick={() => setSelectedOrder(item)}
              >
                <td>{i + 1}</td>
                <td colSpan={2}>{items.find(a=>a.item_uuid===item.item_uuid)?.item_title}</td>
                <td >{items.find(a=>a.item_uuid===item.item_uuid)?.mrp}</td>
                <td >{item.b+":"+item.p}</td>
              </tr>
            ))
            
            : orders
              .sort((a, b) => a.created_at - b.created_at)
              ?.map((item, i) => (
                <tr
                  key={Math.random()}
                  style={{ height: "30px" }}
                  onClick={() => setSelectedOrder(item)}
                >
                  <td>{i + 1}</td>
                  <td colSpan={2}>{item.counter_title}</td>
                  <td colSpan={2}>0/{item?.item_details?.length || 0}</td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ProcessingOrders;
