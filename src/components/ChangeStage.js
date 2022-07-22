import axios from "axios";
import React, { useEffect, useState } from "react";
import { Billing } from "../functions";

const ChangeStage = ({ onClose, orders, stage, counters, items }) => {
  const [data, setData] = useState({ stage: stage + 1 });
  const [deliveryPopup, setDeliveryPopup] = useState(false);
  const onSubmit = async (selectedData = orders) => {
    console.log(selectedData);
    let user_uuid = localStorage.getItem("user_uuid");
    let time = new Date();
    console.log(stage, data);
    let status =
      +data.stage === 0
        ? []
        : stage === 1
        ? +data.stage === 2
          ? [{ stage: 2, time: time.getTime(), user_uuid }]
          : +data.stage === 3
          ? [
              { stage: 2, time: time.getTime(), user_uuid },
              { stage: 3, time: time.getTime(), user_uuid },
            ]
          : +data.stage === 4
          ? [
              { stage: 2, time: time.getTime(), user_uuid },
              { stage: 3, time: time.getTime(), user_uuid },
              { stage: 4, time: time.getTime(), user_uuid },
            ]
          : [
              { stage: 2, time: time.getTime(), user_uuid },
              { stage: 3, time: time.getTime(), user_uuid },
              { stage: 4, time: time.getTime(), user_uuid },
              { stage: 5, time: time.getTime(), user_uuid },
            ]
        : stage === 2
        ? +data.stage === 3
          ? [{ stage: 3, time: time.getTime(), user_uuid }]
          : +data.stage === 4
          ? [
              { stage: 3, time: time.getTime(), user_uuid },
              { stage: 4, time: time.getTime(), user_uuid },
            ]
          : [
              { stage: 3, time: time.getTime(), user_uuid },
              { stage: 4, time: time.getTime(), user_uuid },
              { stage: 5, time: time.getTime(), user_uuid },
            ]
        : stage === 3
        ? +data.stage === 4
          ? [{ stage: 4, time: time.getTime(), user_uuid }]
          : [
              { stage: 4, time: time.getTime(), user_uuid },
              { stage: 5, time: time.getTime(), user_uuid },
            ]
        : [{ stage: 5, time: time.getTime(), user_uuid }];
    selectedData = selectedData?.map((a) => ({
      ...a,
      status: +data.stage === 0 ? a.status : [...a.status, ...status],
      hold: +data.stage === 0 ? "Y" : a.hold || "N",
    }));

    console.log(selectedData);
    if (+data.stage === 5) {
      let orderData = [];
      for (let obj of selectedData) {
        obj = {
          ...obj,

          processing_canceled:
            +stage === 2
              ? obj.processing_canceled.length
                ? [...obj.processing_canceled, ...obj.item_details]
                : obj.item_details
              : obj.processing_canceled || [],
          delivery_return:
            +stage === 4
              ? obj.delivery_return.length
                ? [...obj.delivery_return, ...obj.item_details]
                : obj.item_details
              : obj.delivery_return || [],
          item_details: obj.item_details.map((a) => ({
            ...a,
            b: 0,
            p: 0,
          })),
        };

        let billingData = await Billing({
          replacement: obj.replacement,
          counter: counters.find((a) => a.counter_uuid === obj.counter_uuid),
          ////add_discounts: true,
          items: obj.item_details.map((a) => {
            let itemData = items.find((b) => a.item_uuid === b.item_uuid);
            return {
              ...itemData,
              ...a,
            };
          }),
        });
        orderData.push({
          ...obj,
          ...billingData,
          item_details: billingData.items,
        });
      }
      const response = await axios({
        method: "put",
        url: "/orders/putOrders",
        data: orderData,
        headers: {
          "Content-Type": "application/json",
        },
      });
      if (response.data.success) {
        onClose();
      }

      return;
    }
    const response = await axios({
      method: "put",
      url: "/orders/putOrders",
      data: selectedData,
      headers: {
        "Content-Type": "application/json",
      },
    });
    if (response.data.success) {
      onClose();
    }
  };
  console.log(stage);
  return (
    <>
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
                  if (data.stage === 4) {
                    setDeliveryPopup(true);
                  } else onSubmit();
                }}
              >
                <div className="formGroup">
                  <div className="row">
                    <h3>Stage</h3>
                    <div
                      style={{
                        textDecoration: stage >= 1 ? "line-through" : "",
                      }}
                      onClick={() => {
                        if (stage >= 1) return;
                        setData({ ...data, stage: 1 });
                      }}
                    >
                      <input type="radio" checked={data.stage === 1} />
                      Processing
                    </div>
                    <div
                      style={{
                        textDecoration: stage >= 2 ? "line-through" : "",
                      }}
                      onClick={() => {
                        if (stage >= 2) return;
                        setData({ ...data, stage: 2 });
                      }}
                    >
                      <input type="radio" checked={data.stage === 2} />
                      Checking
                    </div>
                    <div
                      style={{
                        textDecoration: stage >= 3 ? "line-through" : "",
                      }}
                      onClick={() => {
                        if (stage >= 3) return;
                        setData({ ...data, stage: 3 });
                      }}
                    >
                      <input type="radio" checked={data.stage === 3} />
                      Delivery
                    </div>
                    <div
                      style={{
                        textDecoration: stage >= 4 ? "line-through" : "",
                      }}
                      onClick={() => {
                        if (stage >= 4) return;
                        setData({ ...data, stage: 4 });
                      }}
                    >
                      <input type="radio" checked={data.stage === 4} />
                      Complete
                    </div>
                    <div
                      onClick={() => {
                        setData({ ...data, stage: 0 });
                      }}
                    >
                      <input type="radio" checked={data.stage === 0} />
                      Hold
                    </div>
                    <div
                      style={{
                        textDecoration: stage >= 5 ? "line-through" : "",
                      }}
                      onClick={() => {
                        if (stage >= 5) return;
                        setData({ ...data, stage: 5 });
                      }}
                    >
                      <input type="radio" checked={data.stage === 5} />
                      Cancel
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
      {deliveryPopup ? (
        <DiliveryPopup
          onSave={() => setDeliveryPopup(false)}
          postOrderData={onSubmit}
          orders={orders}
          counters={counters}
          items={items}
        />
      ) : (
        ""
      )}
    </>
  );
};

