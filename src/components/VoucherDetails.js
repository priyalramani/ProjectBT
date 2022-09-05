import { useState, useEffect, useRef, useCallback } from "react";
import axios from "axios";
import Select from "react-select";
import { v4 as uuid } from "uuid";
import { jumpToNextIndex } from "../Apis/functions";
import { CheckCircle } from "@mui/icons-material";
import { useReactToPrint } from "react-to-print";
import { AddCircle as AddIcon, RemoveCircle } from "@mui/icons-material";
import OrderPrint from "./OrderPrint";

export default function VoucherDetails({ order, onSave, orderStatus }) {
  const [counters, setCounters] = useState([]);
  const [itemsData, setItemsData] = useState([]);
  const [editOrder, setEditOrder] = useState(false);
  const [category, setCategory] = useState([]);

  const [orderData, setOrderData] = useState();
  const [printData, setPrintData] = useState({ item_details: [], status: [] });

  const [users, setUsers] = useState([]);

  const [focusedInputId, setFocusedInputId] = useState(0);
  const reactInputsRef = useRef({});
  const componentRef = useRef(null);
  const getItemCategories = async () => {
    const response = await axios({
      method: "get",
      url: "/itemCategories/GetItemCategoryList",

      headers: {
        "Content-Type": "application/json",
      },
    });
    if (response.data.success) setCategory(response.data.result);
  };
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

  const reactToPrintContent = useCallback(() => {
    return componentRef.current;
  }, []);

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
    getItemCategories();
  }, []);

  const onSubmit = async (type = { stage: 0 }) => {
    const response = await axios({
      method: "put",
      url: "/vouchers/PutVoucher",
      data: {
        voucher_uuid: orderData?.voucher_uuid,
        item_details: orderData?.item_details,
      },
      headers: {
        "Content-Type": "application/json",
      },
    });
    if (response.data.success) {
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
              <div
                className="inventory_header"
                style={{ backgroundColor: "#fff", color: "#000" }}
              >
                <h2>From:{orderData?.from_warehouse_title || ""}</h2>
                <h2>To:{orderData?.to_warehouse_title || ""}</h2>
              </div>
              <div className="inventory_header">
                <h2>Voucher Details</h2>
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
                  <button
                    style={{ width: "fit-Content", backgroundColor: "black" }}
                    className="item-sales-search"
                    onClick={() => {
                      handlePrint();
                    }}
                  >
                    Print
                  </button>

                  {+orderData?.delivered === 0 ? (
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
                  ) : (
                    ""
                  )}
                </div>
              </div>

              <div
                className="items_table"
                style={{ flex: "1", paddingLeft: "10px" }}
              >
                <table className="f6 w-100 center" cellSpacing="0">
                  <thead className="lh-copy" style={{ position: "static" }}>
                    <tr className="white">
                      <th className="pa2 tl bb b--black-20 w-30">Sr.</th>
                      <th className="pa2 tl bb b--black-20 w-30">Item Name</th>
                      <th className="pa2 tl bb b--black-20 w-30">MRP</th>

                      <th className="pa2 tc bb b--black-20">Quantity(b)</th>
                      <th className="pa2 tc bb b--black-20">Quantity(p)</th>

                      {editOrder ? (
                        <>
                          <th className="pa2 tc bb b--black-20 "></th>
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
                                      a?.item_title?.localeCompare(b.item_title)
                                    )
                                    .map((a, j) => ({
                                      value: a.item_uuid,
                                      label: a.item_title + "______" + a.mrp,
                                      key: a.item_uuid,
                                    }))}
                                  onChange={(e) => {
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
                                { uuid: uuid(), b: 0, p: 0, edit: true },
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
                        <div className="inputGroup"></div>
                      </td>
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
                              .map((a) => +a?.b || 0)
                              .reduce((a, b) => a + b)
                          : orderData?.item_details[0]?.b) || 0}
                      </td>
                      <td
                        className="ph2 pv1 tc bb b--black-20 bg-white"
                        style={{ textAlign: "center" }}
                      >
                        {(orderData?.item_details.length > 1
                          ? orderData?.item_details
                              .map((a) => +a?.p || 0)
                              .reduce((a, b) => a + b)
                          : orderData?.item_details[0]?.p) || 0}
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
              justifyContent: "center",
              paddingTop: "20px",
            }}
          >
            {editOrder ? (
              <button type="button" onClick={onSubmit}>
                Save
              </button>
            ) : (
              ""
            )}
          </div>
        </div>
      </div>

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
          style={{
            // margin: "45mm 40mm 30mm 60mm",
            // textAlign: "center",
            height: "128mm",
            // padding: "10px"
          }}
        >
          <table
            className="user-table"
            style={{
              width: "170mm",
              // marginTop: "20mm",
              // marginLeft: "20mm",
              // marginRight: "20mm",
              border: "1px solid black",
              pageBreakInside: "auto",
              display: "block",
              fontSize: "small",
              fontWeight: "bolder",
            }}
          >
            <thead>
              <tr>
                <th
                  colSpan={2}
                  style={{
                    width: "84mm",
                    backgroundColor: "#fff",
                  }}
                >
                  From: {orderData?.from_warehouse_title}
                </th>
                <th
                  colSpan={3}
                  style={{
                    width: "85mm",
                    backgroundColor: "#fff",
                  }}
                >
                  To: {orderData?.to_warehouse_title}
                </th>
              </tr>
              <tr>
                <th colSpan={2} style={{ backgroundColor: "#fff" }}>
                  Created At: {new Date(orderData?.created_at).toDateString()} -{" "}
                  {formatAMPM(new Date(orderData?.created_at))}
                </th>
                <th colSpan={3} style={{ backgroundColor: "#fff" }}>
                  Created By: {orderData?.created_by_user}
                </th>
              </tr>
              <tr>
                <th style={{ width: "10mm", backgroundColor: "#fff" }}>S.N</th>
                <th style={{ backgroundColor: "#fff" }}>Item Name</th>
                <th style={{ backgroundColor: "#fff" }}>MRP</th>
                <th style={{ backgroundColor: "#fff" }}>Box</th>
                <th style={{ backgroundColor: "#fff" }}>Pcs</th>
              </tr>
            </thead>
            <tbody className="tbody">
             
              {category
    
                .filter(
                  (a) =>
                  orderData?.item_details?.filter(
                      (b) => a.category_uuid === b.category_uuid
                    ).length
                )
                .map((a,index) => (
                  <>
                    <tr style={{ pageBreakAfter: "always", width: "100%" }}>
                      <td colSpan={11}>{a.category_title}</td>
                    </tr>
                    {orderData?.item_details?.map((item, i, array) => (
                      <tr key={Math.random()}>
                        <td
                          className="flex"
                          style={{ justifyContent: "space-between" }}
                        >
                          {i + 1}
                        </td>

                        <td>{item.item_title || ""}</td>
                        <td>{item.mrp || 0}</td>
                        <td>{item.b || 0}</td>

                        <td>{item.p || 0}</td>
                      </tr>
                    ))}
                  </>
                ))}
              <tr key={Math.random()}>
                <td
                  className="flex"
                  style={{ justifyContent: "space-between" }}
                ></td>

                <td>Total</td>
                <td></td>
                <td>
                  {orderData?.item_details?.length > 1
                    ? orderData?.item_details
                        ?.map((a) => +a.b || 0)
                        ?.reduce((a, b) => +a + b)
                    : orderData?.item_details[0]?.b || 0}
                </td>

                <td>
                  {orderData?.item_details?.length > 1
                    ? orderData?.item_details
                        ?.map((a) => +a.p || 0)
                        ?.reduce((a, b) => +a + b)
                    : orderData?.item_details[0]?.p || 0}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
