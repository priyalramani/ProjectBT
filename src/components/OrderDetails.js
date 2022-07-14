import { useState, useEffect, useRef, useCallback } from "react";
import axios from "axios";
import Select from "react-select";
import { v4 as uuid } from "uuid";
import { Billing, jumpToNextIndex } from "../functions";
import { CheckCircle, ContentCopy } from "@mui/icons-material";
import { useReactToPrint } from "react-to-print";
import { AddCircle as AddIcon, RemoveCircle } from "@mui/icons-material";
import OrderPrint from "./OrderPrint";
import { useIdleTimer } from "react-idle-timer";
import FreeItems from "./FreeItems";
const default_status = [
  { value: 0, label: "Preparing" },
  { value: 1, label: "Ready" },
  { value: 2, label: "Hold" },
  { value: 3, label: "Canceled" },
];
export function OrderDetails({ order, onSave, orderStatus }) {
  const [counters, setCounters] = useState([]);
  const [itemsData, setItemsData] = useState([]);
  const [editOrder, setEditOrder] = useState(false);

  const [orderData, setOrderData] = useState();
  const [printData, setPrintData] = useState({ item_details: [], status: [] });
  const [holdPopup, setHoldPopup] = useState(false);
  const [autoBills, setAutoBills] = useState([]);
  const [qty_details, setQtyDetails] = useState(false);
  const [users, setUsers] = useState([]);
  const [uuids, setUuid] = useState();
  const [popupDetails, setPopupDetails] = useState();
  const [copymsg, setCopymsg] = useState();
  const [focusedInputId, setFocusedInputId] = useState(0);
  const reactInputsRef = useRef({});
  const componentRef = useRef(null);
  const [deletePopup, setDeletePopup] = useState(false);
  const [itemDetails, setItemDetails] = useState([]);
  useEffect(() => {
    if (order.order_status === "A") setEditOrder(true);
  }, []);
  const appendNewRow = () => {
    let item_uuid = uuid();
    setFocusedInputId(`REACT_SELECT_COMPONENT_ITEM_TITLE@${item_uuid}`);
    setTimeout(
      () =>
        setOrderData((prev) => ({
          ...prev,
          item_details: [
            ...prev.item_details,
            {
              uuid: item_uuid,
              b: 0,
              p: 0,
              sr: prev.item_details.length + 1,
            },
          ],
        })),
      250
    );
  };

  const shiftFocus = (id) =>
    jumpToNextIndex(id, reactInputsRef, setFocusedInputId, appendNewRow);

  const callBilling = async () => {
    if (!editOrder) return;
    let counter = counters.find((a) => order.counter_uuid === a.counter_uuid);
    let time = new Date();
    let autoBilling = await Billing({
      counter,
      items: orderData?.item_details,
      others: {
        stage: 1,
        user_uuid: "240522",
        time: time.getTime(),

        type: "NEW",
      },
    });
    setOrderData((prev) => ({
      ...prev,
      ...autoBilling,
      item_details: autoBilling.items.map((a) => ({
        ...(prev.item_details.find((b) => b.item_uuid === a.item_uuid) || {}),
        ...a,
      })),
    }));
  };
  const { getRemainingTime, getLastActiveTime } = useIdleTimer({
    timeout: 1000 * 5,
    onIdle: callBilling,
    debounce: 500,
  });
  const reactToPrintContent = useCallback(() => {
    return componentRef.current;
  }, [printData]);

  const handlePrint = useReactToPrint({
    content: reactToPrintContent,
    documentTitle: "Statement",
    removeAfterPrint: true,
  });
  const getUsers = async () => {
    const response = await axios({
      method: "get",
      url: "/users/GetUserList",

      headers: {
        "Content-Type": "application/json",
      },
    });
    // console.log("users", response);
    if (response.data.success) setUsers(response.data.result);
  };

  const getAutoBill = async () => {
    let data = [];
    const response = await axios({
      method: "get",
      url: "/autoBill/autoBillItem",

      headers: {
        "Content-Type": "application/json",
      },
    });
    if (response.data.success) data = response;
    const response1 = await axios({
      method: "get",
      url: "/autoBill/autoBillQty",

      headers: {
        "Content-Type": "application/json",
      },
    });
    if (response1.data.success)
      data = data ? response1.data.result : [...data, ...response1.data.result];
    setAutoBills(data);
    console.log(data);
  };

  useEffect(() => {
    setOrderData({
      ...order,
      item_details: order.item_details.map((a, i) => ({
        ...itemsData.find((b) => b.item_uuid === a.item_uuid),
        ...a,
        uuid: uuid(),
        default: true,
        sr: i + 1,
      })),
    });
  }, [itemsData]);

  useEffect(() => {
    setPrintData({
      ...printData,
      ...orderData,
      item_details:
        orderData?.item_details
          ?.filter((a) => +a.status !== 3)
          ?.map((a, i) => ({
            ...a,
            sr: i + 1,
          })) || [],
    });
  }, [orderData]);
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
    getAutoBill();
    getUsers();
  }, []);

  const onSubmit = async () => {
    let counter = counters.find(
      (a) => orderData?.counter_uuid === a.counter_uuid
    );
    let data = {
      ...orderData,
      order_status: orderData?.item_details.filter(
        (a) => a.price_approval === "N"
      ).length
        ? "A"
        : "R",
      item_details: orderData?.item_details.filter((a) => a.item_uuid) || [],
    };

    let autoBilling = await Billing({
      counter,
      items: data.item_details,
      others: {},
    });
    data = {
      ...data,
      ...autoBilling,
      item_details: autoBilling.items,
    };
    data = {
      ...order,
      ...data,

      item_details: data.item_details.map((a) => ({
        ...a,
        gst_percentage: a.item_gst,
        status: a.status || 0,
        price: a?.price || a.item_price || 0,
      })),

      orderStatus,
    };

    const response = await axios({
      method: "put",
      url: "/orders/putOrder",
      data,
      headers: {
        "Content-Type": "application/json",
      },
    });
    if (response.data.success) {
      setOrderData((prev) => ({
        ...prev,
        order_grandtotal: data.order_grandtotal,
      }));
      setEditOrder(false);
    }
  };

  useEffect(() => {
    if (!editOrder) return;
    reactInputsRef.current?.[orderData?.item_details?.[0]?.uuid]?.focus();
  }, [editOrder]);

  let listItemIndexCount = 0;
  return (
    <>
      <div className="overlay">
        <div
          className="modal"
          style={{
            height: "fit-content",
            width: "90vw",
            padding: "50px",
            zIndex: "999999999",
            border: "2px solid #000",
          }}
        >
          <div className="inventory">
            <div
              className="accountGroup"
              id="voucherForm"
              action=""
              style={{
                height: "400px",
                maxHeight: "500px",
                overflow: "scroll",
              }}
            >
              <div className="inventory_header">
                <h2>Order Details</h2>
              </div>

              <div className="topInputs">
                <div
                  className="inputGroup flex"
                  style={{
                    width: "100%",
                    flexDirection: "row",
                    justifyContent: "space-between",
                  }}
                >
                  <h2>
                    {counters.find(
                      (a) => a.counter_uuid === orderData?.counter_uuid
                    )?.counter_title || ""}
                  </h2>

                  <button
                    style={{ width: "fit-Content", backgroundColor: "red" }}
                    className="item-sales-search"
                    onClick={() => setDeletePopup((prev) => true)}
                  >
                    Cancel Order
                  </button>
                  <button
                    style={{ width: "fit-Content", backgroundColor: "black" }}
                    className="item-sales-search"
                    onClick={() => {
                      handlePrint();
                    }}
                  >
                    Print
                  </button>
                  {editOrder ? (
                    <button
                      className="item-sales-search"
                      style={{
                        width: "max-content",
                      }}
                      onClick={() => setHoldPopup("Summary")}
                    >
                      Free
                    </button>
                  ) : (
                    ""
                  )}
                  <button
                    style={{ width: "fit-Content" }}
                    className="item-sales-search"
                    onClick={(e) => {
                      reactInputsRef.current = {};
                      e.target.blur();
                      setEditOrder((prev) => !prev);
                    }}
                  >
                    Edit
                  </button>
                </div>
              </div>

              <div
                className="items_table"
                style={{ flex: "1", paddingLeft: "10px" }}
              >
                <table>
                  <thead
                    className="bb b--green"
                    style={{ position: "sticky", top: 0, zIndex: "100" }}
                  >
                    <>
                      <tr>
                        <th>Grand Total</th>
                        <th>{orderData?.order_grandtotal || 0}</th>
                        <th>Payment Total</th>
                        <th>{orderData?.payment_total || 0}</th>
                        <th style={{ width: "12%" }}>UUID</th>
                        <th
                          onClick={() => {
                            setCopymsg(true);
                            navigator.clipboard.writeText(
                              orderData?.order_uuid
                            );
                            setTimeout(() => setCopymsg(false), 1000);
                          }}
                          style={{
                            cursor: "pointer",
                            position: "relative",
                            width: "12%",
                          }}
                          onMouseOver={() => setUuid(true)}
                          onMouseLeave={() => setUuid(false)}
                        >
                          {orderData?.order_uuid?.substring(0, 7) + "..."}
                          {copymsg && (
                            <div
                              style={{
                                position: "absolute",
                                top: "100%",
                              }}
                            >
                              <div id="talkbubble">COPIED!</div>
                            </div>
                          )}
                          {"   "}
                          <ContentCopy
                            style={
                              uuids
                                ? {
                                    fontSize: "12px",
                                    transform: "scale(1.5)",
                                  }
                                : { fontSize: "12px" }
                            }
                            onClick={() => {
                              setCopymsg(true);
                              navigator.clipboard.writeText(
                                orderData?.order_uuid
                              );
                              setTimeout(() => setCopymsg(false), 1000);
                            }}
                          />
                          {uuids && (
                            <div
                              style={{
                                position: "absolute",
                                top: "100%",
                              }}
                            >
                              <div id="talkbubble">{orderData?.order_uuid}</div>
                            </div>
                          )}
                        </th>
                      </tr>
                      <tr>
                        <th colSpan={2} style={{ textAlign: "center" }}>
                          <button
                            style={{ width: "fit-Content" }}
                            className="item-sales-search"
                            onClick={() =>
                              setPopupDetails({
                                type: "Status",
                                data: orderData?.status,
                              })
                            }
                          >
                            Status
                          </button>
                        </th>
                        <th colSpan={2} style={{ textAlign: "center" }}>
                          <button
                            style={{ width: "fit-Content" }}
                            className="item-sales-search"
                            onClick={() =>
                              setPopupDetails({
                                type: "Delivery Return",
                                data: orderData?.delivery_return,
                              })
                            }
                          >
                            Delivery Return
                          </button>
                        </th>
                        <th colSpan={2} style={{ textAlign: "center" }}>
                          <button
                            style={{ width: "fit-Content" }}
                            className="item-sales-search"
                            onClick={() =>
                              setPopupDetails({
                                type: "Auto Added",
                                data: orderData?.auto_Added,
                              })
                            }
                          >
                            Auto Added
                          </button>
                        </th>
                      </tr>
                    </>
                  </thead>
                </table>

                <table className="f6 w-100 center" cellSpacing="0">
                  <thead className="lh-copy" style={{ position: "static" }}>
                    <tr className="white">
                      <th className="pa2 tl bb b--black-20 w-30">Sr.</th>
                      <th className="pa2 tl bb b--black-20 w-30">Item Name</th>
                      <th className="pa2 tl bb b--black-20 w-30">MRP</th>
                      {editOrder ? (
                        <th className="pa2 tl bb b--black-20 w-30">Status</th>
                      ) : (
                        ""
                      )}
                      <th className="pa2 tc bb b--black-20">Quantity(b)</th>
                      <th className="pa2 tc bb b--black-20">Quantity(p)</th>
                      <th className="pa2 tc bb b--black-20 ">Price(p)</th>
                      <th className="pa2 tc bb b--black-20 ">Price(b)</th>
                      {editOrder ? (
                        <>
                          <th className="pa2 tc bb b--black-20 "></th>
                          <th className="pa2 tc bb b--black-20 ">Old Price</th>
                        </>
                      ) : (
                        ""
                      )}
                    </tr>
                  </thead>
                  <tbody className="lh-copy">
                    {orderData?.item_details?.map((item, i) => {
                      const item_title_component_id = `REACT_SELECT_COMPONENT_ITEM_TITLE@${item.uuid}`;
                      const item_status_component_id = `REACT_SELECT_COMPONENT_ITEM_STATUS@${item.uuid}`;

                      return (
                        <tr
                          key={i}
                          style={{
                            height: "50px",
                            backgroundColor:
                              item.price_approval === "N"
                                ? "#00edff"
                                : +item.status === 1
                                ? "green"
                                : +item.status === 2
                                ? "yellow"
                                : +item.status === 3
                                ? "red"
                                : "#fff",
                            color:
                              item.price_approval === "N"
                                ? "#000"
                                : +item.status === 1 || +item.status === 3
                                ? "#fff"
                                : "#000",
                            borderBottom: "2px solid #fff",
                          }}
                        >
                          <td
                            className="ph2 pv1 tl bb b--black-20 bg-white"
                            style={{ textAlign: "center", width: "3ch" }}
                          >
                            {item.sr}
                          </td>
                          <td className="ph2 pv1 tl bb b--black-20 bg-white">
                            <div
                              className="inputGroup"
                              index={!item.default ? listItemIndexCount++ : ""}
                              id={!item.default ? item_title_component_id : ""}
                            >
                              {editOrder && !item.default ? (
                                <Select
                                  ref={(ref) =>
                                    (reactInputsRef.current[
                                      item_title_component_id
                                    ] = ref)
                                  }
                                  id={"1_item_uuid" + item.uuid}
                                  options={itemsData
                                    .filter(
                                      (a) =>
                                        !order.item_details.filter(
                                          (b) => a.item_uuid === b.item_uuid
                                        ).length && a.status !== 0
                                    )
                                    .sort((a, b) =>
                                      a.item_title.localeCompare(b.item_title)
                                    )
                                    .map((a, j) => ({
                                      value: a.item_uuid,
                                      label: a.item_title + "______" + a.mrp,
                                      key: a.item_uuid,
                                    }))}
                                  onChange={(e) => {
                                    setTimeout(
                                      () => setQtyDetails((prev) => !prev),
                                      2000
                                    );
                                    setOrderData((prev) => ({
                                      ...prev,
                                      item_details: prev.item_details.map((a) =>
                                        a.uuid === item.uuid
                                          ? {
                                              ...a,
                                              ...itemsData.find(
                                                (b) => b.item_uuid === e.value
                                              ),
                                              price: itemsData.find(
                                                (b) => b.item_uuid === e.value
                                              )?.item_price,
                                            }
                                          : a
                                      ),
                                    }));
                                    shiftFocus(item_title_component_id);
                                  }}
                                  value={{
                                    value: item.item_uuid || "",
                                    label: item.item_title
                                      ? item.item_title + "______" + item.mrp
                                      : "",
                                    key: item.item_uuid || item.uuid,
                                  }}
                                  openMenuOnFocus={true}
                                  autoFocus={
                                    focusedInputId ===
                                      item_title_component_id ||
                                    (i === 0 && focusedInputId === 0)
                                  }
                                  menuPosition="fixed"
                                  menuPlacement="auto"
                                  placeholder="Item"
                                />
                              ) : (
                                itemsData.find(
                                  (a) => a.item_uuid === item.item_uuid
                                )?.item_title || ""
                              )}
                            </div>
                          </td>
                          <td
                            className="ph2 pv1 tc bb b--black-20 bg-white"
                            style={{ textAlign: "center" }}
                          >
                            {item.mrp || ""}
                          </td>
                          {editOrder ? (
                            <td
                              className="ph2 pv1 tc bb b--black-20 bg-white"
                              style={{ textAlign: "center", color: "#000" }}
                              index={listItemIndexCount++}
                              id={item_status_component_id}
                            >
                              <Select
                                ref={(ref) =>
                                  (reactInputsRef.current[
                                    item_status_component_id
                                  ] = ref)
                                }
                                id={"2_item_uuid" + item.uuid}
                                options={default_status}
                                onChange={(e) => {
                                  setOrderData((prev) => ({
                                    ...prev,
                                    item_details: prev.item_details.map((a) =>
                                      a.uuid === item.uuid
                                        ? { ...a, status: e.value }
                                        : a
                                    ),
                                  }));
                                  shiftFocus(item_status_component_id);
                                }}
                                value={
                                  item.status
                                    ? default_status.find(
                                        (a) => +a.value === +item.status
                                      )
                                    : ""
                                }
                                autoFocus={
                                  focusedInputId === item_status_component_id ||
                                  (i === 0 &&
                                    item.default &&
                                    focusedInputId === 0)
                                }
                                openMenuOnFocus={true}
                                menuPosition="fixed"
                                menuPlacement="auto"
                                placeholder="Status"
                              />
                            </td>
                          ) : (
                            ""
                          )}
                          <td
                            className="ph2 pv1 tc bb b--black-20 bg-white"
                            style={{ textAlign: "center" }}
                          >
                            {editOrder ? (
                              <input
                                id={"q" + item.uuid}
                                type="number"
                                className="numberInput"
                                index={listItemIndexCount++}
                                style={{ width: "10ch" }}
                                value={item.b || 0}
                                onChange={(e) => {
                                  setOrderData((prev) => {
                                    setTimeout(
                                      () => setQtyDetails((prev) => !prev),
                                      2000
                                    );
                                    return {
                                      ...prev,
                                      item_details: prev.item_details.map((a) =>
                                        a.uuid === item.uuid
                                          ? { ...a, b: e.target.value }
                                          : a
                                      ),
                                    };
                                  });
                                }}
                                onFocus={(e) => {
                                  e.target.onwheel = () => false;
                                  e.target.select();
                                }}
                                onKeyDown={(e) =>
                                  e.key === "Enter"
                                    ? shiftFocus(e.target.id)
                                    : ""
                                }
                                disabled={!item.item_uuid}
                                onWheel={(e) => e.preventDefault()}
                              />
                            ) : (
                              item.b || 0
                            )}
                          </td>
                          <td
                            className="ph2 pv1 tc bb b--black-20 bg-white"
                            style={{ textAlign: "center" }}
                          >
                            {editOrder ? (
                              <input
                                id={"p" + item.uuid}
                                style={{ width: "10ch" }}
                                type="number"
                                className="numberInput"
                                onWheel={(e) => e.preventDefault()}
                                index={listItemIndexCount++}
                                value={item.p || 0}
                                onChange={(e) => {
                                  setOrderData((prev) => {
                                    setTimeout(
                                      () => setQtyDetails((prev) => !prev),
                                      2000
                                    );
                                    return {
                                      ...prev,
                                      item_details: prev.item_details.map((a) =>
                                        a.uuid === item.uuid
                                          ? { ...a, p: e.target.value }
                                          : a
                                      ),
                                    };
                                  });
                                }}
                                onFocus={(e) => {
                                  e.target.onwheel = () => false;
                                  e.target.select();
                                }}
                                onKeyDown={(e) =>
                                  e.key === "Enter"
                                    ? shiftFocus(e.target.id)
                                    : ""
                                }
                                disabled={!item.item_uuid}
                              />
                            ) : (
                              item.p || 0
                            )}
                          </td>
                          <td
                            className="ph2 pv1 tc bb b--black-20 bg-white"
                            style={{ textAlign: "center" }}
                          >
                            {editOrder ? (
                              <input
                                type="number"
                                style={{ width: "15ch" }}
                                className="numberInput"
                                onWheel={(e) => e.preventDefault()}
                                index={listItemIndexCount++}
                                value={item.price || 0}
                                onChange={(e) => {
                                  setOrderData((prev) => {
                                    setTimeout(
                                      () => setQtyDetails((prev) => !prev),
                                      2000
                                    );
                                    return {
                                      ...prev,
                                      item_details: prev.item_details.map((a) =>
                                        a.uuid === item.uuid
                                          ? { ...a, price: e.target.value }
                                          : a
                                      ),
                                    };
                                  });
                                }}
                                onFocus={(e) => {
                                  e.target.onwheel = () => false;
                                  e.target.select();
                                }}
                                onKeyDown={(e) =>
                                  e.key === "Enter"
                                    ? shiftFocus(e.target.id)
                                    : ""
                                }
                                disabled={!item.item_uuid}
                              />
                            ) : (
                              "Rs:" + item?.price
                            )}
                          </td>
                          <td
                            className="ph2 pv1 tc bb b--black-20 bg-white"
                            style={{ textAlign: "center" }}
                          >
                            {editOrder ? (
                              <input
                                type="number"
                                style={{ width: "15ch" }}
                                className="numberInput"
                                onWheel={(e) => e.preventDefault()}
                                index={listItemIndexCount++}
                                value={(
                                  item.price * item.conversion || 0
                                ).toFixed(0)}
                                onChange={(e) => {
                                  setOrderData((prev) => {
                                    setTimeout(
                                      () => setQtyDetails((prev) => !prev),
                                      2000
                                    );
                                    return {
                                      ...prev,
                                      item_details: prev.item_details.map((a) =>
                                        a.uuid === item.uuid
                                          ? {
                                              ...a,
                                              price:
                                                e.target.value /
                                                item.conversion,
                                            }
                                          : a
                                      ),
                                    };
                                  });
                                }}
                                onFocus={(e) => {
                                  e.target.onwheel = () => false;
                                  e.target.select();
                                }}
                                onKeyDown={(e) =>
                                  e.key === "Enter"
                                    ? shiftFocus(e.target.id)
                                    : ""
                                }
                                disabled={!item.item_uuid}
                              />
                            ) : (
                              "Rs:" + item?.price
                            )}
                          </td>
                          {editOrder ? (
                            <>
                              <td>
                                {item.price_approval === "N" ? (
                                  <span
                                    onClick={() =>
                                      setOrderData((prev) => ({
                                        ...prev,
                                        item_details: prev.item_details.map(
                                          (a) =>
                                            a.uuid === item.uuid
                                              ? { ...a, price_approval: "Y" }
                                              : a
                                        ),
                                      }))
                                    }
                                  >
                                    <CheckCircle
                                      sx={{ fontSize: 40 }}
                                      style={{
                                        cursor: "pointer",
                                        color: "blue",
                                      }}
                                    />
                                  </span>
                                ) : (
                                  ""
                                )}
                                <span
                                  onClick={() =>
                                    setOrderData((prev) => ({
                                      ...prev,
                                      item_details: prev.item_details.filter(
                                        (a) => !(a.uuid === item.uuid)
                                      ),
                                    }))
                                  }
                                >
                                  <RemoveCircle
                                    sx={{ fontSize: 40 }}
                                    style={{ cursor: "pointer", color: "red" }}
                                  />
                                </span>
                              </td>
                              <td>Rs.{item.old_price || item.item_price}</td>
                            </>
                          ) : (
                            ""
                          )}
                        </tr>
                      );
                    })}
                    {editOrder ? (
                      <tr>
                        <td
                          onClick={() =>
                            setOrderData((prev) => ({
                              ...prev,
                              item_details: [
                                ...prev.item_details,
                                { uuid: uuid(), b: 0, p: 0 },
                              ],
                            }))
                          }
                        >
                          <AddIcon
                            sx={{ fontSize: 40 }}
                            style={{ color: "#4AC959", cursor: "pointer" }}
                          />
                        </td>
                      </tr>
                    ) : (
                      ""
                    )}
                    <tr
                      style={{
                        height: "50px",

                        borderBottom: "2px solid #fff",
                      }}
                    >
                      <td className="ph2 pv1 tl bb b--black-20 bg-white">
                        <div className="inputGroup">Total</div>
                      </td>
                      <td
                        className="ph2 pv1 tc bb b--black-20 bg-white"
                        style={{ textAlign: "center" }}
                      ></td>
                      {editOrder ? (
                        <td
                          className="ph2 pv1 tc bb b--black-20 bg-white"
                          style={{ textAlign: "center" }}
                        ></td>
                      ) : (
                        ""
                      )}
                      <td
                        className="ph2 pv1 tc bb b--black-20 bg-white"
                        style={{ textAlign: "center" }}
                      >
                        {(orderData?.item_details?.length > 1
                          ? orderData?.item_details
                              .map((a) => +a.b || 0)
                              .reduce((a, b) => a + b)
                          : orderData?.item_details[0].b) || 0}
                      </td>
                      <td
                        className="ph2 pv1 tc bb b--black-20 bg-white"
                        style={{ textAlign: "center" }}
                      >
                        {(orderData?.item_details.length > 1
                          ? orderData?.item_details
                              .map((a) => +a.p || 0)
                              .reduce((a, b) => a + b)
                          : orderData?.item_details[0].p) || 0}
                      </td>
                      <td
                        className="ph2 pv1 tc bb b--black-20 bg-white"
                        style={{ textAlign: "center" }}
                      ></td>
                      {editOrder ? <td></td> : ""}
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
            <button onClick={onSave} className="closeButton">
              x
            </button>
          </div>

          <div
            className="bottomContent"
            style={{
              background: "white",
              justifyContent: "space-between",
              paddingTop: "20px",
            }}
          >
            <div style={{ width: "20%", color: "#fff" }}>-</div>
            {editOrder ? (
              <button type="button" onClick={onSubmit}>
                Save
              </button>
            ) : (
              ""
            )}
            <button
              type="button"
              onClick={() => {}}
              style={{ width: "max-content", padding: "10px 20px" }}
            >
              OrderTotal : {orderData?.order_grandtotal || 0}
            </button>
          </div>
        </div>
      </div>
      {holdPopup ? (
        <FreeItems
          onSave={() => setHoldPopup(false)}
          orders={orderData}
          holdPopup={holdPopup}
          itemsData={itemsData}
          setOrder={setOrderData}
        />
      ) : (
        ""
      )}
      {popupDetails ? (
        <CheckingValues
          onSave={() => setPopupDetails(false)}
          popupDetails={popupDetails}
          users={users}
          items={itemsData}
        />
      ) : (
        ""
      )}
      {deletePopup ? (
        <DeleteOrderPopup
          onSave={() => {
            setDeletePopup(false);
          }}
          onDeleted={() => {
            setDeletePopup(false);
            onSave();
          }}
          order={order}
          counters={counters}
          items={itemsData}
          item_details={order.item_details}
        />
      ) : (
        ""
      )}
      <div
        style={{
          position: "fixed",
          top: -100,
          left: -180,
          zIndex: "-1000",
        }}
      >
        <div
          ref={componentRef}
          id="item-container"
          style={
            {
              // marginTop: "20mm",
              // marginLeft: "20mm",
              // marginRight: "20mm",
              // margin: "45mm 40mm 30mm 60mm",
              // textAlign: "center",
              // padding: "10px"
            }
          }
        >
          <OrderPrint
            counter={counters.find(
              (a) => a.counter_uuid === printData?.counter_uuid
            )}
            order={printData}
            date={new Date(printData?.status[0]?.time)}
            user={
              users.find((a) => a.user_uuid === printData?.status[0].user_uuid)
                ?.user_title || ""
            }
            itemData={itemsData}
            item_details={
              printData?.item_details?.length > 12
                ? printData?.item_details?.slice(0, 12)
                : printData?.item_details
            }
            footer={!(printData?.item_details?.length > 12)}
          />
          {printData?.item_details?.length > 12 ? (
            <>
              <div style={{ height: "20mm" }}></div>
              <OrderPrint
                counter={counters.find(
                  (a) => a.counter_uuid === printData?.counter_uuid
                )}
                order={printData}
                date={new Date(printData?.status[0]?.time)}
                user={
                  users.find(
                    (a) => a.user_uuid === printData?.status[0]?.user_uuid
                  )?.user_title || ""
                }
                itemData={itemsData}
                item_details={
                  printData.item_details?.length > 12
                    ? printData?.item_details?.slice(12, 24)
                    : printData?.item_details?.slice(
                        12,
                        printData?.item_details?.filter(
                          (a) => !(+a.status === 3)
                        )?.length
                      )
                }
                footer={!(printData?.item_details?.length > 24)}
              />
            </>
          ) : (
            ""
          )}

          {printData?.item_details?.length > 24 ? (
            <>
              <div style={{ height: "20mm" }}></div>
              <OrderPrint
                counter={counters.find(
                  (a) => a.counter_uuid === printData?.counter_uuid
                )}
                order={printData}
                date={new Date(printData?.status[0]?.time)}
                user={
                  users.find(
                    (a) => a.user_uuid === printData?.status[0]?.user_uuid
                  )?.user_title || ""
                }
                itemData={itemsData}
                item_details={
                  printData?.item_details?.length > 24
                    ? printData?.item_details?.slice(24, 36)
                    : printData?.item_details?.slice(
                        24,
                        printData?.item_details?.length
                      )
                }
                footer={!(printData?.item_details?.length > 36)}
              />
            </>
          ) : (
            ""
          )}

          {orderData?.item_details?.length > 36 ? (
            <>
              <div style={{ height: "20mm" }}></div>
              <OrderPrint
                counter={counters.find(
                  (a) => a.counter_uuid === printData?.counter_uuid
                )}
                order={printData}
                date={new Date(printData?.status[0]?.time)}
                user={
                  users.find(
                    (a) => a.user_uuid === printData?.status[0]?.user_uuid
                  )?.user_title || ""
                }
                itemData={itemsData}
                item_details={printData?.item_details?.slice(
                  36,
                  printData?.item_details.length
                )}
                footer={true}
              />
            </>
          ) : (
            ""
          )}
        </div>
      </div>
    </>
  );
}

