import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router";
import axios from "axios";
import Header from "../../components/Header";
import Sidebar from "../../components/Sidebar";
import {
  getFormateDate,
  getMidnightTimestamp,
  truncateDecimals,
} from "../../utils/helperFunctions";
import Select from "react-select";
import { get } from "react-scroll/modules/mixins/scroller";
import DiliveryReplaceMent from "../../components/DiliveryReplaceMent";

const UknownVouchers = () => {
  const [opening_balance_amount, setOpening_balance_amount] = useState(0);
  const [showUnknown, setShowUnknown] = useState(false);
  const [selectionMode, setSelectionMode] = useState(false);
  const [changeDatePopup, setChangeDatePopup] = useState(false);
  const [popupOrder, setPopupOrder] = useState(null);
  const [popupRecipt, setPopupRecipt] = useState(null);
  const [items, setItems] = useState([]);
  const navigate = useNavigate();

  const getUnknowVouchers = async (signal) => {
    const response = await axios({
      method: "get",
      url: "/vouchers/getUnknownVouchers",
      signal,
      headers: {
        "Content-Type": "application/json",
      },
    });
    console.log("activity", response);
    if (response.data.success) {
      setItems(response.data.result);
    } else {
      setItems([]);
    }
  };

  useEffect(() => {
    let controller = new AbortController();
    getUnknowVouchers(controller.signal);
    return () => {
      sessionStorage.removeItem("isEditVoucher");
      controller.abort();
    };
  }, []);

  const filterOption = (data, value) => {
    let label = data.data.label;
    if (label.toLowerCase().includes(value.toLowerCase())) return true;
    return false;
  };
  let itemsData = useMemo(() => {
    let itemData = items?.sort((a, b) => +a.voucher_date - +b.voucher_date);
    let result = [];
    let balance = +opening_balance_amount?.amount || 0;
    for (let item of itemData) {
      balance = +item.amount + +balance;
      balance = (balance || 0).toFixed(2);
      result.push({
        ...item,
        balance: truncateDecimals(balance + opening_balance_amount?.amount, 2),
      });
    }
    return result;
  }, [items, opening_balance_amount]);

  return (
    <>
      <Sidebar />
      <Header />
      <div className="item-sales-container orders-report-container">
        <div id="heading">
          <h2>Unknown Entity</h2>
        </div>

        <div className="table-container-user item-sales-container">
          <Table
            itemsDetails={itemsData}
            setPopupOrder={setPopupOrder}
            setPopupRecipt={setPopupRecipt}
            navigate={navigate}
            selectionMode={selectionMode}
            setSelectionMode={setSelectionMode}
          />
        </div>
      </div>

      {changeDatePopup ? (
        <OpeningBalanceDate
          setNotification={(e) => {
            setChangeDatePopup(false);
          }}
          setSelectionMode={setSelectionMode}
          selectionMode={selectionMode}
          setChangeDatePopup={() => {
            getUnknowVouchers(new AbortController().signal);
            setChangeDatePopup(false);
          }}
        />
      ) : (
        ""
      )}

      {popupRecipt ? (
        <DiliveryPopup
          onSave={() => {
            setPopupRecipt(null);
            getUnknowVouchers(new AbortController().signal);
          }}
          order={popupRecipt}
          orderStatus="edit"
        />
      ) : (
        ""
      )}
    </>
  );
};

export default UknownVouchers;

