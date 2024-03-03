/* eslint-disable react-hooks/exhaustive-deps */
import axios from "axios";
import { useEffect, useRef, useState, useContext, useMemo } from "react";
import Header from "../../components/Header";
import Sidebar from "../../components/Sidebar";
import "./index.css";
import { Billing } from "../../Apis/functions";
import { AddCircle as AddIcon } from "@mui/icons-material";
import { v4 as uuid } from "uuid";
import Select from "react-select";
import DiliveryReplaceMent from "../../components/DiliveryReplaceMent";
import Context from "../../context/context";
import Prompt from "../../components/Prompt";

export let getInititalValues = () => {
  let time = new Date();
  return {
    voucher_uuid: uuid(),
    type: "",
    created_by: localStorage.getItem("user_uuid"),
    created_at: time.getTime(),
    amt:0,
    details: [],
    voucher_date: "yy-mm-dd"
      .replace("mm", ("00" + (time?.getMonth() + 1).toString()).slice(-2))
      .replace("yy", ("0000" + time?.getFullYear().toString()).slice(-4))
      .replace("dd", ("00" + time?.getDate().toString()).slice(-2)),
  };
};
let typeOptions = [
  { value: "PURCHASE", label: "Purchase" },
  { value: "SALE", label: "Sales" },
  { value: "RCPT", label: "Receipt" },
  { value: "JPNL", label: "Journal" },
  { value: "CNTR", label: "Contra" },
];

