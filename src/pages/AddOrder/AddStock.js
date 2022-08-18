/* eslint-disable react-hooks/exhaustive-deps */
import axios from "axios";
import { useCallback, useEffect, useRef, useState } from "react";
import Header from "../../components/Header";
import Sidebar from "../../components/Sidebar";
import "./index.css";

import { AddCircle as AddIcon } from "@mui/icons-material";
import { v4 as uuid } from "uuid";
import Select from "react-select";

import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import { useReactToPrint } from "react-to-print";
let time = new Date();
const initials = {
  type: "ST",
  created_by: localStorage.getItem("user_uuid"),
  from_warehouse: 0,
  to_warehouse: "",
  created_at: time.getTime(),
  item_details: [{ uuid: uuid(), b: 0, p: 0, sr: 1 }],
};
export default function AddStock() {
  const [order, setOrder] = useState(initials);

  const [warehouse, setWarehouse] = useState([]);
  const [counterFilter] = useState("");

  // const selectRef = useRef();
  const [itemsData, setItemsData] = useState([]);
  const [qty_details, setQtyDetails] = useState(false);

  const reactInputsRef = useRef({});
  const [focusedInputId, setFocusedInputId] = useState(0);
  const componentRef = useRef(null);
  const reactToPrintContent = useCallback(() => {
    return componentRef.current;
  }, []);
  const handlePrint = useReactToPrint({
    content: reactToPrintContent,
    documentTitle: "Statement",
    removeAfterPrint: true,
  });
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
  const GetWarehouseList = async () => {
    const response = await axios({
      method: "get",
      url: "/warehouse/GetWarehouseList",

      headers: {
        "Content-Type": "application/json",
      },
    });
    if (response.data.success)
      setWarehouse(response.data.result.filter((a) => a.warehouse_title));
  };

  useEffect(() => {
    GetWarehouseList();
    getItemsData();
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
    const response = await axios({
      method: "post",
      url: "/vouchers/postVoucher",
      data: order,
      headers: {
        "Content-Type": "application/json",
      },
    });
    console.log(response);
    if (response.data.success) {
      handlePrint();
      setOrder(initials);
    }
  };

  const jumpToNextIndex = (id) => {
    //console.log(id);
    document.querySelector(`#${id}`).blur();
    const index = document.querySelector(`#${id}`).getAttribute("index");
    //console.log("this is index", index);

    const nextElem = document.querySelector(`[index="${+index + 1}"]`);

    if (nextElem) {
      if (nextElem.id.includes("selectContainer-")) {
        //console.log("next select container id: ", nextElem.id);
        reactInputsRef.current[
          nextElem.id.replace("selectContainer-", "")
        ].focus();
      } else {
        //console.log("next input id: ", nextElem.id);
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
              <h2>Stock Transfer </h2>
              {/* {type === 'edit' && <XIcon className='closeicon' onClick={close} />} */}
            </div>

            <div className="topInputs">
              <div className="inputGroup">
                <label htmlFor="Warehouse">From Warehouse</label>
                <div className="inputGroup" style={{ width: "500px" }}>
                  <Select
                    ref={(ref) => (reactInputsRef.current["0"] = ref)}
                    options={[
                      { value: 0, label: "None" },
                      ...warehouse.map((a) => ({
                        value: a.warehouse_uuid,
                        label: a.warehouse_title,
                      })),
                    ]}
                    onChange={(doc) =>
                      setOrder((prev) => ({
                        ...prev,
                        from_warehouse: doc.value,
                      }))
                    }
                    value={
                      order?.from_warehouse
                        ? {
                            value: order?.from_warehouse,
                            label: warehouse?.find(
                              (j) => j.warehouse_uuid === order.from_warehouse
                            )?.warehouse_title,
                          }
                        : { value: 0, label: "None" }
                    }
                    // autoFocus={!order?.from_warehouse}
                    openMenuOnFocus={true}
                    menuPosition="fixed"
                    menuPlacement="auto"
                    placeholder="Select"
                  />
                </div>
              </div>
              <div className="inputGroup">
                <label htmlFor="Warehouse">To Warehouse</label>
                <div className="inputGroup" style={{ width: "500px" }}>
                  <Select
                    ref={(ref) => (reactInputsRef.current["1"] = ref)}
                    options={warehouse
                      ?.filter(
                        (a) =>
                          !counterFilter ||
                          a.warehouse_title
                            .toLocaleLowerCase()
                            .includes(counterFilter.toLocaleLowerCase())
                      )
                      .map((a) => ({
                        value: a.warehouse_uuid,
                        label: a.warehouse_title,
                      }))}
                    onChange={(doc) =>
                      setOrder((prev) => ({ ...prev, to_warehouse: doc.value }))
                    }
                    value={
                      order?.to_warehouse
                        ? {
                            value: order?.to_warehouse,
                            label: warehouse?.find(
                              (j) => j.warehouse_uuid === order.to_warehouse
                            )?.warehouse_title,
                          }
                        : ""
                    }
                    autoFocus={!order?.to_warehouse}
                    openMenuOnFocus={true}
                    menuPosition="fixed"
                    menuPlacement="auto"
                    placeholder="Select"
                  />
                </div>
              </div>
            </div>

            <div className="items_table" style={{ flex: "1", height: "auto" }}>
              <table className="f6 w-100 center" cellSpacing="0">
                <thead className="lh-copy" style={{ position: "static" }}>
                  <tr className="white">
                    <th className="pa2 tl bb b--black-20 w-30">Item Name</th>
                    <th className="pa2 tc bb b--black-20">Boxes</th>
                    <th className="pa2 tc bb b--black-20">Pcs</th>

                    <th className="pa2 tc bb b--black-20 "></th>
                  </tr>
                </thead>
                {order.to_warehouse ? (
                  <tbody className="lh-copy">
                    {order?.item_details?.map((item, i) => (
                      <tr key={item.uuid}>
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
                                setTimeout(
                                  () => setQtyDetails((prev) => !prev),
                                  2000
                                );
                                setOrder((prev) => ({
                                  ...prev,
                                  item_details: prev.item_details.map((a) => {
                                    if (a.uuid === item.uuid) {
                                      let item = itemsData.find(
                                        (b) => b.item_uuid === e.value
                                      );
                                      return {
                                        ...a,
                                        ...item,
                                        p_price: item.item_price,
                                        b_price: (
                                          item.item_price * item.conversion || 0
                                        ).toFixed(0),
                                      };
                                    } else return a;
                                  }),
                                }));
                                jumpToNextIndex(`selectContainer-${item.uuid}`);
                              }}
                              value={
                                itemsData
                                  .sort((a, b) =>
                                    a?.item_title?.localeCompare(b.item_title)
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
                          <DeleteOutlineIcon
                            style={{ color: "red", cursor: "pointer" }}
                            onClick={() => {
                              setOrder({
                                ...order,
                                item_details: order.item_details.filter(
                                  (a) => a.uuid !== item.uuid
                                ),
                              });
                              //console.log(item);
                            }}
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
                  onSubmit();
                }}
              >
                Save
              </button>
            </div>
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
            }}
          >
            <thead>
              <tr>
                <th
                  colSpan={2}
                  style={{
                    width: "85mm",
                  }}
                >
                  From: {order?.from_warehouse_title}
                </th>
                <th
                  colSpan={2}
                  style={{
                    width: "85mm",
                  }}
                >
                  To: {order?.to_warehouse_title}
                </th>
              </tr>
              <tr>
                <th colSpan={2}>
                  Created At: {new Date(order?.created_at).toDateString()} -{" "}
                  {formatAMPM(new Date(order?.created_at))}
                </th>
                <th colSpan={2}>Created By: {order?.created_by_user}</th>
              </tr>
              <tr>
                <th style={{ width: "10mm" }}>S.N</th>
                <th>Item Name</th>
                <th>Box</th>
                <th>Pcs</th>
              </tr>
            </thead>
            <tbody className="tbody">
              {order?.item_details?.map((item, i, array) => (
                <tr key={Math.random()}>
                  <td
                    className="flex"
                    style={{ justifyContent: "space-between" }}
                  >
                    {i + 1}
                  </td>

                  <td>{item.item_title || ""}</td>
                  <td>{item.b || 0}</td>

                  <td>{item.p || 0}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
