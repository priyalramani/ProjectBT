import axios from "axios";
import { useEffect, useState } from "react";
import Header from "../../components/Header";
import Sidebar from "../../components/Sidebar";
import "./index.css";
import { Billing, AutoAdd } from "../../functions";
import { AddCircle as AddIcon } from "@mui/icons-material";
import { v4 as uuid } from "uuid";
export default function AddOrder() {
  const [counters, setCounters] = useState([]);
  const [itemsData, setItemsData] = useState([]);
  const [qty_details, setQtyDetails] = useState(false);
  const [popup, setPopup] = useState(false);
  const [autoBills, setAutoBills] = useState([]);
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
    if (response1.data.success) data = [...data, ...response1];
    setAutoBills(data)
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
  const [order, setOrder] = useState({
    counter_uuid: "",
    item_details: [{ uuid: uuid(), b: 0, p: 0 }],
  });

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
  }, []);
  console.log(order);
  useEffect(() => {
    setOrder((prev) => ({
      ...prev,
      item_details: prev.item_details.map((a) => ({
        ...a,
        b: +a.b + parseInt(((+a.p || 0) / +a.conversion)||0),
        p: +a.p % +a.conversion,
      })),
    }));
  }, [qty_details]);
  const onSubmite = async (type) => {
    let counter = counters.find((a) => order.counter_uuid === a.counter_uuid);
    let data = {
      ...order,
      item_details: order.item_details.filter((a) => a.item_uuid),
    };
    if (type === "auto_add") {
      let autoAdd = await AutoAdd({
        counter,
        items: order.item_details,
        dbItems: order.item_details,
        autobills:autoBills,
      });
      data = { ...data, ...autoAdd, item_details: autoAdd.items };
    }
    let time = new Date();
    let autoBilling = await Billing(counter, data.item_details, {
      stage: 1,
      user_uuid: "240522",
      time: time.getTime(),

      type: "NEW",
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
      })),
      status: [
        {
          stage: data.others.stage,
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
  return (
    <>
      <Sidebar />
      <div className="right-side">
        <Header />
        <div className="inventory">
          <form
            className="accountGroup"
            id="voucherForm"
            action=""
            onSubmit={(e) => {
              e.preventDefault();
              if (!order.item_details.filter((a) => a.item_uuid).length) return;
              setPopup(true);
            }}
          >
            <div className="inventory_header">
              <h2>Add Order </h2>
              {/* {type === 'edit' && <XIcon className='closeicon' onClick={close} />} */}
            </div>

            <div className="topInputs">
              <div className="inputGroup">
                <label htmlFor="Warehouse">Counter</label>
                <select
                  required
                  value={order.counter_uuid}
                  onChange={(e) =>
                    setOrder((prev) => ({
                      ...prev,
                      counter_uuid: e.target.value,
                    }))
                  }
                >
                  <option value="" disabled>
                    Select
                  </option>
                  {counters?.map((a, i) => (
                    <option key={a.counter_uuid} value={a.counter_uuid}>
                      {a.counter_title}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div
              className="items_table"
              style={{ flex: "1", paddingLeft: "10px", height: "auto" }}
            >
              <table className="f6 w-100 center" cellSpacing="0">
                <thead className="lh-copy" style={{ position: "static" }}>
                  <tr className="white">
                    <th className="pa2 tl bb b--black-20 w-30">Item Name</th>
                    <th className="pa2 tc bb b--black-20">Quantity(b)</th>
                    <th className="pa2 tc bb b--black-20">Quantity(p)</th>
                    <th className="pa2 tc bb b--black-20 ">Price</th>
                  </tr>
                </thead>{" "}
                {order.counter_uuid ? (
                  <tbody className="lh-copy">
                    {order?.item_details?.map((item, i) => {
                      return (
                        <tr key={i}>
                          <td className="ph2 pv1 tl bb b--black-20 bg-white">
                            <div className="inputGroup">
                              <select
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
                                              (b) =>
                                                b.item_uuid === e.target.value
                                            ),
                                          }
                                        : a
                                    ),
                                  }));
                                }}
                                value={item?.item_uuid || null}
                                menuPosition="fixed"
                                menuPlacement="auto"
                                placeholder="Item"
                              >
                                <option value="" disabled>
                                  Select
                                </option>
                                {itemsData.map((a, j) => (
                                  <option value={a.item_uuid}>
                                    {a.item_title}
                                  </option>
                                ))}
                              </select>
                            </div>
                          </td>
                          <td
                            className="ph2 pv1 tc bb b--black-20 bg-white"
                            style={{ textAlign: "center" }}
                          >
                            <input
                              id="Quantity"
                              type="number"
                              className="numberInput"
                              min={1}
                              onKeyDown={(event) => {
                                if (
                                  event.keyCode === 38 ||
                                  event.keyCode === 40
                                )
                                  event.preventDefault();
                              }}
                              onWheel={(e) => e.preventDefault()}
                              value={item.b}
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
                              disabled={!item.item_uuid}
                            />
                          </td>
                          <td
                            className="ph2 pv1 tc bb b--black-20 bg-white"
                            style={{ textAlign: "center" }}
                          >
                            <input
                              id="Quantity"
                              type="number"
                              className="numberInput"
                              min={1}
                              onKeyDown={(event) => {
                                if (
                                  event.keyCode === 38 ||
                                  event.keyCode === 40
                                )
                                  event.preventDefault();
                              }}
                              onWheel={(e) => e.preventDefault()}
                              value={item.p}
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
                              disabled={!item.item_uuid}
                            />
                          </td>
                          <td
                            className="ph2 pv1 tc bb b--black-20 bg-white"
                            style={{ textAlign: "center" }}
                          >
                            <input
                              id="Quantity"
                              type="text"
                              className="numberInput"
                              min={1}
                              onKeyDown={(event) => {
                                if (
                                  event.keyCode === 38 ||
                                  event.keyCode === 40
                                )
                                  event.preventDefault();
                              }}
                              onWheel={(e) => e.preventDefault()}
                              value={"Rs " + (item?.item_price || 0)}
                            />
                          </td>
                        </tr>
                      );
                    })}
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

            {/* <div className="topInputs">
        <textarea
          placeholder="Narration (Displayed)...."
          disabled={(type !== 'edit' || editValues) ? false : true}
          maxLength="200"
          value={data.voucher_narration}
          onChange={e => setData({
            ...data,
            voucher_narration: e.target.value,
          })}
        ></textarea>
        <textarea
          placeholder="Remarks (Not Displayed)...."
          disabled={(type !== 'edit' || editValues) ? false : true}
          maxLength="200"
          value={data.voucher_remarks}
          onChange={e => setData({
            ...data,
            voucher_remarks: e.target.value,
          })}
        ></textarea>
      </div> */}

            <div className="bottomContent">
              <button type="submit">Bill</button>
            </div>
          </form>
        </div>
      </div>
      {popup ? (
        <NewUserForm onClose={() => setPopup(false)} onSubmit={onSubmite} />
      ) : (
        ""
      )}
    </>
  );
}
function NewUserForm({ onSubmit, onClose }) {
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
                onSubmit("auto_add");
                onClose();
              }}
            >
              <div className="row">
                <h1> Auto Add</h1>
              </div>

              <div className="formGroup">
                <div className="row">
                  <button type="submit" className="submit">
                    Yes
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      onSubmit();
                    }}
                    className="submit"
                  >
                    No
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
