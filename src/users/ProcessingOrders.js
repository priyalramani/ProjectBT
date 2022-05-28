import axios from "axios";
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { AiFillPlayCircle } from "react-icons/ai";
import { openDB } from "idb";
import { useSpeechSynthesis } from "react-speech-kit";
import { Billing } from "../functions";
const ProcessingOrders = () => {
  const [orders, setOrders] = useState([]);
  const [popupForm, setPopupForm] = useState(false);
  const params = useParams();
  const [items, setItems] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [counters, setCounters] = useState([]);
  const [itemCategories, setItemsCategory] = useState([]);
  const [playCount, setPlayCount] = useState(1);
  const [selectedOrder, setSelectedOrder] = useState();
  const { speak } = useSpeechSynthesis();
  const [orderSpeech, setOrderSpeech] = useState("");
  const [updateBilling, setUpdateBilling] = useState(false);
  useEffect(() => {
    let data = sessionStorage.getItem("playCount");
    if (data) {
      setPlayCount(data);
    }
  }, []);
  const getIndexedDbData = async () => {
    const db = await openDB("BT", +localStorage.getItem("IDBVersion") || 1);
    let tx = await db.transaction("items", "readwrite").objectStore("items");
    let item = await tx.getAll();
    setItems(item);
    let store = await db
      .transaction("companies", "readwrite")
      .objectStore("companies");
    let company = await store.getAll();
    setCompanies(company);
    store = await db
      .transaction("item_category", "readwrite")
      .objectStore("item_category");
    let route = await store.getAll();
    setItemsCategory(route);
    store = await db.transaction("counter", "readwrite").objectStore("counter");
    let countersData = await store.getAll();
    setCounters(countersData);
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
  const PlayAudio = async (item) => {
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
  const postOrderData = async () => {
    let data = [selectedOrder];
    if (updateBilling) {
      let billingData = await Billing(
        counters.find((a) => a.counter_uuid === selectedOrder.counter_uuid),
        selectedOrder.item_details
      );
      data = [
        {
          ...data[0],
          ...billingData,
          item_details: billingData.items,
        },
      ];
    }
    if (
      !data?.item_details?.filter((a) => +a.status === 0 || +a.status === 2)
        .length
    )
      data = data.map((a) => ({
        ...a,
        status: a.status.filter((a) => +a.stage === 2).length
          ? a.status
          : a.status.length
          ? [
              ...a.status,
              {
                stage: "2",
                time: new Date().getTime(),
                user_uuid: localStorage.getItem("user_uuid"),
              },
            ]
          : [
              {
                stage: "2",
                time: new Date().getTime(),
                user_uuid: localStorage.getItem("user_uuid"),
              },
            ],
      }));

    const response = await axios({
      method: "put",
      url: "/orders/putOrders",
      data,
      headers: {
        "Content-Type": "application/json",
      },
    });
    if (response.data.success) {
      sessionStorage.setItem("playCount", playCount);
      setSelectedOrder(false);
      getTripOrders();
    }
  };
  return (
    <>
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
                onClick={() => {
                  let items = selectedOrder?.item_details?.filter(
                    (a) => !a.status
                  );
                  for (let i = 0; i < playCount; i++) {
                    if (i === 0) PlayAudio(items[0]);
                    else if (items[i]) {
                      setTimeout(() => PlayAudio(items[i]), 3000);
                    }
                  }
                }}
              >
                Play
              </button>
              <button
                className="item-sales-search"
                style={{
                  width: "max-content",
                  position: "fixed",
                  top: 0,
                  right: 0,
                }}
                onClick={() => {
                  postOrderData();
                }}
              >
                Save
              </button>
              <input
                className="searchInput"
                style={{
                  position: "fixed",
                  top: 0,
                  left: 0,
                  border: "none",
                  borderBottom: "2px solid black",
                  borderRadius: "0px",
                  width: "50px",
                  padding: "0 5px",
                }}
                value={playCount}
                onChange={(e) => setPlayCount(e.target.value)}
              />
            </div>
          </>
        ) : (
          ""
        )}
        <div
          className="table-container-user item-sales-container"
          style={{
            width: "100vw",
            overflow: "scroll",
            left: "0",
            top: "0",
            display: "flex",
          }}
        >
          <table
            className="user-table"
            style={{
              width: selectedOrder ? "max-content" : "100%",
              height: "fit-content",
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
                    <th>
                      <div className="t-head-element">Action</div>
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
                ? selectedOrder.item_details
                    ?.sort((a, b) => {
                      let aItem = items.find(
                        (i) => i.item_uuid === a.item_uuid
                      );
                      let bItem = items.find(
                        (i) => i.item_uuid === b.item_uuid
                      );
                      let aItemCompany = companies.find(
                        (i) => i.company_uuid === aItem.company_uuid
                      );
                      let bItemCompany = companies.find(
                        (i) => i.company_uuid === bItem.company_uuid
                      );
                      let aItemCategory = itemCategories.find(
                        (i) => i.category_uuid === aItem.category_uuid
                      );
                      let bItemCategory = itemCategories.find(
                        (i) => i.category_uuid === bItem.category_uuid
                      );
                      return (
                        aItemCompany.company_title?.localeCompare(
                          bItemCompany.company_title
                        ) ||
                        aItemCategory.category_title?.localeCompare(
                          bItemCategory.category_title
                        ) ||
                        aItem.item_title?.localeCompare(bItem.item_title)
                      );
                    })
                    ?.map((item, i) => (
                      <tr
                        key={item.item_uuid}
                        style={{
                          height: "30px",
                          backgroundColor:
                            +item.status === 1
                              ? "green"
                              : +item.status === 2
                              ? "yellow"
                              : +item.status === 3
                              ? "red"
                              : "#fff",
                          color:
                            +item.status === 1 || +item.status === 3
                              ? "#fff"
                              : "#000",
                        }}
                      >
                        {selectedOrder ? (
                          <td
                            style={{
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              padding: "10px",
                            }}
                            onClick={() =>
                              setSelectedOrder((prev) => ({
                                ...prev,
                                item_details: prev.item_details.map((a) =>
                                  a.item_uuid === item.item_uuid
                                    ? { ...a, status: 1 }
                                    : a
                                ),
                              }))
                            }
                          >
                            {item.item_uuid === orderSpeech ? (
                              <AiFillPlayCircle
                                style={{ fontSize: "25px", cursor: "pointer" }}
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
                          {
                            items.find((a) => a.item_uuid === item.item_uuid)
                              ?.mrp
                          }
                        </td>
                        <td
                          onClick={() =>
                            setPopupForm(
                              items.find((a) => a.item_uuid === item.item_uuid)
                            )
                          }
                        >
                          {item.b + ":" + item.p}
                        </td>
                        <td className="flex">
                          <button
                            className="item-sales-search"
                            style={{ width: "max-content" }}
                            onClick={() =>
                              setSelectedOrder((prev) => ({
                                ...prev,
                                item_details: prev.item_details.map((a) =>
                                  a.item_uuid === item.item_uuid
                                    ? { ...a, status: 2 }
                                    : a
                                ),
                              }))
                            }
                          >
                            Hold
                          </button>
                          <button
                            className="item-sales-search"
                            style={{ width: "max-content" }}
                            onClick={() =>
                              setSelectedOrder((prev) => ({
                                ...prev,
                                item_details: prev.item_details.map((a) =>
                                  a.item_uuid === item.item_uuid
                                    ? { ...a, status: 3 }
                                    : a
                                ),
                              }))
                            }
                          >
                            Cancel
                          </button>
                        </td>
                      </tr>
                    ))
                : orders
                    ?.sort((a, b) => a.created_at - b.created_at)
                    ?.map((item, i) => (
                      <tr
                        key={Math.random()}
                        style={{ height: "30px" }}
                        onClick={() => setSelectedOrder(item)}
                      >
                        <td>{i + 1}</td>
                        <td colSpan={2}>{item.counter_title}</td>
                        <td colSpan={2}>
                          {
                            item?.item_details?.filter((a) => +a.status === 1)
                              ?.length
                          }
                          /{item?.item_details?.length || 0}
                        </td>
                      </tr>
                    ))}
            </tbody>
          </table>
        </div>
      </div>
      {popupForm ? (
        <NewUserForm
          onSave={() => setPopupForm(false)}
          setOrder={setSelectedOrder}
          popupInfo={popupForm}
          order={selectedOrder}
          setUpdateBilling={setUpdateBilling}
        />
      ) : (
        ""
      )}
    </>
  );
};

export default ProcessingOrders;
function NewUserForm({ onSave, popupInfo, setOrder, order, setUpdateBilling }) {
  const [data, setdata] = useState({});
  useEffect(() => {
    let data = order?.item_details?.find(
      (a) => a.item_uuid === popupInfo.item_uuid
    );
    setdata({
      b: data?.b || 0,
      p: data?.p || 0,
    });
  }, []);
  const submitHandler = async (e) => {
    e.preventDefault();
    setOrder((prev) => ({
      ...prev,
      item_details: prev.item_details.filter(
        (a) => a.item_uuid === popupInfo.item_uuid
      )?.length
        ? prev?.item_details?.map((a) => {
            console.log("00000000", a);
            if (a.item_uuid === popupInfo.item_uuid)
              return {
                ...a,
                b: +data.b + parseInt(+data.p / (+popupInfo.conversion||1)),
                p: +data.p % (+popupInfo.conversion||1),
              };
            else return a;
          })
        : prev?.item_details?.length
        ? [
            ...prev.item_details,
            {
              ...popupInfo,
              b: +data.b + parseInt(+data.p / (+popupInfo.conversion||1)),
              p: +data.p % (+popupInfo.conversion||1),
            },
          ]
        : [
            {
              ...popupInfo,
              b: +data.b + parseInt(+data.p / (+popupInfo.conversion||1)),
              p: +data.p % (+popupInfo.conversion||1),
            },
          ],
    }));
    setUpdateBilling(true);
    onSave();
  };
console.log(popupInfo)
  return (
    <div className="overlay">
      <div
        className="modal"
        style={{ height: "fit-content", width: "max-content" }}
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
            <form className="form" onSubmit={submitHandler}>
              <div className="formGroup">
                <div
                  className="row"
                  style={{ flexDirection: "row", alignItems: "flex-start" }}
                >
                  <label
                    className="selectLabel flex"
                    style={{ width: "100px" }}
                  >
                    Box
                    <input
                      type="text"
                      name="route_title"
                      className="numberInput"
                      value={data?.b}
                      style={{ width: "100px" }}
                      onChange={(e) =>
                        setdata({
                          ...data,
                          b: e.target.value,
                        })
                      }
                      maxLength={42}
                    />
                    {popupInfo.conversion || 0}
                  </label>
                  <label
                    className="selectLabel flex"
                    style={{ width: "100px" }}
                  >
                    Pcs
                    <input
                      type="text"
                      name="route_title"
                      className="numberInput"
                      value={data?.p}
                      style={{ width: "100px" }}
                      onChange={(e) =>
                        setdata({
                          ...data,
                          p: e.target.value,
                        })
                      }
                      maxLength={42}
                    />
                  </label>
                </div>
              </div>

              <button type="submit" className="submit">
                Save changes
              </button>
            </form>
          </div>
          <button onClick={onSave} className="closeButton">
            x
          </button>
        </div>
      </div>
    </div>
  );
}
