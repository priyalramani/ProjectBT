import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { IoArrowBackOutline } from "react-icons/io5";
import { AiOutlineReload } from "react-icons/ai";

import axios from "axios";

import { openDB } from "idb";
import DiliveryReplaceMent from "../components/DiliveryReplaceMent";
const OutstangingsCollection = () => {
  const Navigate = useNavigate();

  const [deliveryPopup, setDeliveryPopup] = useState(false);
  const [items, setItems] = useState([]);
  const [filterTitle, setFilterTitle] = useState("");
  const [order, setOrder] = useState();
  const [itemsData, setItemsData] = useState([]);

  const [warehouse, setWarehouse] = useState([]);

  const [paymentModes, setPaymentModes] = useState([]);
  const [counters, setCounters] = useState([]);

  const getIndexedDbData = async () => {
    const db = await openDB("BT", +localStorage.getItem("IDBVersion") || 1);
    let tx = await db.transaction("items", "readwrite").objectStore("items");
    let item = await tx.getAll();
    setItems(item);
    let store = await db
      .transaction("counter", "readwrite")
      .objectStore("counter");
    let countersData = await store.getAll();
    setCounters(countersData);
    store = await db
      .transaction("payment_modes", "readwrite")
      .objectStore("payment_modes");
    let PaymentData = await store.getAll();
    setPaymentModes(PaymentData);
    db.close();
  };

  const GetWarehouseList = async () => {
    const response = await axios({
      method: "get",
      url: `"/warehouse/GetWarehouseList"`,

      headers: {
        "Content-Type": "application/json",
      },
    });
    if (response.data.success) setWarehouse(response.data.result);
  };
  const GetOrder = async (order_uuid) => {
    const response = await axios({
      method: "get",
      url: `/orders/GetOrder/${order_uuid}`,

      headers: {
        "Content-Type": "application/json",
      },
    });
    if (response.data.success) setOrder(response.data.result);
  };
  const getItemsData = async () => {
    const response = await axios({
      method: "get",
      url: "/Outstanding/getOutstanding",

      headers: {
        "Content-Type": "application/json",
      },
    });
    console.log("users", response);
    if (response.data.success) setItemsData(response.data.result);
    else setItemsData([]);
  };
  console.log(warehouse);
  const filterItems = useMemo(
    () =>
      itemsData.map((a) => {
        let itemsDetails = a.item_details;
        let qty =
          itemsDetails?.length > 1
            ? itemsDetails.reduce((c, d) => ({
                b: +c.b + +d.b,
                p: +c.p + +d.p,
              }))
            : itemsDetails?.length
            ? itemsDetails[0]
            : { b: 0, p: 0 };
        return {
          ...a,
          type: a.type === "ST" ? "Stock Transfer" : "Adjustment",
          qty,

          from_warehouse_title:
            +a.from_warehouse === 0
              ? "None"
              : warehouse.find((b) => b.warehouse_uuid === a.from_warehouse)
                  ?.warehouse_title || "-",
          to_warehouse_title:
            +a.to_warehouse === 0
              ? "None"
              : warehouse.find((b) => b.warehouse_uuid === a.to_warehouse)
                  ?.warehouse_title || "-",
        };
      }),
    [itemsData, warehouse]
  );

  useEffect(() => {
    getIndexedDbData();
    getItemsData();
    GetWarehouseList();
  }, []);
  const outstandingList = useMemo(
    () =>
      itemsData

        ?.map((a) => ({
          ...a,

          counter_title:
            counters.find((b) => b.counter_uuid === a.counter_uuid)
              ?.counter_title || "-",
        }))
        ?.filter(
          (a) =>
            !filterTitle ||
            a.counter_title
              .toLocaleLowerCase()
              .includes(filterTitle.toLocaleLowerCase()) ||
            a.invoice_number
              .toString()
              .toLocaleLowerCase()
              .includes(filterTitle.toLocaleLowerCase())
        ) || [],
    [counters, filterTitle, itemsData]
  );
  return (
    <>
      <div className="servicePage">
        <nav className="user_nav nav_styling" style={{ top: "0" }}>
          <div
            className="user_menubar flex"
            style={{
              width: "100%",
              justifyContent: "space-between",
              paddingRight: "5px",
            }}
          >
            <IoArrowBackOutline
              className="user_Back_icon"
              onClick={() => {
                if (order) {
                  setOrder(null);
                } else {
                  Navigate("/users");
                }
              }}
            />

            <h1 style={{ width: "80%", textAlign: "left", marginLeft: "40px" }}>
              Outstandings
            </h1>

            <AiOutlineReload
              className="user_Back_icon"
              onClick={() => {
                // getTripData();
              }}
            />
          </div>
        </nav>

        <div
          className="table-container-user item-sales-container"
          style={{
            width: "100vw",
            overflow: "scroll",
            left: "0",
            top: "0",
            display: "flex",
            minHeight: "85vh",
            flexDirection: "column",
          }}
        >
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
                type="text"
                onChange={(e) => setFilterTitle(e.target.value)}
                value={filterTitle}
                placeholder="Search ..."
                className="searchInput"
              />
            </div>
          </div>
          <table
            className="user-table"
            style={{
              width: "max-content",
              height: "fit-content",
            }}
          >
            <thead>
              {order ? (
                <tr>
                  <th>Sr.</th>
                  <th colSpan={2}>
                    <div className="t-head-element">Item Name</div>
                  </th>
                  <th>
                    <div className="t-head-element">MRP</div>
                  </th>

                  <th>Quantity</th>
                </tr>
              ) : (
                <tr>
                  <th>S.N</th>

                  <th>
                    <div className="t-head-element">Amount</div>
                  </th>
                  <th>
                    <div className="t-head-element">Counter</div>
                  </th>
                  <th>
                    <div className="t-head-element">Invoice</div>
                  </th>
                  <th>
                    <div className="t-head-element"></div>
                  </th>
                </tr>
              )}
            </thead>
            <tbody className="tbody">
              {order
                ? order?.item_details?.map((item, i) => (
                    <tr
                      key={item.item_uuid}
                      style={{
                        height: "30px",
                        backgroundColor: "#fff",
                        color: "#000",
                      }}
                    >
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

                      <td>
                        {item.b + ":" + ((+item.p || 0) + (+item.free || 0))}
                      </td>
                    </tr>
                  ))
                : outstandingList
                    ?.sort((a, b) => a.time - b.time)
                    ?.map((item, i) => (
                      <tr
                        onClick={(e) => {
                          e.stopPropagation();
                          setDeliveryPopup(item);
                        }}
                        key={Math.random()}
                        style={{
                          height: "30px",
                          backgroundColor: "#fff",
                        }}
                      >
                        <td>{i + 1}</td>
                        <td>{item.amount}</td>

                        <td>{item.counter_title || "-"}</td>

                        <td>{item.invoice_number || ""}</td>
                        <td>
                          {" "}
                          <button
                            className="item-sales-search"
                            onClick={
                              item.order_uuid !== "Menual"
                                ? (e) => {
                                    e.stopPropagation();
                                    GetOrder(item.order_uuid);
                                  }
                                : (e) => {}
                            }
                          >
                            Order
                          </button>
                        </td>
                      </tr>
                    ))}
              <tr>
                <td style={{ height: "80px" }}></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {deliveryPopup ? (
        <DiliveryPopup
          onSave={() => {
            setDeliveryPopup(false);
            getItemsData();
          }}
          PaymentModes={paymentModes}
          // postOrderData={() => onSubmit({ stage: 5 })}
          // setSelectedOrder={setOrderData}
          order={deliveryPopup}
          counters={counters}
          // items={itemsData}
          // updateBilling={callBilling}
        />
      ) : (
        ""
      )}
    </>
  );
};