export default function NewVoucher() {
  const { promptState, setPromptState, setNotification } = useContext(Context);
  const [order, setOrder] = useState(getInititalValues());
  const [deliveryPopup, setDeliveryPopup] = useState(false);
  const [ledgerData, setLedgerData] = useState([]);
  const [counters, setCounters] = useState([]);
  const [itemsData, setItemsData] = useState([]);
  const [popup, setPopup] = useState(false);
  const reactInputsRef = useRef({});
  const [focusedInputId, setFocusedInputId] = useState(0);
  const [autoAdd, setAutoAdd] = useState(false);
  const [remarks, setRemarks] = useState("");

  const getLedgers = async () => {
    const response = await axios({
      method: "get",
      url: "/ledger/getLedger",

      headers: {
        "Content-Type": "application/json",
      },
    });
    if (response.data.success) setLedgerData(response.data.result);
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

    getLedgers();
  }, []);

  useEffect(() => {
    if (order?.ledger_uuid) {
      const counterData = ledgerData.find(
        (a) => a.ledger_uuid === order.ledger_uuid
      );
      setItemsData((prev) =>
        prev.map((item) => {
          let item_rate = counterData?.company_discount?.find(
            (a) => a.company_uuid === item.company_uuid
          )?.item_rate;
          console.log({ item_rate, item_title: item.item_title });
          let item_price = item.item_price;
          if (item_rate === "a") item_price = item.item_price_a;
          if (item_rate === "b") item_price = item.item_price_b;
          if (item_rate === "c") item_price = item.item_price_c;

          return { ...item, item_price };
        })
      );
    }
  }, [order.ledger_uuid]);
  const totalSum = useMemo(() => {
    let total = order?.details.reduce((a, b) => a + +(b.add || 0), 0);
    return total;
  }, [order.details]);
  const totalSub = useMemo(() => {
    let total = order?.details.reduce((a, b) => a + +(b.sub || 0), 0);
    return total;
  }, [order.details]);
  const onSubmit = async () => {
    // check all add and sub sum is 0
    if (totalSum !== totalSub) {
      setNotification({
        message: "Total Debit and Credit Not Equal",
        success: false,
      });
      setTimeout(() => setNotification(null), 2000);
      return;
    }
    const response = await axios({
      method: "post",
      url: "/vouchers/postAccountVoucher",
      data: {
        ...order,
        amt: totalSum,
        details: order.details.map((a) => {
          return {
            ledger_uuid: a.ledger_uuid || a.counter_uuid,
            amount: a.add || -(a.sub || 0),
          };
        }),
      },
      headers: {
        "Content-Type": "application/json",
      },
    });
    if (response.data.success) {
      setNotification({
        message: "Voucher Added",
        success: true,
      });
      setOrder(getInititalValues());
    } else {
      setNotification({
        message: "Voucher Not Added",
        success: false,
      });
    }
    setTimeout(() => setNotification(null), 2000);
  };

  const jumpToNextIndex = (id) => {
    document.querySelector(`#${id}`).blur();
    const index = document.querySelector(`#${id}`).getAttribute("index");
    const nextElem = document.querySelector(`[index="${+index + 1}"]`);
    if (nextElem) {
      if (nextElem.id.includes("selectContainer-")) {
        reactInputsRef.current[
          nextElem.id.replace("selectContainer-", "")
        ].focus();
      } else {
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
            details: [
              ...prev.details,
              {
                uuid: nextElemId,
                b: 0,
                p: 0,
                sr: prev.details.length + 1,
              },
            ],
          })),
        250
      );
    }
    // setQuantity();
  };
  console.count("render");

  let listItemIndexCount = 0;

  const onPiecesKeyDown = (e, item) => {
    if (e.key === "Enter") jumpToNextIndex("p" + item.uuid);
    else if (e.key === "+") {
      e.preventDefault();
      setOrder((prev) => ({
        ...prev,
        details: prev?.details?.map((i) =>
          i.item_uuid === item.item_uuid
            ? { ...i, p: (+i.p || 0) + (+item?.one_pack || 0) }
            : i
        ),
      }));
    } else if (e.key === "-") {
      e.preventDefault();
      setOrder((prev) => ({
        ...prev,
        details: prev?.details?.map((i) =>
          i.item_uuid === item.item_uuid
            ? { ...i, p: (+i.p || 0) - (+item?.one_pack || 0) }
            : i
        ),
      }));
    }
  };

  const LedgerOptions = useMemo(
    () =>
      [...ledgerData, ...counters]
        .filter(
          (a) =>
            !order.details.find(
              (b) =>
                (a.ledger_uuid && b.ledger_uuid === a.ledger_uuid) ||
                (a.counter_uuid && b.counter_uuid === a.counter_uuid)
            )
        )
        .sort((a, b) =>
          (a?.counter_title || a?.ledger_title)?.localeCompare(
            b.counter_title || b.ledger_title
          )
        )
        .map((a, j) => ({
          value: a.ledger_uuid || a.counter_uuid,
          label: a.counter_title || a.ledger_title,
          key: a.item_uuid,
          ledger_uuid: a.ledger_uuid,
          counter_uuid: a.counter_uuid,
        })),
    [ledgerData, counters, order.details]
  );

  return (
    <>
      <Sidebar />
      <div className="right-side">
        <Header />
        <div className="inventory">
          <div className="accountGroup" id="voucherForm" action="">
            <div className="inventory_header">
              <h2>Purchase Invoice </h2>
            </div>

            <div className="topInputs">
              <div className="inputGroup" style={{ width: "50px" }}>
                <label htmlFor="Warehouse">Ledger</label>
                <div className="inputGroup">
                  <input
                    type="date"
                    onChange={(e) =>
                      setOrder((prev) => ({
                        ...prev,
                        voucher_date: e.target.value,
                      }))
                    }
                    value={order.voucher_date}
                    placeholder="Search Counter Title..."
                    className="searchInput"
                    pattern="\d{4}-\d{2}-\d{2}"
                  />
                </div>
              </div>
              <div className="inputGroup" style={{ width: "100px" }}>
                <label htmlFor="Warehouse">Type</label>
                <div className="inputGroup">
                  <Select
                    options={typeOptions}
                    onChange={(doc) => {
                      setOrder((prev) => ({
                        ...prev,
                        type: doc.value,
                      }));
                    }}
                    value={
                      typeOptions.find(
                        (a) => a.value === order.type
                      ) || {
                        value: "",
                        label: "Select",
                      }
                    }
                    openMenuOnFocus={true}
                    menuPosition="fixed"
                    menuPlacement="auto"
                    placeholder="Select"
                  />
                </div>
              </div>
            </div>

            <div
              className="items_table"
              style={{ flex: "1", height: "75vh", overflow: "scroll" }}
            >
              <table className="f6 w-100 center" cellSpacing="0">
                <thead className="lh-copy" style={{ position: "static" }}>
                  <tr className="white">
                    <th className="pa2 tl bb b--black-20 w-30">Ledger</th>
                    <th className="pa2 tc bb b--black-20">-</th>
                    <th className="pa2 tc bb b--black-20">+</th>
                  </tr>
                </thead>

                <tbody className="lh-copy">
                  {order?.details?.map((item, i) => (
                    <tr key={item.uuid} item-billing-type={item?.billing_type}>
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
                            className="order-item-select"
                            options={LedgerOptions}
                            onChange={(e) => {
                              // setTimeout(
                              //   () => setQtyDetails((prev) => !prev),
                              //   2000
                              // );
                              setOrder((prev) => ({
                                ...prev,
                                details: prev.details.map((a) => {
                                  if (a.uuid === item.uuid) {
                                    let item = ledgerData.find(
                                      (a) => a.ledger_uuid === e.value
                                    );
                                    if (!item) {
                                      item = counters.find(
                                        (a) => a.counter_uuid === e.value
                                      );
                                    }
                                    return {
                                      ...a,
                                      ...item,
                                    };
                                  } else return a;
                                }),
                              }));
                              jumpToNextIndex(`selectContainer-${item.uuid}`);
                            }}
                            value={
                              itemsData

                                .filter((a) => a.item_uuid === item.item_uuid)
                                .map((a, j) => ({
                                  value: a.item_uuid,
                                  label: a.counter_title || a.ledger_title,
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
                      </td>{" "}
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
                          value={item.sub || ""}
                          onChange={(e) => {
                            setOrder((prev) => {
                              return {
                                ...prev,
                                details: prev.details.map((a) =>
                                  a.uuid === item.uuid
                                    ? { ...a, sub: e.target.value }
                                    : a
                                ),
                              };
                            });
                          }}
                          onFocus={(e) => e.target.select()}
                          onKeyDown={(e) => onPiecesKeyDown(e, item)}
                          disabled={
                            !(item.counter_uuid || item.ledger_uuid) || item.add
                          }
                        />
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
                          disabled={
                            !(item.counter_uuid || item.ledger_uuid) || item.sub
                          }
                          value={item.add || ""}
                          onChange={(e) => {
                            setOrder((prev) => {
                              return {
                                ...prev,
                                details: prev.details.map((a) =>
                                  a.uuid === item.uuid
                                    ? { ...a, add: e.target.value }
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
                        />
                      </td>
                    </tr>
                  ))}
                  <tr>
                    <td
                      onClick={() =>
                        setOrder((prev) => ({
                          ...prev,
                          details: [
                            ...prev.details,
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
                  <tr>
                    <td
                      className="ph2 pv1 tl bb b--black-20 bg-white"
                      style={{ width: "300px" }}
                    >
                      <div
                        className="inputGroup"
                        id={`selectContainer-total`}
                        index={listItemIndexCount++}
                        style={{ width: "300px" }}
                      >
                        Total
                      </div>
                    </td>
                    <td
                      className="ph2 pv1 tc bb b--black-20 bg-white"
                      style={{ textAlign: "center" }}
                    >
                      {totalSub}
                    </td>
                    <td
                      className="ph2 pv1 tc bb b--black-20 bg-white"
                      style={{ textAlign: "center" }}
                    >
                      {totalSum}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="bottomContent" style={{ background: "white" }}>
              <button
                type="button"
                onClick={() => {
                  onSubmit();
                }}
              >
                Bill
              </button>
              {order?.order_grandtotal ? (
                <button
                  style={{
                    position: "fixed",
                    bottom: "10px",
                    right: "0",
                    cursor: "default",
                  }}
                  type="button"
                  onClick={() => {
                    // if (!order.details.filter((a) => a.item_uuid).length)
                    //   return;
                    // setPopup(true);
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
      {promptState ? <Prompt {...promptState} /> : ""}

      {popup ? (
        <NewUserForm
          onClose={() => setPopup(false)}
          onSubmit={(e) => {
            //console.log(e);
            setAutoAdd(e.autoAdd);
            if (e.stage === 4) setDeliveryPopup(true);
            else {
              onSubmit(e);
            }
          }}
        />
      ) : (
        ""
      )}
      {deliveryPopup ? (
        <DiliveryPopup
          onSave={() => setDeliveryPopup(false)}
          postOrderData={(obj) => onSubmit({ stage: 5, autoAdd, obj })}
          setSelectedOrder={setOrder}
          order={order}
          ledgerData={ledgerData}
          items={itemsData}
        />
      ) : (
        ""
      )}
      {remarks ? (
        <div className="overlay">
          <div
            className="modal"
            style={{
              height: "fit-content",
              width: "max-content",
              padding: "50px",
              backgroundColor: "red",
            }}
          >
            <h3>{remarks}</h3>

            <button onClick={() => setRemarks(false)} className="closeButton">
              x
            </button>
          </div>
        </div>
      ) : (
        ""
      )}
    </>
  );
}

function NewUserForm({ onSubmit, onClose }) {
  const [data, setData] = useState({ autoAdd: false, stage: 1 });
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
function DiliveryPopup({
  onSave,
  postOrderData,
  credit_allowed,
  counters,
  items,
  order,
  updateBilling,
}) {
  const [PaymentModes, setPaymentModes] = useState([]);
  const [modes, setModes] = useState([]);
  const [error, setError] = useState("");
  const [popup, setPopup] = useState(false);
  // const [coinPopup, setCoinPopup] = useState(false);
  const [data, setData] = useState({});
  const [outstanding, setOutstanding] = useState({});
  useEffect(() => {
    updateBilling({
      replacement: data?.replacement || 0,
      shortage: data?.shortage || 0,
      adjustment: data?.adjustment || 0,
      adjustment_remarks: data?.adjustment_remarks || "",
    });
  }, [data]);
  const GetPaymentModes = async () => {
    const response = await axios({
      method: "get",
      url: "/paymentModes/GetPaymentModesList",

      headers: {
        "Content-Type": "application/json",
      },
    });
    if (response.data.success) setPaymentModes(response.data.result);
  };
  useEffect(() => {
    let time = new Date();
    setOutstanding({
      order_uuid: order.order_uuid,
      amount: "",
      user_uuid: localStorage.getItem("user_uuid"),
      time: time.getTime(),
      invoice_number: order.invoice_number,
      trip_uuid: order.trip_uuid,
      ledger_uuid: order.ledger_uuid,
    });
    GetPaymentModes();
  }, []);
  useEffect(() => {
    if (PaymentModes.length)
      setModes(
        PaymentModes.map((a) => ({
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
    setError("");
    let billingData = await Billing({
      creating_new: 1,
      order_uuid: order?.order_uuid,
      invoice_number: `${order?.order_type}${order?.invoice_number}`,
      replacement: order.replacement,
      shortage: order.shortage,
      adjustment: order.adjustment,
      counter: counters.find((a) => a.ledger_uuid === order.ledger_uuid),
      items: order.details.map((a) => {
        let itemData = items.find((b) => a.item_uuid === b.item_uuid);
        return {
          ...itemData,
          ...a,
          price: itemData?.price || 0,
        };
      }),
    });
    let Tempdata = {
      ...order,
      ...billingData,
      details: billingData.items,
      replacement: data?.replacement || 0,
      shortage: data?.shortage || 0,
      adjustment: data?.adjustment || 0,
      adjustment_remarks: data?.adjustment_remarks || "",
    };
    let modeTotal = modes.map((a) => +a.amt || 0)?.reduce((a, b) => a + b);
    //console.log(
    // Tempdata?.order_grandtotal,
    //   +(+modeTotal + (+outstanding?.amount || 0))
    // );
    if (
      +Tempdata?.order_grandtotal !==
      +(+modeTotal + (+outstanding?.amount || 0))
    ) {
      setError("Invoice Amount and Payment mismatch");
      return;
    }
    // let obj = modes.find((a) => a.mode_title === "Cash");
    // if (obj?.amt && obj?.coin === "") {
    //   setCoinPopup(true);
    //   return;
    // }

    let obj = {
      user_uuid: localStorage.getItem("user_uuid"),
      modes: modes.map((a) =>
        a.mode_title === "Cash" ? { ...a, coin: 0 } : a
      ),
    };

    postOrderData({ ...obj, OutStanding: outstanding.amount });
    onSave();
  };
  return (
    <>
      <div className="overlay">
        <div
          className="modal"
          style={{ height: "fit-content", width: "max-content" }}
        >
          <div className="flex" style={{ justifyContent: "space-between" }}>
            <h3>Payments</h3>
            <h3>Rs. {order.order_grandtotal}</h3>
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
                  {PaymentModes.map((item) => (
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
                              prev.map((a) =>
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
                    <div style={{ width: "50px" }}>UnPaid</div>
                    <label
                      className="selectLabel flex"
                      style={{ width: "80px" }}
                    >
                      <input
                        type="number"
                        name="route_title"
                        className="numberInput"
                        value={outstanding?.amount}
                        placeholder={
                          !credit_allowed === "Y" ? "Not Allowed" : ""
                        }
                        style={
                          !credit_allowed === "Y"
                            ? {
                                width: "90px",
                                backgroundColor: "light",
                                fontSize: "12px",
                                color: "#fff",
                              }
                            : { width: "80px" }
                        }
                        onChange={(e) =>
                          setOutstanding((prev) => ({
                            ...prev,
                            amount: e.target.value,
                          }))
                        }
                        maxLength={42}
                        onWheel={(e) => e.preventDefault()}
                      />
                      {/* {popupInfo.conversion || 0} */}
                    </label>
                  </div>
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
      {popup ? (
        <DiliveryReplaceMent
          onSave={() => {
            setPopup(false);
          }}
          setData={setData}
          data={data}
        />
      ) : (
        ""
      )}
      {/* {coinPopup ? (
        <div className="overlay">
          <div
            className="modal"
            style={{ height: "fit-content", width: "max-content" }}
          >
            <h3>Cash Coin</h3>
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
                    <div
                      className="row"
                      style={{ flexDirection: "row", alignItems: "center" }}
                    >
                      <div style={{ width: "50px" }}>Cash</div>

                      <label
                        className="selectLabel flex"
                        style={{ width: "80px" }}
                      >
                        <input
                          type="number"
                          name="route_title"
                          className="numberInput"
                          placeholder="Coins"
                          value={
                            modes.find(
                              (a) =>
                                a.mode_uuid ===
                                "c67b54ba-d2b6-11ec-9d64-0242ac120002"
                            )?.coin
                          }
                          style={{ width: "70px" }}
                          onChange={(e) =>
                            setModes((prev) =>
                              prev.map((a) =>
                                a.mode_uuid ===
                                "c67b54ba-d2b6-11ec-9d64-0242ac120002"
                                  ? {
                                      ...a,
                                      coin: e.target.value,
                                    }
                                  : a
                              )
                            )
                          }
                          maxLength={42}
                          onWheel={(e) => e.preventDefault()}
                        />
                      </label>
                    </div>
                  </div>

                  <div
                    className="flex"
                    style={{ justifyContent: "space-between" }}
                  >
                    <button
                      type="button"
                      className="submit"
                      onClick={() => submitHandler()}
                    >
                      Save
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      ) : (
        ""
      )} */}
    </>
  );
}
