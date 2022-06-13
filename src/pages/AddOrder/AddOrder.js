/* eslint-disable react-hooks/exhaustive-deps */
import axios from "axios";
import { useEffect, useRef, useState } from "react";
import Header from "../../components/Header";
import Sidebar from "../../components/Sidebar";
import "./index.css";
import { Billing, AutoAdd } from "../../functions";
import { AddCircle as AddIcon } from "@mui/icons-material";
import { v4 as uuid } from "uuid";
import Select from "react-select";
import { useIdleTimer } from "react-idle-timer";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
const list = ["item_uuid", "q", "p"];

export default function AddOrder() {
  const [order, setOrder] = useState({
    counter_uuid: "",
    item_details: [{ uuid: uuid(), b: 0, p: 0, sr: 1 }],
  });
  const [counters, setCounters] = useState([]);
  const [counterFilter] = useState("");
  // const selectRef = useRef();
  const [itemsData, setItemsData] = useState([]);
  const [qty_details, setQtyDetails] = useState(false);
  const [popup, setPopup] = useState(false);
  const [autoBills, setAutoBills] = useState([]);
  const [id, setId] = useState("");
  const [selectedItem, setSelectedItem] = useState("");
  const [counting, setCounting] = useState(0);
  const reactInputsRef = useRef({});
  const [focusedInputId, setFocusedInputId] = useState(0);
  const [edit_prices, setEditPrices] = useState([]);
  // console.log(
  //   document.getElementById(id),
  //   id,
  //   selectedItem,
  //   order.item_details,
  //   counting
  // );
  const escFunction = (event) => {
    console.log(event.key);
    if (event.key !== "Enter") return;
    if (!order.counter_uuid) {
      document.getElementById("counter_select").focus();
      setId(list[0] + order.item_details[0]?.uuid);
      return;
    }
    console.log(document.getElementById(id));

    let index = list.indexOf(
      id.replace(
        selectedItem
          ? order.item_details.find((a) => +a.sr === +selectedItem + 1)?.uuid
          : order.item_details.find((a) => +a.sr === 1)?.uuid,
        ""
      )
    );
    console.log(index);

    if (counting === 3) {
      let id = uuid();
      setOrder((prev) => ({
        ...prev,
        item_details: [
          ...prev.item_details,
          { uuid: id, b: 0, p: 0, sr: prev.item_details.length + 1 },
        ],
      }));
      setSelectedItem((prev) => +prev + 1);
      setId(list[0] + id);
      setCounting(0);
    } else {
      setCounting((prev) => prev + 1);
      setId(
        index === 0 || index
          ? list[index + 1] +
              (selectedItem
                ? order.item_details.find((a) => +a.sr === +selectedItem + 1)
                    ?.uuid
                : order.item_details.find((a) => +a.sr === 1)?.uuid)
          : list[0] +
              (selectedItem
                ? order.item_details.find((a) => +a.sr === +selectedItem + 1)
                    ?.uuid
                : order.item_details.find((a) => +a.sr === 1)?.uuid)
      );
    }
    document.getElementById(id).focus();
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
    // escFunction({ key: "Enter" });
  }, []);

  useEffect(() => {
    setOrder((prev) => ({
      ...prev,
      item_details: prev.item_details.map((a) => ({
        ...a,
        b: +a.b + parseInt((+a.p || 0) / +a.conversion || 0),
        p: a.p ? +a.p % +a.conversion : 0,
      })),
    }));
  }, [qty_details]);

  const onSubmit = async (type) => {
    let counter = counters.find((a) => order.counter_uuid === a.counter_uuid);
    let data = {
      ...order,
      item_details: order.item_details.filter((a) => a.item_uuid),
    };
    if (type.autoAdd) {
      let autoAdd = await AutoAdd({
        counter,
        items: order.item_details,
        dbItems: order.item_details,
        autobills: autoBills,
      });
      data = { ...data, ...autoAdd, item_details: autoAdd.items };
    }
    let time = new Date();
    let autoBilling = await Billing({
      counter,
      items: data.item_details,
      others: {
        stage: 1,
        user_uuid: "240522",
        time: time.getTime(),

        type: "NEW",
      },
      add_discounts: true,
      edit_prices,
    });
    data = {
      ...data,
      ...autoBilling,
      item_details: autoBilling.items,
    };
    data = {
      ...data,
      order_uuid: uuid(),
      item_details: data.item_details.map((a) => ({
        ...a,
        unit_price: a.price,
        gst_percentage: a.item_gst,
        status: 0,
        price: a.item_price,
      })),
      status:
        type.stage === 1
          ? [
              {
                stage: 1,
                time: data.others.time,
                user_uuid: data.others.user_uuid,
              },
            ]
          : type.stage === 2
          ? [
              {
                stage: 1,
                time: data.others.time,
                user_uuid: data.others.user_uuid,
              },
              {
                stage: 2,
                time: data.others.time,
                user_uuid: data.others.user_uuid,
              },
            ]
          : type.stage === 3
          ? [
              {
                stage: 1,
                time: data.others.time,
                user_uuid: data.others.user_uuid,
              },
              {
                stage: 2,
                time: data.others.time,
                user_uuid: data.others.user_uuid,
              },
              {
                stage: 3,
                time: data.others.time,
                user_uuid: data.others.user_uuid,
              },
            ]
          : [
              {
                stage: 1,
                time: data.others.time,
                user_uuid: data.others.user_uuid,
              },
              {
                stage: 2,
                time: data.others.time,
                user_uuid: data.others.user_uuid,
              },
              {
                stage: 3,
                time: data.others.time,
                user_uuid: data.others.user_uuid,
              },
              {
                stage: 4,
                time: data.others.time,
                user_uuid: data.others.user_uuid,
              },
            ],
    };
    console.log(data);
    const response = await axios({
      method: "post",
      url: "/orders/postOrder",
      data,
      headers: {
        "Content-Type": "application/json",
      },
    });
    if (response.data.success) {
      setOrder({
        counter_uuid: "",
        item_details: [{ uuid: uuid(), b: 0, p: 0 }],
      });
    }
  };

  const callBilling = async () => {
    let counter = counters.find((a) => order.counter_uuid === a.counter_uuid);
    let time = new Date();
    let autoBilling = await Billing({
      counter,
      items: order.item_details,
      others: {
        stage: 1,
        user_uuid: "240522",
        time: time.getTime(),

        type: "NEW",
      },
      add_discounts: true,
      edit_prices
    });
    setOrder((prev) => ({
      ...prev,
      ...autoBilling,
      item_details: autoBilling.items,
    }));
  };

  const { getRemainingTime, getLastActiveTime } = useIdleTimer({
    timeout: 1000 * 5,
    onIdle: callBilling,
    debounce: 500,
  });

  const jumpToNextIndex = (id) => {
    console.log(id);
    document.querySelector(`#${id}`).blur();
    const index = document.querySelector(`#${id}`).getAttribute("index");
    console.log("this is index", index);

    const nextElem = document.querySelector(`[index="${+index + 1}"]`);

    if (nextElem) {
      if (nextElem.id.includes("selectContainer-")) {
        console.log("next select container id: ", nextElem.id);
        reactInputsRef.current[
          nextElem.id.replace("selectContainer-", "")
        ].focus();
      } else {
        console.log("next input id: ", nextElem.id);
        setFocusedInputId("");
        setTimeout(
          () => document.querySelector(`[index="${+index + 1}"]`).focus(),
          10
        );
        return;
      }
    } else {
      let nextElemId = uuid();
      setFocusedInputId(`selectContainer-${nextElemId}`);
      setTimeout(
        () =>
          setOrder((prev) => ({
            ...prev,
            item_details: [
              ...prev.item_details,
              {
                uuid: nextElemId,
                b: 0,
                p: 0,
                sr: prev.item_details.length + 1,
              },
            ],
          })),
        250
      );
    }
  };

  let listItemIndexCount = 0;

  return (
    <>
      <Sidebar />
      <div className="right-side">
        <Header />
        <div className="inventory">
          <div className="accountGroup" id="voucherForm" action="">
            <div className="inventory_header">
              <h2>Add Order </h2>
              {/* {type === 'edit' && <XIcon className='closeicon' onClick={close} />} */}
            </div>

            <div className="topInputs">
              <div className="inputGroup">
                <label htmlFor="Warehouse">Counter</label>
                <Select
                  ref={(ref) => (reactInputsRef.current["0"] = ref)}
                  options={counters
                    ?.filter(
                      (a) =>
                        !counterFilter ||
                        a.counter_title
                          .toLocaleLowerCase()
                          .includes(counterFilter.toLocaleLowerCase())
                    )
                    .map((a) => ({
                      value: a.counter_uuid,
                      label: a.counter_title,
                    }))}
                  onChange={(doc) =>
                    setOrder((prev) => ({ ...prev, counter_uuid: doc.value }))
                  }
                  value={
                    order?.counter_uuid
                      ? {
                          value: order?.counter_uuid,
                          label: counters?.find(
                            (j) => j.counter_uuid === order.counter_uuid
                          )?.counter_title,
                        }
                      : ""
                  }
                  autoFocus={!order?.counter_uuid}
                  openMenuOnFocus={true}
                  menuPosition="fixed"
                  menuPlacement="auto"
                  placeholder="Select"
                />
              </div>
            </div>

            <div className="items_table" style={{ flex: "1", height: "auto" }}>
              <table className="f6 w-100 center" cellSpacing="0">
                <thead className="lh-copy" style={{ position: "static" }}>
                  <tr className="white">
                    <th className="pa2 tl bb b--black-20 w-30">Item Name</th>
                    <th className="pa2 tc bb b--black-20">Boxes</th>
                    <th className="pa2 tc bb b--black-20">Pcs</th>
                    <th className="pa2 tc bb b--black-20 ">Price (pcs)</th>
                    <th className="pa2 tc bb b--black-20 ">Price (box)</th>
                    <th className="pa2 tc bb b--black-20 "></th>
                  </tr>
                </thead>
                {order.counter_uuid ? (
                  <tbody className="lh-copy">
                    {order?.item_details?.map((item, i) => (
                      <tr key={i}>
                        <td
                          className="ph2 pv1 tl bb b--black-20 bg-white"
                          style={{ width: "300px" }}
                        >
                          <div
                            className="inputGroup"
                            id={`selectContainer-${item.uuid}`}
                            index={listItemIndexCount++}
                            style={{ width: "300px" }}
                          >
                            <Select
                              ref={(ref) =>
                                (reactInputsRef.current[item.uuid] = ref)
                              }
                              id={"item_uuid" + item.uuid}
                              options={itemsData
                                .filter(
                                  (a) =>
                                    !order.item_details.filter(
                                      (b) => a.item_uuid === b.item_uuid
                                    ).length
                                )
                                .sort((a, b) =>
                                  a.item_title.localeCompare(b.item_title)
                                )
                                .map((a, j) => ({
                                  value: a.item_uuid,
                                  label: a.item_title + "______" + a.mrp,
                                  key: a.item_uuid,
                                }))}
                              z
                              onChange={(e) => {
                                setTimeout(
                                  () => setQtyDetails((prev) => !prev),
                                  2000
                                );
                                setOrder((prev) => ({
                                  ...prev,
                                  item_details: prev.item_details.map((a) =>
                                    a.uuid === item.uuid
                                      ? {
                                          ...a,
                                          ...itemsData.find(
                                            (b) => b.item_uuid === e.value
                                          ),
                                        }
                                      : a
                                  ),
                                }));
                                jumpToNextIndex(`selectContainer-${item.uuid}`);
                              }}
                              value={
                                itemsData
                                  .sort((a, b) =>
                                    a.item_title.localeCompare(b.item_title)
                                  )
                                  .filter((a) => a.item_uuid === item.uuid)
                                  .map((a, j) => ({
                                    value: a.item_uuid,
                                    label: a.item_title + "______" + a.mrp,
                                    key: a.item_uuid,
                                  }))[0]
                              }
                              openMenuOnFocus={true}
                              autoFocus={
                                focusedInputId ===
                                  `selectContainer-${item.uuid}` ||
                                (i === 0 && focusedInputId === 0)
                              }
                              menuPosition="fixed"
                              menuPlacement="auto"
                              placeholder="Item"
                            />
                          </div>
                        </td>
                        <td
                          className="ph2 pv1 tc bb b--black-20 bg-white"
                          style={{ textAlign: "center" }}
                        >
                          <input
                            id={"q" + item.uuid}
                            style={{ width: "100px" }}
                            type="number"
                            className="numberInput"
                            onWheel={(e) => e.preventDefault()}
                            index={listItemIndexCount++}
                            value={item.b || ""}
                            onChange={(e) => {
                              setOrder((prev) => {
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
                            onFocus={(e) => e.target.select()}
                            onKeyDown={(e) =>
                              e.key === "Enter"
                                ? jumpToNextIndex("q" + item.uuid)
                                : ""
                            }
                            disabled={!item.item_uuid}
                          />
                        </td>
                        <td
                          className="ph2 pv1 tc bb b--black-20 bg-white"
                          style={{ textAlign: "center" }}
                        >
                          <input
                            id={"p" + item.uuid}
                            style={{ width: "100px" }}
                            type="number"
                            className="numberInput"
                            onWheel={(e) => e.preventDefault()}
                            index={listItemIndexCount++}
                            value={item.p || ""}
                            onChange={(e) => {
                              setOrder((prev) => {
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
                            onFocus={(e) => e.target.select()}
                            onKeyDown={(e) =>
                              e.key === "Enter"
                                ? jumpToNextIndex("p" + item.uuid)
                                : ""
                            }
                            disabled={!item.item_uuid}
                          />
                        </td>
                        <td
                          className="ph2 pv1 tc bb b--black-20 bg-white"
                          style={{ textAlign: "center" }}
                        >
                          Rs:
                          <input
                            id="Quantity"
                            style={{ width: "100px" }}
                            type="text"
                            className="numberInput"
                            min={1}
                            onWheel={(e) => e.preventDefault()}
                            value={
                               item?.item_price || 0
                            }
                            onChange={(e) => {
                              setOrder((prev) => {
                                return {
                                  ...prev,
                                  item_details: prev.item_details.map((a) =>
                                    a.uuid === item.uuid
                                      ? { ...a, item_price: (e.target.value).toFixed(2) }
                                      : a
                                  ),
                                };
                              });
                              setEditPrices((prev) =>
                                prev.filter(
                                  (a) => a.item_uuid === item.item_uuid
                                ).length
                                  ? prev.map((a) =>
                                      a.item_uuid === item.item_uuid
                                        ? { ...a, item_price: (e.target.value).toFixed(2) }
                                        : a
                                    )
                                  : prev.length
                                  ? [
                                      ...prev,
                                      { ...item, item_price: (e.target.value).toFixed(2) },
                                    ]
                                  : [{ ...item, item_price: (e.target.value).toFixed(2) }]
                              );
                            }}
                          />
                        </td>
                        <td
                          className="ph2 pv1 tc bb b--black-20 bg-white"
                          style={{ textAlign: "center" }}
                        >
                          Rs:
                          <input
                            id="Quantity"
                            type="text"
                            className="numberInput"
                            min={1}
                            onWheel={(e) => e.preventDefault()}
                            value={
                              (item?.item_price || 0) * (+item?.conversion || 1)
                            }
                            onChange={(e) => {
                              setOrder((prev) => {
                                return {
                                  ...prev,
                                  item_details: prev.item_details.map((a) =>
                                    a.uuid === item.uuid
                                      ? {
                                          ...a,
                                          item_price:
                                            e.target.value /
                                            (+item.conversion || 1),
                                        }
                                      : a
                                  ),
                                };
                              });
                              setEditPrices((prev) =>
                                prev.filter(
                                  (a) => a.item_uuid === item.item_uuid
                                ).length
                                  ? prev.map((a) =>
                                      a.item_uuid === item.item_uuid
                                        ? {
                                            ...a,
                                            item_price:
                                              e.target.value /
                                              (+item.conversion || 1),
                                          }
                                        : a
                                    )
                                  : prev.length
                                  ? [
                                      ...prev,
                                      {
                                        ...item,
                                        item_price:
                                          e.target.value /
                                          (+item.conversion || 1),
                                      },
                                    ]
                                  : [
                                      {
                                        ...item,
                                        item_price:
                                          e.target.value /
                                          (+item.conversion || 1),
                                      },
                                    ]
                              );
                            }}
                          />
                        </td>
                        <td
                          className="ph2 pv1 tc bb b--black-20 bg-white"
                          style={{ textAlign: "center" }}
                        >
                          <DeleteOutlineIcon
                            style={{ color: "red", cursor: "pointer" }}
                            onClick={() =>
                              setOrder((prev) => ({
                                ...prev,
                                item_details: prev.item_details.filter(
                                  (a) => !(a.item_uuid === item.item_uuid)
                                ),
                              }))
                            }
                          />
                        </td>
                      </tr>
                    ))}
                    <tr>
                      <td
                        onClick={() =>
                          setOrder((prev) => ({
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
                  </tbody>
                ) : (
                  ""
                )}
              </table>
            </div>

            <div className="bottomContent" style={{ background: "white" }}>
              <button
                type="button"
                onClick={() => {
                  if (!order.item_details.filter((a) => a.item_uuid).length)
                    return;
                  setPopup(true);
                }}
              >
                Bill
              </button>
              {order?.order_grandtotal ? (
                <button
                  style={{
                    position: "fixed",
                    bottom: "100px",
                    right: "0",
                    cursor: "default",
                  }}
                  type="button"
                  onClick={() => {
                    if (!order.item_details.filter((a) => a.item_uuid).length)
                      return;
                    setPopup(true);
                  }}
                >
                  Total: {order?.order_grandtotal || 0}
                </button>
              ) : (
                ""
              )}
            </div>
          </div>
        </div>
      </div>

      {popup ? (
        <NewUserForm onClose={() => setPopup(false)} onSubmit={onSubmit} />
      ) : (
        ""
      )}
    </>
  );
}

function NewUserForm({ onSubmit, onClose }) {
  const [data, setData] = useState({ autoAdd: true, stage: 1 });
  return (
    <div className="overlay">
      <div
        className="modal"
        style={{ height: "fit-content", width: "fit-content" }}
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
            <form
              className="form"
              onSubmit={(e) => {
                e.preventDefault();
                onSubmit(data);
                onClose();
              }}
            >
              <div className="formGroup">
                <div className="row">
                  <h3> Auto Add</h3>
                  <div onClick={() => setData({ ...data, autoAdd: true })}>
                    <input type="radio" checked={data.autoAdd} />
                    Yes
                  </div>
                  <div onClick={() => setData({ ...data, autoAdd: false })}>
                    <input type="radio" checked={!data.autoAdd} />
                    No
                  </div>
                </div>
                <div className="row">
                  <h3>Stage</h3>
                  <div onClick={() => setData({ ...data, stage: 1 })}>
                    <input type="radio" checked={data.stage === 1} />
                    Processing
                  </div>
                  <div onClick={() => setData({ ...data, stage: 2 })}>
                    <input type="radio" checked={data.stage === 2} />
                    Checking
                  </div>
                  <div onClick={() => setData({ ...data, stage: 3 })}>
                    <input type="radio" checked={data.stage === 3} />
                    Delivery
                  </div>
                  <div onClick={() => setData({ ...data, stage: 4 })}>
                    <input type="radio" checked={data.stage === 4} />
                    Complete
                  </div>
                </div>

                <div className="row">
                  <button type="submit" className="submit">
                    Save
                  </button>
                </div>
              </div>
            </form>
          </div>
          <button onClick={onClose} className="closeButton">
            x
          </button>
        </div>
      </div>
    </div>
  );
}