function DiliveryPopup({ onSave, PaymentModes, order, updateBilling }) {
  const [modes, setModes] = useState([]);
  const [error, setError] = useState("");
  const [popup, setPopup] = useState(false);
  const [waiting, setWaiting] = useState(false);

  // const [coinPopup, setCoinPopup] = useState(false);
  const [data, setData] = useState({});

  useEffect(() => {
    if (PaymentModes?.length)
      setModes(
        PaymentModes?.map((a) => ({
          ...a,
          amt: "",
          coin: "",
          status:
            a.mode_uuid === "c67b5794-d2b6-11ec-9d64-0242ac120002" ||
            a.mode_uuid === "c67b5988-d2b6-11ec-9d64-0242ac120002"
              ? "0"
              : 1,
        }))
      );
  }, [PaymentModes]);

  const submitHandler = async () => {
    setWaiting(true);

    setError("");
    let modeTotal = modes?.map((a) => +a.amt || 0)?.reduce((a, b) => a + b);
    let amount = +order.amount - modeTotal;
    if (amount < 0) {
      setError("Amount should not be greater than outstanding");
      setWaiting(false);
      return "";
    }
    let response;
    if (modeTotal) {
      response = await axios({
        method: "put",
        url: "/receipts/putReceipt",
        data: {
          modes,
          order_uuid: order.order_uuid,
          counter_uuid: order.counter_uuid,
        },
        headers: {
          "Content-Type": "application/json",
        },
      });
    }
    if (amount) {
      response = await axios({
        method: "put",
        url: "/Outstanding/putOutstanding",
        data: {
          order_uuid: order.order_uuid,
          counter_uuid: order.counter_uuid,
          amount,
        },
        headers: {
          "Content-Type": "application/json",
        },
      });
    }
    if (response.data.success) {
      onSave();
    }

    setWaiting(false);
  };

  return (
    <>
      <div className="overlay" style={{ zIndex: 9999999999 }}>
        <div
          className="modal"
          style={{ height: "fit-content", width: "max-content" }}
        >
          <div className="flex" style={{ justifyContent: "space-between" }}>
            <h3>Payments</h3>
            <h3>Rs. {order.amount}</h3>
          </div>
          <div
            className="content"
            style={{
              height: "fit-content",
              padding: "10px",
              width: "fit-content",
            }}
          >
            <div style={{ overflowY: "scroll" }}>
              <form className="form">
                <div className="formGroup">
                  {PaymentModes?.map((item) => (
                    <div
                      className="row"
                      style={{ flexDirection: "row", alignItems: "center" }}
                      key={item.mode_uuid}
                    >
                      <div style={{ width: "50px" }}>{item.mode_title}</div>
                      <label
                        className="selectLabel flex"
                        style={{ width: "80px" }}
                      >
                        <input
                          type="number"
                          name="route_title"
                          className="numberInput"
                          value={
                            modes.find((a) => a.mode_uuid === item.mode_uuid)
                              ?.amt
                          }
                          style={{ width: "80px" }}
                          onChange={(e) =>
                            setModes((prev) =>
                              prev?.map((a) =>
                                a.mode_uuid === item.mode_uuid
                                  ? {
                                      ...a,
                                      amt: e.target.value,
                                    }
                                  : a
                              )
                            )
                          }
                          maxLength={42}
                          onWheel={(e) => e.preventDefault()}
                        />
                        {/* {popupInfo.conversion || 0} */}
                      </label>
                    </div>
                  ))}

                  <div
                    className="row"
                    style={{ flexDirection: "row", alignItems: "center" }}
                  >
                    <button
                      type="button"
                      className="submit"
                      style={{ color: "#fff", backgroundColor: "#7990dd" }}
                      onClick={() => setPopup(true)}
                    >
                      Deductions
                    </button>
                  </div>
                  <i style={{ color: "red" }}>{error}</i>
                </div>

                <div
                  className="flex"
                  style={{ justifyContent: "space-between" }}
                >
                  <button
                    type="button"
                    style={{ backgroundColor: "red" }}
                    className="submit"
                    onClick={onSave}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    className="submit"
                    onClick={submitHandler}
                  >
                    Save
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
      {waiting ? (
        <div className="overlay" style={{ zIndex: "999999999999999999" }}>
          <div className="flex" style={{ width: "40px", height: "40px" }}>
            <svg viewBox="0 0 100 100">
              <path
                d="M10 50A40 40 0 0 0 90 50A40 44.8 0 0 1 10 50"
                fill="#ffffff"
                stroke="none"
              >
                <animateTransform
                  attributeName="transform"
                  type="rotate"
                  dur="1s"
                  repeatCount="indefinite"
                  keyTimes="0;1"
                  values="0 50 51;360 50 51"
                ></animateTransform>
              </path>
            </svg>
          </div>
        </div>
      ) : (
        ""
      )}
      {popup ? (
        <DiliveryReplaceMent
          onSave={() => {
            setPopup(false);
          }}
          setData={setData}
          updateBilling={(e) =>
            updateBilling({
              ...order,
              replacement: e?.actual || 0,
              shortage: e?.shortage || 0,
              adjustment: e?.adjustment || 0,
              adjustment_remarks: e?.adjustment_remarks || "",
            })
          }
          data={data}
        />
      ) : (
        ""
      )}
    </>
  );
}

export default OutstangingsCollection;
