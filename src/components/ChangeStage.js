import axios from "axios";
import React, { useEffect, useState } from "react";
import { Billing } from "../functions";

const ChangeStage = ({ onClose, orders, stage, counters, items }) => {
  const [data, setData] = useState({ stage: stage + 1 });
  const [deliveryPopup, setDeliveryPopup] = useState(false);
  const onSubmit = async () => {
    let user_uuid = localStorage.getItem("user_uuid");
    let time = new Date();
    let selectedData = orders;
    console.log(stage, data);
    let status =
      stage === 1
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
    selectedData = selectedData.map((a) => ({
      ...a,
      status: [...a.status, ...status],
    }));
    console.log(selectedData);
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
                  if (data.stage) {
                    setDeliveryPopup(true);
                  } else onSubmit(data);
                }}
              >
                <div className="formGroup">
                  <div className="row">
                    <h3>Stage</h3>
                    <div
                      style={{
                        textDecoration: stage >= 1 ? "line-through" : "",
                      }}
                    >
                      <input
                        type="radio"
                        checked={data.stage === 1}
                        onClick={() => {
                          if (stage >= 1) return;
                          setData({ ...data, stage: 1 });
                        }}
                      />
                      Processing
                    </div>
                    <div
                      style={{
                        textDecoration: stage >= 2 ? "line-through" : "",
                      }}
                    >
                      <input
                        type="radio"
                        checked={data.stage === 2}
                        onClick={() => {
                          if (stage >= 2) return;
                          setData({ ...data, stage: 2 });
                        }}
                      />
                      Checking
                    </div>
                    <div
                      style={{
                        textDecoration: stage >= 3 ? "line-through" : "",
                      }}
                    >
                      <input
                        type="radio"
                        checked={data.stage === 3}
                        onClick={() => {
                          if (stage >= 3) return;
                          setData({ ...data, stage: 3 });
                        }}
                      />
                      Delivery
                    </div>
                    <div
                      style={{
                        textDecoration: stage >= 4 ? "line-through" : "",
                      }}
                    >
                      <input
                        type="radio"
                        checked={data.stage === 4}
                        onClick={() => {
                          if (stage >= 4) return;
                          setData({ ...data, stage: 4 });
                        }}
                      />
                      Complete
                    </div>
                    <div
                      style={{
                        textDecoration: stage >= 5 ? "line-through" : "",
                      }}
                    >
                      <input
                        type="radio"
                        checked={data.stage === 5}
                        onClick={() => {
                          if (stage >= 5) return;
                          setData({ ...data, stage: 5 });
                        }}
                      />
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
          onSave={() => {
            setDeliveryPopup(false);
          }}
          postOrderData={onSubmit}
          orders={orders}
          credit_allowed="Y"
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
function DiliveryPopup({ onSave, postOrderData, orders, credit_allowed }) {
  const [PaymentModes, setPaymentModes] = useState([]);
  const [modes, setModes] = useState([]);
  const [error, setError] = useState("");
  const [popup, setPopup] = useState(false);
  const [coinPopup, setCoinPopup] = useState(false);
  const [data, setData] = useState({});
  const [outstanding, setOutstanding] = useState({});
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
      amount: "",
      user_uuid: localStorage.getItem("user_uuid"),
      time: time.getTime(),
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
    for (let order of orders) {
      // let billingData = await Billing({
      //   replacement: order.replacement,
      //   counter: counters.find((a) => a.counter_uuid === order.counter_uuid),

      //   items: order.item_details.map((a) => {
      //     let itemData = items.find((b) => a.item_uuid === b.item_uuid);
      //     return {
      //       ...itemData,
      //       ...a,
      //       price: itemData?.price || 0,
      //     };
      //   }),
      // });
      // let Tempdata = {
      //   ...order,
      //   ...billingData,
      //   item_details: billingData.items,
      //   replacement: data.actual,
      //   replacement_mrp: data.mrp,
      // };
      // let modeTotal = modes.map((a) => +a.amt || 0)?.reduce((a, b) => a + b);
      // console.log(
      //   Tempdata?.order_grandtotal,
      //   +(+modeTotal + (+outstanding?.amount || 0))
      // );
      // if (
      //   Tempdata?.order_grandtotal !==
      //   +(+modeTotal + (+outstanding?.amount || 0))
      // ) {
      //   setError("Invoice Amount and Payment mismatch");
      //   return;
      // }
      let obj = modes.find((a) => a.mode_title === "Cash");
      if (obj?.amt && obj?.coin === "") {
        setCoinPopup(true);
        return;
      }
      let time = new Date();
      obj = {
        user_uuid: localStorage.getItem("user_uuid"),
        time: time.getTime(),
        order_uuid:order.order_uuid,
        counter_uuid: order.counter_uuid,
        trip_uuid: order.trip_uuid,
        modes,
      };
      await axios({
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
          data: {
            ...outstanding,
            order_uuid: order.order_uuid,
            invoice_number: order.invoice_number,
            trip_uuid: order.trip_uuid,
            counter_uuid: order.counter_uuid,
          },
          headers: {
            "Content-Type": "application/json",
          },
        });
    }

    postOrderData();
    onSave();
  };
  return (
    <>
      <div className="overlay">
        <div
          className="modal"
          style={{ height: "fit-content", width: "max-content" }}
        >
          <h3>Payments</h3>
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
                        disabled={credit_allowed !== "Y"}
                        maxLength={42}
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
          onSave={() => setPopup(false)}
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