const DeleteOrderPopup = ({ onSave, order, counters, items, onDeleted }) => {
  const [disable, setDisabled] = useState(true);
  useEffect(() => {
    setTimeout(() => setDisabled(false), 5000);
  }, []);
  const PutOrder = async () => {
    let time = new Date();
    let stage = order?.status?.length
      ? order?.status
          ?.map((a) => +a.stage || 0)
          ?.reduce((a, b) => Math.max(a, b))
      : order?.status[0]?.stage || 0;
    let data = {
      ...order,
      status: [
        ...order.status,
        {
          stage: 5,
          user_uuid: localStorage.getItem("user_uuid"),
          time: time.getTime(),
        },
      ],
      processing_canceled:
        +stage === 2
          ? order.processing_canceled.length
            ? [...order.processing_canceled, ...order.item_details]
            : order.item_details
          : order.processing_canceled || [],
      delivery_return:
        +stage === 4
          ? order.delivery_return.length
            ? [...order.delivery_return, ...order.item_details]
            : order.item_details
          : order.delivery_return || [],
      item_details: order.item_details.map((a) => ({ ...a, b: 0, p: 0 })),
    };

    let billingData = await Billing({
      replacement: data.replacement,
      counter: counters.find((a) => a.counter_uuid === data.counter_uuid),

      items: data.item_details.map((a) => {
        let itemData = items.find((b) => a.item_uuid === b.item_uuid);
        return {
          ...itemData,
          ...a,
          price: itemData?.price || 0,
        };
      }),
    });
    data = {
      ...data,
      ...billingData,
      item_details: billingData.items,
    };
    const response = await axios({
      method: "put",
      url: "/orders/putOrders",
      data: [data],
      headers: {
        "Content-Type": "application/json",
      },
    });
    if (response.data.success) {
      onDeleted();
    }
  };
  return (
    <div className="overlay" style={{ zIndex: 9999999999 }}>
      <div
        className="modal"
        style={{
          height: "fit-content",
          width: "max-content",
          paddingTop: "50px",
        }}
      >
        <h3>Complete Order will be CANCELED</h3>

        <div className="flex">
          <button
            type="button"
            className="submit"
            onClick={() => PutOrder()}
            disabled={disable}
            style={{ opacity: disable ? "0.5" : "1" }}
          >
            Confirm
          </button>
        </div>

        <button onClick={onSave} className="closeButton">
          x
        </button>
      </div>
    </div>
  );
};
// function NewUserForm({ onSubmit, onClose }) {
//   return (
//     <div className="overlay">
//       <div
//         className="modal"
//         style={{ height: "fit-content", width: "fit-content" }}
//       >
//         <div
//           className="content"
//           style={{
//             height: "fit-content",
//             padding: "20px",
//             width: "fit-content",
//           }}
//         >
//           <div style={{ overflowY: "scroll" }}>
//             <form
//               className="form"
//               onSubmit={(e) => {
//                 e.preventDefault();
//                 onSubmit("auto_add");
//                 onClose();
//               }}
//             >
//               <div className="row">
//                 <h1> Auto Add</h1>
//               </div>