function Table({ itemsDetails, navigate, selectionMode, setSelectionMode }) {
  return (
    <table
      className="user-table"
      style={{ maxWidth: "100vw", height: "fit-content", overflowX: "scroll" }}
    >
      <thead>
        <tr>
          <th>S.N</th>
          <th colSpan={3}>Ledger</th>
          <th colSpan={2}>Type</th>
          <th colSpan={2}>Created</th>
          <th colSpan={1}>Reference No</th>
          <th colSpan={1}>Amount</th>
        </tr>
      </thead>
      <tbody className="tbody">
        {itemsDetails?.map((item, i, array) => (
          <tr
            key={Math.random()}
            style={{ height: "30px" }}
            onClick={(e) => {
              e.stopPropagation();
              if (item.type === "PURCHASE_INVOICE")
                navigate("/admin/editPurchaseInvoice/" + item.order_uuid);
              else
                navigate("/admin/editVoucher/" + item.accounting_voucher_uuid);
            }}
          >
            <td>{i + 1} </td>
            <td colSpan={3}>{item.ledger_title || item.counter_title || ""}</td>
            <td colSpan={2}>{item.type}</td>
            <td colSpan={2}>{getFormateDate(new Date(+item.created_at))}</td>
            <td colSpan={1}>{item.reference_no}</td>
            <td colSpan={1}>{item.amt || ""}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
function DiliveryPopup({
  onSave,
  postOrderData,
  order,
  updateBilling,
  deliveryPopup,
}) {
  const [PaymentModes, setPaymentModes] = useState([]);
  const [modes, setModes] = useState([]);
  const [counters, setCounters] = useState([]);
  const [error, setError] = useState("");
  const [popup, setPopup] = useState(false);
  const [waiting, setWaiting] = useState(false);

  // const [coinPopup, setCoinPopup] = useState(false);
  const [data, setData] = useState({});
  const [outstanding, setOutstanding] = useState({});
  const time2 = new Date();
  time2.setHours(12);
  let reminder = useMemo(() => {
    return new Date(
      time2.setDate(
        time2.getDate() +
          (counters.find((a) => a.counter_uuid === order.counter_uuid)
            ?.payment_reminder_days || 0)
      )
    ).getTime();
  }, [counters, order.counter_uuid]);
  let type = useMemo(() => {
    return (
      counters.find((a) => a.counter_uuid === order.counter_uuid)
        ?.outstanding_type || 0
    );
  }, [counters, order.counter_uuid]);
  console.log(outstanding);
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
  const GetPaymentModes = async () => {
    const cachedData = localStorage.getItem('paymentModesData');
  
    if (cachedData) {
      setPaymentModes(JSON.parse(cachedData));
      GetReciptsModes();
    } else {
      const response = await axios({
        method: "get",
        url: "/paymentModes/GetPaymentModesList",
        headers: {
          "Content-Type": "application/json",
        },
      });
      if (response.data.success) {
        localStorage.setItem('paymentModesData', JSON.stringify(response.data.result));
        setPaymentModes(response.data.result);
        GetReciptsModes();
      }
    }
  };
  const GetReciptsModes = async () => {
    const response = await axios({
      method: "post",
      url: "/receipts/getSingleRecipt",
      data: {
        order_uuid: order.order_uuid,
        counter_uuid: order.counter_uuid,
        receipt_number: order.receipt_number,
      },
      headers: {
        "Content-Type": "application/json",
      },
    });
    if (response.data.success) setModes(response.data.result.modes);
  };
  const GetOutstanding = async () => {
    const response = await axios({
      method: "post",
      url: "/Outstanding/getOutstanding",
      data: { order_uuid: order.order_uuid, counter_uuid: order.counter_uuid },

      headers: {
        "Content-Type": "application/json",
      },
    });
    if (response.data.success) setOutstanding(response.data.result);
    else {
      let time = new Date();

      setOutstanding({
        order_uuid: order.order_uuid,
        amount: "",
        user_uuid: localStorage.getItem("user_uuid"),
        time: time.getTime(),
        invoice_number: order.invoice_number,
        trip_uuid: order.trip_uuid,
        counter_uuid: order.counter_uuid,
        reminder,
        type,
      });
    }
  };
  useEffect(() => {
    if (deliveryPopup === "put" || deliveryPopup === "edit") {
      GetOutstanding();
    } else {
      let time = new Date();
      setOutstanding({
        order_uuid: order.order_uuid,
        amount: "",
        user_uuid: localStorage.getItem("user_uuid"),
        time: time.getTime(),
        invoice_number: order.invoice_number,
        trip_uuid: order.trip_uuid,
        counter_uuid: order.counter_uuid,
        reminder,
        type,
      });
    }
    GetPaymentModes();
  }, [
    deliveryPopup,
    order.counter_uuid,
    order.invoice_number,
    order.order_uuid,
    order.trip_uuid,
    reminder,
    type,
  ]);
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
  useEffect(() => {
    getCounter();
  }, []);
  const submitHandler = async () => {
    if (waiting) {
      return;
    }
    setWaiting(true);
    updateBilling({
      ...order,
      replacement: data?.replacement || 0,
      shortage: data?.shortage || 0,
      adjustment: data?.adjustment || 0,
      adjustment_remarks: data?.adjustment_remarks || "",
    });
    setError("");
    let modeTotal = 0;
    for (let mode of modes) {
      modeTotal = +mode.amt + modeTotal;
      modeTotal = modeTotal.toFixed(2);
    }
    //console.log(
    // Tempdata?.order_grandtotal,
    //   +(+modeTotal + (+outstanding?.amount || 0))
    // );
    if (
      +order?.order_grandtotal !== +(+modeTotal + (+outstanding?.amount || 0))
    ) {
      setError("Invoice Amount and Payment mismatch");
      setWaiting(false);
      return;
    }
    if (
      window.location.pathname.includes("completeOrderReport") ||
      window.location.pathname.includes("signedBills") ||
      window.location.pathname.includes("pendingEntry") ||
      window.location.pathname.includes("upiTransactionReport")
    ) {
      let response;
      if (modeTotal) {
        response = await axios({
          method: "put",
          url: "/receipts/putSingleReceipt",
          data: {
            modes,
            order_uuid: order.order_uuid,
            counter_uuid: order.counter_uuid,
            receipt_number: order.receipt_number,
          },
          headers: {
            "Content-Type": "application/json",
          },
        });
      }
      if (outstanding?.amount) {
        response = await axios({
          method: "put",
          url: "/Outstanding/putOutstanding",
          data: {
            ...outstanding,
            order_uuid: order.order_uuid,
            counter_uuid: order.counter_uuid,
          },
          headers: {
            "Content-Type": "application/json",
          },
        });
      }
      if (response.data.success) {
        onSave();
      }
    } else {
      // let obj = modes.find((a) => a.mode_title === "Cash");
      // if (obj?.amt && obj?.coin === "") {
      //   setCoinPopup(true);
      //   return;
      // }
      let time = new Date();
      let obj = {
        user_uuid: localStorage.getItem("user_uuid"),
        time: time.getTime(),
        order_uuid: order.order_uuid,
        counter_uuid: order.counter_uuid,
        order_grandtotal: order?.order_grandtotal,
        trip_uuid: order.trip_uuid,
        invoice_number: order.invoice_number,
        modes: modes?.map((a) =>
          a.mode_title === "Cash" ? { ...a, coin: 0 } : a
        ),
      };
      let response;
      if (modeTotal) {
        response = await axios({
          method: "post",
          url: "/receipts/postReceipt",
          data: obj,
          headers: {
            "Content-Type": "application/json",
          },
        });
      }
      if (outstanding?.amount)
        response = await axios({
          method: "post",
          url: "/Outstanding/postOutstanding",
          data: outstanding,
          headers: {
            "Content-Type": "application/json",
          },
        });
      if (response.data.success) {
        postOrderData();
        onSave();
      }
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
                      {item.mode_uuid ===
                        "c67b5794-d2b6-11ec-9d64-0242ac120002" &&
                      modes.find((a) => a.mode_uuid === item.mode_uuid)?.amt ? (
                        <label
                          className="selectLabel flex"
                          style={{ width: "200px" }}
                        >
                          <input
                            type="text"
                            name="route_title"
                            className="numberInput"
                            value={item?.remarks}
                            placeholder={"Cheque Number"}
                            style={{
                              width: "100%",
                              backgroundColor: "light",
                              fontSize: "12px",
                            }}
                            onChange={(e) =>
                              setModes((prev) =>
                                prev?.map((a) =>
                                  a.mode_uuid === item.mode_uuid
                                    ? { ...a, remarks: e.target.value }
                                    : a
                                )
                              )
                            }
                            maxLength={42}
                            onWheel={(e) => e.preventDefault()}
                          />
                        </label>
                      ) : (
                        ""
                      )}
                    </div>
                  ))}
                  {/* <div
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
                          placeholder={""}
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
                         {popupInfo.conversion || 0} 
                      </label>
                    </div> */}
                  {outstanding?.amount ? (
                    <div
                      className="row"
                      style={{ flexDirection: "row", alignItems: "center" }}
                    >
                      <label
                        className="selectLabel flex"
                        style={{ width: "100%" }}
                      >
                        <input
                          type="text"
                          name="route_title"
                          className="numberInput"
                          value={outstanding?.remarks}
                          placeholder={"Remarks"}
                          style={{
                            width: "100%",
                            backgroundColor: "light",
                            fontSize: "12px",
                            color: "#fff",
                          }}
                          onChange={(e) =>
                            setOutstanding((prev) => ({
                              ...prev,
                              remarks: e.target.value,
                            }))
                          }
                          maxLength={42}
                          onWheel={(e) => e.preventDefault()}
                        />
                        {/* {popupInfo.conversion || 0} */}
                      </label>
                    </div>
                  ) : (
                    ""
                  )}
                  <div
                    className="row"
                    style={{ flexDirection: "row", alignItems: "center" }}
                  >
                    {deliveryPopup === "put" ? (
                      ""
                    ) : (
                      <button
                        type="button"
                        className="submit"
                        style={{ color: "#fff", backgroundColor: "#7990dd" }}
                        onClick={() => setPopup(true)}
                      >
                        Deductions
                      </button>
                    )}
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
              replacement: e?.replacement || 0,
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

function OpeningBalanceDate({
  setNotification,
  setSelectionMode,
  setChangeDatePopup,
  selectionMode,
}) {
  const [data, setData] = useState(new Date().getTime());

  //post request to save bank statement import
  const saveBankStatementImport = async (e) => {
    e.preventDefault();

    const res = await axios({
      method: "put",
      url: "/vouchers/updateAccountVoucherDate",
      data: {
        accounting_voucher_uuid: selectionMode.map(
          (a) => a.accounting_voucher_uuid
        ),
        voucher_date: data,
      },
      headers: {
        "Content-Type": "application/json",
      },
    });
    setNotification(res.data);
    setTimeout(() => {
      setNotification(null);
    }, 3000);
    if (res.data.success) {
      setSelectionMode(false);
      setChangeDatePopup(false);
    }
  };
  //get request to get bank statement import

  return (
    <div className="overlay" style={{ zIndex: "999999" }}>
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
            <form className="form" onSubmit={saveBankStatementImport}>
              <div className="row">
                <h1>Change Date</h1>
              </div>

              <div className="form">
                <div className="row">
                  <label className="selectLabel">
                    Date
                    <input
                      type="date"
                      onChange={(e) =>
                        setData(
                          getMidnightTimestamp(
                            new Date(e.target.value).getTime()
                          )
                        )
                      }
                      value={getFormateDate(new Date(+data))}
                      placeholder="Search Counter Title..."
                      className="searchInput"
                      pattern="\d{4}-\d{2}-\d{2}"
                    />
                  </label>
                </div>
              </div>

              <button type="submit" className="submit">
                Save changes
              </button>
            </form>
          </div>
          <button
            onClick={() => setChangeDatePopup(false)}
            className="closeButton"
          >
            x
          </button>
        </div>
      </div>
    </div>
  );
}
