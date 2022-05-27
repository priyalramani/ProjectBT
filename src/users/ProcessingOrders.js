import axios from "axios";
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { AiFillPlayCircle } from "react-icons/ai";
import { openDB } from "idb";
import { useSpeechSynthesis } from "react-speech-kit";
const ProcessingOrders = () => {
  const [orders, setOrders] = useState([]);
  const params = useParams();
  const [items, setItems] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState();
  const { speak } = useSpeechSynthesis();
  const [orderSpeech, setOrderSpeech] = useState("");

  const getIndexedDbData = async () => {
    const db = await openDB("BT", +localStorage.getItem("IDBVersion") || 1);
    let tx = await db.transaction("items", "readwrite").objectStore("items");
    let item = await tx.getAll();
    setItems(item);
  };
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
    getIndexedDbData();
  }, []);
  const PlayAudio = async () => {
    let item = selectedOrder?.item_details?.filter((a) => !a.status)[0];
    if (!item) {
      await speak({ text: "Order Completed" });

      return;
    }

    setOrderSpeech(item.item_uuid);
    let detail = items.find((a) => a.item_uuid === item.item_uuid);
    console.log(detail);
    let data = `${detail.pronounce} ${item.b ? `${item.b} box` : ""} ${
      item.p ? `${item.p} pieces` : ""
    }`;
    await speak({ text: data });
    setTimeout(() => setOrderSpeech(""), 3000);
    setSelectedOrder((prev) => ({
      ...prev,
      item_details: prev.item_details.map((a) =>
        a.item_uuid === item.item_uuid ? { ...a, status: 1 } : a
      ),
    }));
  };
  return (
    <div
      className="item-sales-container orders-report-container"
      style={{ width: "100%", left: "0", top: "0", textAlign: "center" }}
    >
      {selectedOrder ? (
        <>
          <h1>{selectedOrder.counter_title}</h1>
          <div className="flex" style={{ justifyContent: "left" }}>
            <h2 style={{ width: "40vw", textAlign: "start" }}>
              {selectedOrder.invoice_number}
            </h2>
            <button
              className="item-sales-search"
              style={{ width: "max-content" }}
              onClick={() => PlayAudio()}
            >
              Play
            </button>
          </div>
        </>
      ) : (
        ""
      )}
      <div
        className="table-container-user item-sales-container"
        style={{ width: "100%", left: "0", top: "0", display: "flex" }}
      >
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
              {selectedOrder ? <th></th> : ""}
              <th>S.N</th>
              {selectedOrder ? (
                <>
                  <th colSpan={2}>
                    <div className="t-head-element">Item Name</div>
                  </th>
                  <th>
                    <div className="t-head-element">MRP</div>
                  </th>
                  <th>
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
            {selectedOrder
              ? selectedOrder.item_details?.map((item, i) => (
                  <tr key={Math.random()} style={{ height: "30px" }}>
                    {selectedOrder ? (
                      <td
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          padding: "10px",
                        }}
                      >
                        {item.item_uuid === orderSpeech ? (
                          <AiFillPlayCircle
                            style={{ fontSize: "30px", cursor: "pointer" }}
                          />
                        ) : (
                          ""
                        )}
                      </td>
                    ) : (
                      ""
                    )}
                    <td>{i + 1}</td>
                    <td colSpan={2}>
                      {
                        items.find((a) => a.item_uuid === item.item_uuid)
                          ?.item_title
                      }
                    </td>
                    <td>
                      {items.find((a) => a.item_uuid === item.item_uuid)?.mrp}
                    </td>
                    <td>{item.b + ":" + item.p}</td>
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