//               <div className="formGroup">
//                 <div className="row">
//                   <button type="submit" className="submit">
//                     Yes
//                   </button>
//                   <button
//                     type="button"
//                     onClick={() => {
//                       onSubmit();
//                     }}
//                     className="submit"
//                   >
//                     No
//                   </button>
//                 </div>
//               </div>
//             </form>
//           </div>
//           <button onClick={onClose} className="closeButton">
//             x
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// }
function CheckingValues({ onSave, popupDetails, users, items }) {
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
    <div className="overlay" style={{ zIndex: 999999999 }}>
      <div
        className="modal"
        style={{ height: "fit-content", width: "max-content" }}
      >
        <h1>{popupDetails.type}</h1>
        <div
          className="content"
          style={{
            height: "fit-content",
            padding: "20px",
            width: "fit-content",
          }}
        >
          <div style={{ overflowY: "scroll", width: "100%" }}>
            {popupDetails.type === "Status" ? (
              <div
                className="flex"
                style={{ flexDirection: "column", width: "100%" }}
              >
                <table
                  className="user-table"
                  style={{
                    width: "max-content",
                    height: "fit-content",
                  }}
                >
                  <thead>
                    <tr>
                      <th colSpan={2}>
                        <div className="t-head-element">Type</div>
                      </th>
                      <th colSpan={2}>
                        <div className="t-head-element">Time</div>
                      </th>
                      <th>
                        <div className="t-head-element">User</div>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="tbody">
                    {popupDetails.data?.map((item, i) => (
                      <tr
                        key={item?.item_uuid || Math.random()}
                        style={{
                          height: "30px",
                        }}
                      >
                        <td colSpan={2}>
                          {+item.stage === 1
                            ? "Order Placed By"
                            : +item.stage === 2
                            ? "Order Processed By"
                            : +item.stage === 3
                            ? "Order Checked By"
                            : +item.stage === 4
                            ? "Order Delivered By"
                            : ""}
                        </td>
                        <td colSpan={2}>
                          {new Date(+item.time).toDateString() +
                            " " +
                            formatAMPM(new Date(item.time)) || ""}
                        </td>
                        <td>
                          {item.user_uuid === "240522"
                            ? "Admin"
                            : users.find((a) => a.user_uuid === item?.user_uuid)
                                ?.user_title || ""}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : popupDetails.type === "Delivery Return" ? (
              <div
                className="flex"
                style={{ flexDirection: "column", width: "100%" }}
              >
                <table
                  className="user-table"
                  style={{
                    width: "max-content",
                    height: "fit-content",
                  }}
                >
                  <thead>
                    <tr>
                      <th colSpan={2}>
                        <div className="t-head-element">Item</div>
                      </th>
                      <th>
                        <div className="t-head-element">Quantity</div>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="tbody">
                    {popupDetails.data?.map((item, i) => (
                      <tr
                        key={item?.item_uuid || Math.random()}
                        style={{
                          height: "30px",
                        }}
                      >
                        <td colSpan={2}>
                          {items.find((a) => a.item_uuid === item.item_uuid)
                            ?.item_title || ""}
                        </td>
                        <td>
                          {item?.b || 0}:{item.p || 0}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : popupDetails.type === "Auto Added" ? (
              <div
                className="flex"
                style={{ flexDirection: "column", width: "100%" }}
              >
                <table
                  className="user-table"
                  style={{
                    width: "max-content",
                    height: "fit-content",
                  }}
                >
                  <thead>
                    <tr>
                      <th colSpan={2}>
                        <div className="t-head-element">Item</div>
                      </th>
                      <th>
                        <div className="t-head-element">Quantity</div>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="tbody">
                    {popupDetails.data?.map((item, i) => (
                      <tr
                        key={item?.item_uuid || Math.random()}
                        style={{
                          height: "30px",
                        }}
                      >
                        <td colSpan={2}>
                          {items.find((a) => a.item_uuid === item.item_uuid)
                            ?.item_title || ""}
                        </td>
                        <td>
                          {item?.b || 0}:{item.p || 0}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              ""
            )}

            <div className="flex" style={{ justifyContent: "space-between" }}>
              <button type="button" className="submit" onClick={onSave}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