export default ChangeStage;
function DiliveryPopup({
  onSave,
  postOrderData,

  counters,
  items,
  orders,
}) {
  const [PaymentModes, setPaymentModes] = useState([]);
  const [modes, setModes] = useState([]);
  const [error, setError] = useState("");
  const [popup, setPopup] = useState(false);
  const [coinPopup, setCoinPopup] = useState(false);
  const [data, setData] = useState({});
  const [outstanding, setOutstanding] = useState({});
  const [count, setCount] = useState(0);
  const [order, setOrder] = useState({});
  useEffect(() => {
    setOrder(orders[0]);
  }, []);
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
      order_uuid: orders[count]?.order_uuid,
      amount: "",
      user_uuid: localStorage.getItem("user_uuid"),
      time: time.getTime(),
      invoice_number: order.invoice_number,
      trip_uuid: order.trip_uuid,
      counter_uuid: order.counter_uuid,
    });
    GetPaymentModes();
  }, [order]);
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
  const updateBillingAmount = async (selectedOrder) => {
    console.log(selectedOrder);
    let billingData = await Billing({
      replacement: selectedOrder.replacement,
      counter: counters.find(
        (a) => a.counter_uuid === selectedOrder.counter_uuid
      ),
      ////add_discounts: true,
      items: selectedOrder.item_details.map((a) => {
        let itemData = items.find((b) => a.item_uuid === b.item_uuid);
        return {
          ...itemData,
          ...a,
        };
      }),
    });
    setOrder((prev) => ({
      ...prev,
      ...selectedOrder,
      ...billingData,
      item_details: billingData.items,
    }));
  };

  const submitHandler = async () => {
    setError("");
    // let billingData = await Billing({
    //   replacement: data.actual,
    //   replacement_mrp: data.mrp,
    //   counter: counters.find((a) => a.counter_uuid === order.counter_uuid),
    //   items: order.item_details.map((a) => {
    //     let itemData = items.find((b) => a.item_uuid === b.item_uuid);
    //     return {
    //       ...itemData,
    //       ...a,
    //     };
    //   }),
    // });
    // let Tempdata = {
    //   ...order,
    //   ...billingData,
    //   item_details: billingData.items,
    // };
    let modeTotal = modes.map((a) => +a.amt || 0)?.reduce((a, b) => a + b);
    console.log(
      order?.order_grandtotal,
      +(+modeTotal + (+outstanding?.amount || 0))
    );
    if (
      +order?.order_grandtotal !== +(+modeTotal + (+outstanding?.amount || 0))
    ) {
      setError("Invoice Amount and Payment mismatch");
      return;
    }
    let obj = modes.find((a) => a.mode_title === "Cash");
    if (obj?.amt && obj?.coin === "") {
      setCoinPopup(true);
      return;
    }
    let time = new Date();
    obj = {
      user_uuid: localStorage.getItem("user_uuid"),
      time: time.getTime(),
      order_uuid: orders[count].order_uuid,
      counter_uuid: order.counter_uuid,
      trip_uuid: order.trip_uuid,
      modes,
    };
    const response = await axios({
      method: "post",
      url: "/receipts/postReceipt",
      data: obj,
      headers: {
        "Content-Type": "application/json",
      },
    });
    if (outstanding?.amount)
      await axios({
        method: "post",
        url: "/Outstanding/postOutstanding",
        data: outstanding,
        headers: {
          "Content-Type": "application/json",
        },
      });
    if (response.data.success) {
      if (count + 1 === orders.length) {
        postOrderData();
        onSave();
      } else {
        setOrder(orders[count + 1]);
        setCount((prev) => prev + 1);
        setData({});
        setCoinPopup(false);
      }
    }
  };
  return (
    <>
      <div className="overlay">
        <div
          className="modal"
          style={{ height: "fit-content", width: "400px" }}
        >
          <div className="flex" style={{ justifyContent: "space-between" }}>
            <h3>Payments</h3>
            <h3>Rs. {order?.order_grandtotal || 0}</h3>
          </div>
          <div className="flex" style={{ justifyContent: "space-between" }}>
            <h4>{order?.counter_title || ""}</h4>
            <h4>Invoice No.{order?.invoice_number || 0}</h4>
          </div>

          <div
            className="content"
            style={{
              height: "fit-content",
              padding: "10px",
              width: "100%",
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
                        // placeholder={
                        //   !order.credit_allowed === "Y" ? "Not Allowed" : ""
                        // }
                        style={{ width: "80px" }}
                        onChange={(e) =>
                          setOutstanding((prev) => ({
                            ...prev,
                            amount: e.target.value,
                          }))
                        }
                        // disabled={order.credit_allowed !== "Y"}
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
                      Replacement
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
            updateBillingAmount({
              ...order,
              replacement: data?.actual || 0,
              replacement_mrp: data?.mrp || 0,
            });
          }}
          setData={setData}
          data={data}
        />
      ) : (
        ""
      )}
      {coinPopup ? (
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
      )}
    </>
  );
}
function DiliveryReplaceMent({ onSave, data, setData }) {
  return (
    <div className="overlay">
      <div
        className="modal"
        style={{ height: "fit-content", width: "max-content" }}
      >
        <h2>Replacements</h2>
        <div
          className="content"
          style={{
            height: "fit-content",
            padding: "20px",
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
                  <div style={{ width: "50px" }}>MRP</div>
                  <label
                    className="selectLabel flex"
                    style={{ width: "100px" }}
                  >
                    <input
                      type="number"
                      name="route_title"
                      className="numberInput"
                      value={data.mrp}
                      style={{ width: "100px" }}
                      onChange={(e) =>
                        setData((prev) => ({
                          mrp: e.target.value,
                          actual: +e.target.value * 0.8,
                        }))
                      }
                      onWheel={(e) => e.preventDefault()}
                      maxLength={42}
                    />
                    {/* {popupInfo.conversion || 0} */}
                  </label>
                </div>
                <div
                  className="row"
                  style={{ flexDirection: "row", alignItems: "center" }}
                >
                  <div style={{ width: "50px" }}>Actual</div>
                  <label
                    className="selectLabel flex"
                    style={{ width: "100px" }}
                  >
                    <input
                      type="number"
                      name="route_title"
                      className="numberInput"
                      value={data.actual}
                      style={{ width: "100px" }}
                      onChange={(e) =>
                        setData((prev) => ({
                          actual: e.target.value,
                        }))
                      }
                      maxLength={42}
                      onWheel={(e) => e.preventDefault()}
                    />
                    {/* {popupInfo.conversion || 0} */}
                  </label>
                </div>
              </div>

              <div className="flex" style={{ justifyContent: "space-between" }}>
                <button
                  type="button"
                  style={{ backgroundColor: "red" }}
                  className="submit"
                  onClick={onSave}
                >
                  Cancel
                </button>
                <button type="button" className="submit" onClick={onSave}>
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
