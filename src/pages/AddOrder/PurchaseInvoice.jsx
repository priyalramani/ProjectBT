/* eslint-disable react-hooks/exhaustive-deps */
import axios from "axios";
import { useEffect, useRef, useState, useContext } from "react";
import Header from "../../components/Header";
import Sidebar from "../../components/Sidebar";
import "./index.css";
import { Billing } from "../../Apis/functions";
import { AddCircle as AddIcon } from "@mui/icons-material";
import { v4 as uuid } from "uuid";
import Select from "react-select";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import { FaSave } from "react-icons/fa";
import { IoCheckmarkDoneOutline } from "react-icons/io5";
import Context from "../../context/context";

const customStyles = {
  option: (provided, state) => ({
    ...provided,
    backgroundColor: state.data.isHighlighted
      ? "red"
      : provided.backgroundColor,
    color: state.data.isHighlighted ? "white" : provided.color,
  }),
};

const CovertedQty = (qty, conversion) => {
  let b = qty / +conversion;
  b = Math.sign(b) * Math.floor(Math.sign(b) * b);
  let p = Math.floor(qty % +conversion);
  return b + ":" + p;
};

const rateTypeOptions = [
  { label: "Before Tex", value: "bt" },
  { label: "After Tex", value: "at" },
];

export let getInititalValues = () => ({
  ledger_uuid: "",
  item_details: [{ uuid: uuid(), b: 0, p: 0, sr: 1 }],
  priority: 0,
  order_type: "I",
  rate_type: "at",
  party_number: "",
  time_1: 24 * 60 * 60 * 1000,
  time_2: (24 + 48) * 60 * 60 * 1000,
  warehouse_uuid: localStorage.getItem("warehouse")
    ? JSON.parse(localStorage.getItem("warehouse")) || ""
    : "",
});

export default function PurchaseInvoice() {
  const {
    getSpecialPrice,
    saveSpecialPrice,
    deleteSpecialPrice,
    spcPricePrompt,
    setNotification,
  } = useContext(Context);
  const [order, setOrder] = useState(getInititalValues());
  const [ledgerData, setLedgerData] = useState([]);
  const [counterFilter] = useState("");

  const [warehouse, setWarehouse] = useState([]);
  const [user_warehouse, setUser_warehouse] = useState([]);
  const [itemsData, setItemsData] = useState([]);
  const [autoBills, setAutoBills] = useState([]);
  const reactInputsRef = useRef({});
  const [focusedInputId, setFocusedInputId] = useState(0);
  const [edit_prices, setEditPrices] = useState([]);
  const [company, setCompanies] = useState([]);
  const [companyFilter, setCompanyFilter] = useState("all");
  const [remarks, setRemarks] = useState("");
  const fetchCompanies = async () => {
    try {
      const response = await axios.get("/companies/getCompanies");
      if (response?.data?.result?.[0]) setCompanies(response?.data?.result);
    } catch (error) {
      console.log(error);
    }
  };
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

  const GetUserWarehouse = async () => {
    const response = await axios({
      method: "get",
      url: "users/GetUser/" + localStorage.getItem("user_uuid"),

      headers: {
        "Content-Type": "application/json",
      },
    });
    if (response.data.success)
      setUser_warehouse(response.data.result.warehouse);
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
    if (response.data.success) data = response.data.result;
    const response1 = await axios({
      method: "get",
      url: "/autoBill/autoBillQty",

      headers: {
        "Content-Type": "application/json",
      },
    });
    if (response1.data.success)
      data = data.length
        ? response1.data.result.length
          ? [...data, ...response1.data.result]
          : data
        : response1.data.result.length
        ? response1.data.result
        : [];
    setAutoBills(data.filter((a) => a.status));
  };

  const getItemsData = async () => {
    const response = await axios({
      method: "get",
      url: "/items/GetItemStockList/" + order.warehouse_uuid,

      headers: {
        "Content-Type": "application/json",
      },
    });
    if (response.data.success) setItemsData(response.data.result);
  };

  const getCounter = async () => {
    const response = await axios({
      method: "get",
      url: "/ledger/getLedger",

      headers: {
        "Content-Type": "application/json",
      },
    });
    if (response.data.success)
      setLedgerData(
        response.data.result.filter(
          (a) => a.ledger_group_uuid === "004fd020-853c-4575-bebe-b29faefae3c9"
        )
      );
  };

  useEffect(() => {
    getCounter();
    getAutoBill();
    GetUserWarehouse();
    GetWarehouseList();
    fetchCompanies();
  }, []);

  useEffect(() => {
    console.log({ order });
    if (order?.warehouse_uuid) getItemsData();
  }, [order.warehouse_uuid]);
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

  const onSubmit = async (type, orderData = order) => {
    let counter = ledgerData.find((a) => order.ledger_uuid === a.ledger_uuid);
    let data = {
      ...orderData,
      item_details: order.item_details
        .filter((a) => a.item_uuid)
        .map((a) => ({
          ...a,
          item_price: a.p_price || a.item_price,
        })),
    };

    let time = new Date();
    let autoBilling = await Billing({
      creating_new: 1,
      order_uuid: data?.order_uuid,
      invoice_number: `${data?.order_type}${data?.invoice_number}`,
      replacement: data.replacement,
      adjustment: data.adjustment,
      shortage: data.shortage,
      counter,
      items: data.item_details.map((a) => ({
        ...a,
        item_price: a.p_price || a.item_price,
      })),
      others: {
        stage: 1,
        user_uuid: localStorage.getItem("user_uuid"),
        time: time.getTime(),

        type: "NEW",
      },
      add_discounts: true,
      edit_prices: edit_prices.map((a) => ({
        ...a,
        item_price: a.p_price,
      })),
    });

    data = {
      ...data,
      ...autoBilling,
      order_uuid: uuid(),
      opened_by: 0,
      item_details: autoBilling.items.map((a) => ({
        ...a,
        unit_price:
          a.item_total / (+(+a.conversion * a.b) + a.p + a.free) ||
          a.item_price ||
          a.price,
        gst_percentage: a.item_gst,
        status: 0,
        price:
          (a.price || a.item_price || 0) *
          (data.rate_type === "bt" ? 1 + a.item_gst / 100 : 1),
      })),
      ...(type.obj || {}),
    };

    data.time_1 = data.time_1 + Date.now();
    data.time_2 = data.time_2 + Date.now();

    console.log("orderJSon", data);

    const response = await axios({
      method: "post",
      url: "/purchaseInvoice/postAccountVoucher",
      data,
      headers: {
        "Content-Type": "application/json",
      },
    });
    console.log(response);
    if (response.data.success) {
      // window.location.reload();
      setOrder(getInititalValues());
    }
  };

  const callBilling = async (type = {}) => {
    if (!order.item_details.filter((a) => a.item_uuid).length) return;
    let counter = ledgerData.find((a) => order.ledger_uuid === a.ledger_uuid);
    let time = new Date();
    let autoBilling = await Billing({
      creating_new: 1,
      order_uuid: order?.order_uuid,
      invoice_number: `${order?.order_type}${order?.invoice_number}`,
      replacement: order.replacement,
      adjustment: order.adjustment,
      shortage: order.shortage,
      counter,
      items: order.item_details.map((a) => ({ ...a, item_price: a.p_price })),
      others: {
        stage: 1,
        user_uuid: localStorage.getItem("user_uuid"),
        time: time.getTime(),

        type: "NEW",
      },
      add_discounts: true,
      edit_prices: edit_prices.map((a) => ({
        ...a,
        item_price: a.p_price,
      })),
      ...type,
    });

    onSubmit(type, {
      ...order,
      ...autoBilling,
      ...type,
      item_details: autoBilling.items,
    });
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
    // setQuantity();
  };
  console.count("render");

  let listItemIndexCount = 0;

  const onItemPriceChange = async (e, item) => {
    if (e.target.value.toString().toLowerCase().includes("no special")) {
      await deleteSpecialPrice(item, order?.ledger_uuid, setLedgerData);
      e.target.value = +e.target.value
        .split("")
        .filter((i) => i)
        .filter((i) => +i || +i === 0)
        .join("");
    }
    setOrder((prev) => {
      return {
        ...prev,
        item_details: prev.item_details.map((a) =>
          a.uuid === item.uuid
            ? {
                ...a,
                p_price: e.target.value,
                b_price: (e.target.value * item.conversion || 0).toFixed(2),
              }
            : a
        ),
      };
    });
    setEditPrices((prev) =>
      prev.filter((a) => a.item_uuid === item.item_uuid).length
        ? prev.map((a) =>
            a.item_uuid === item.item_uuid
              ? {
                  ...a,
                  p_price: e.target.value,
                  b_price: (e.target.value * item.conversion || 0).toFixed(2),
                }
              : a
          )
        : prev.length
        ? [
            ...prev,
            {
              ...item,
              p_price: e.target.value,
              b_price: (e.target.value * item.conversion || 0).toFixed(2),
            },
          ]
        : [
            {
              ...item,
              p_price: e.target.value,
              b_price: (e.target.value * item.conversion || 0).toFixed(2),
            },
          ]
    );
  };

  const onPiecesKeyDown = (e, item) => {
    if (e.key === "Enter") jumpToNextIndex("p" + item.uuid);
    else if (e.key === "+") {
      e.preventDefault();
      setOrder((prev) => ({
        ...prev,
        item_details: prev?.item_details?.map((i) =>
          i.item_uuid === item.item_uuid
            ? { ...i, p: (+i.p || 0) + (+item?.one_pack || 0) }
            : i
        ),
      }));
    } else if (e.key === "-") {
      e.preventDefault();
      setOrder((prev) => ({
        ...prev,
        item_details: prev?.item_details?.map((i) =>
          i.item_uuid === item.item_uuid
            ? { ...i, p: (+i.p || 0) - (+item?.one_pack || 0) }
            : i
        ),
      }));
    }
  };
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
                  <Select
                    ref={(ref) => (reactInputsRef.current["0"] = ref)}
                    options={ledgerData
                      ?.filter(
                        (a) =>
                          !counterFilter ||
                          a.ledger_title
                            ?.toLocaleLowerCase()
                            ?.includes(counterFilter.toLocaleLowerCase())
                      )
                      .map((a) => ({
                        value: a.ledger_uuid,
                        label: a.ledger_title,
                      }))}
                    onChange={(doc) => {
                      setOrder((prev) => ({
                        ...prev,
                        ledger_uuid: doc?.value,
                      }));
                    }}
                    styles={customStyles}
                    value={
                      order?.ledger_uuid
                        ? {
                            value: order?.ledger_uuid,
                            label: ledgerData?.find(
                              (j) => j.ledger_uuid === order.ledger_uuid
                            )?.ledger_title,
                          }
                        : ""
                    }
                    autoFocus={!order?.ledger_uuid}
                    openMenuOnFocus={true}
                    menuPosition="fixed"
                    menuPlacement="auto"
                    placeholder="Select"
                  />
                </div>
              </div>
              <div className="inputGroup" style={{ width: "100px" }}>
                <label htmlFor="Warehouse">Warehouse</label>
                <div className="inputGroup">
                  <Select
                    options={[
                      { value: 0, label: "None" },
                      ...warehouse
                        .filter(
                          (a) =>
                            !user_warehouse.length ||
                            +user_warehouse[0] === 1 ||
                            user_warehouse.find((b) => b === a.warehouse_uuid)
                        )
                        .map((a) => ({
                          value: a.warehouse_uuid,
                          label: a.warehouse_title,
                        })),
                    ]}
                    onChange={(doc) =>
                      setOrder((prev) => ({
                        ...prev,
                        warehouse_uuid: doc.value,
                      }))
                    }
                    value={
                      order?.warehouse_uuid
                        ? {
                            value: order?.warehouse_uuid,
                            label: warehouse?.find(
                              (j) => j.warehouse_uuid === order.warehouse_uuid
                            )?.warehouse_title,
                          }
                        : { value: 0, label: "None" }
                    }
                    openMenuOnFocus={true}
                    menuPosition="fixed"
                    menuPlacement="auto"
                    placeholder="Select"
                  />
                </div>
              </div>

              <div className="inputGroup" style={{ width: "100px" }}>
                <label htmlFor="Warehouse">Company</label>
                <div className="inputGroup">
                  <Select
                    options={[
                      {
                        value: "all",
                        label: "All",
                      },
                      ...company
                        .filter((a) => +a.status)
                        .map((a) => ({
                          value: a.company_uuid,
                          label: a.company_title,
                        })),
                    ]}
                    onChange={(doc) => setCompanyFilter(doc?.value)}
                    value={[
                      {
                        value: "all",
                        label: "All",
                      },
                      ...company.map((a) => ({
                        value: a.company_uuid,
                        label: a.company_title,
                      })),
                    ].find((j) => j.value === companyFilter)}
                    openMenuOnFocus={true}
                    menuPosition="fixed"
                    menuPlacement="auto"
                    placeholder="Select Order Type"
                  />
                </div>
              </div>
              <div className="inputGroup" style={{ width: "100px" }}>
                <label htmlFor="Warehouse">Rate</label>
                <div className="inputGroup">
                  <Select
                    options={rateTypeOptions}
                    onChange={(doc) => {
                      setOrder((prev) => ({
                        ...prev,
                        rate_type: doc.value,
                      }));
                    }}
                    value={rateTypeOptions.find(
                      (j) => j.value === order.rate_type
                    )}
                    openMenuOnFocus={true}
                    menuPosition="fixed"
                    menuPlacement="auto"
                    placeholder="Select Order Type"
                  />
                </div>
              </div>
              <div className="inputGroup" style={{ width: "100px" }}>
                <label htmlFor="Warehouse">Party Invoice Number</label>
                <div className="inputGroup">
                  <input
                    style={{ width: "100px" }}
                    type="text"
                    className="numberInput"
                    onWheel={(e) => e.preventDefault()}
                    value={order.party_number || ""}
                    onChange={(e) => {
                      if (e.target.value.length <= 30)
                        setOrder((prev) => {
                          return {
                            ...prev,
                            party_number: e.target.value,
                          };
                        });
                    }}
                    onFocus={(e) => e.target.select()}
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
                    <th className="pa2 tl bb b--black-20 w-30">Item Name</th>
                    <th className="pa2 tc bb b--black-20">Boxes</th>
                    <th className="pa2 tc bb b--black-20">Pcs</th>
                    <th className="pa2 tc bb b--black-20 ">Price (pcs)</th>
                    <th className="pa2 tc bb b--black-20 ">Price (box)</th>
                    <th className="pa2 tc bb b--black-20 ">Dsc1</th>
                    <th className="pa2 tc bb b--black-20 ">desc2</th>

                    <th className="pa2 tc bb b--black-20 ">Special Price</th>
                    <th className="pa2 tc bb b--black-20 ">Item Total</th>

                    <th className="pa2 tc bb b--black-20 "></th>
                  </tr>
                </thead>
                {order.ledger_uuid ? (
                  <tbody className="lh-copy">
                    {order?.item_details?.map((item, i) => (
                      <tr
                        key={item.uuid}
                        item-billing-type={item?.billing_type}
                      >
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
                              options={itemsData
                                .filter(
                                  (a) =>
                                    !order?.item_details.filter(
                                      (b) => a.item_uuid === b.item_uuid
                                    ).length &&
                                    a.status !== 0 &&
                                    (companyFilter === "all" ||
                                      a.company_uuid === companyFilter)
                                )
                                .sort((a, b) =>
                                  a?.item_title?.localeCompare(b.item_title)
                                )
                                .map((a, j) => ({
                                  value: a.item_uuid,
                                  label:
                                    a.item_title +
                                    "______" +
                                    a.mrp +
                                    `, ${
                                      company.find(
                                        (b) => b.company_uuid === a.company_uuid
                                      )?.company_title
                                    }` +
                                    (a.qty > 0
                                      ? " _______[" +
                                        CovertedQty(a.qty || 0, a.conversion) +
                                        "]"
                                      : ""),
                                  key: a.item_uuid,
                                  qty: a.qty,
                                }))}
                              styles={{
                                option: (a, b) => {
                                  return {
                                    ...a,
                                    color:
                                      b.data.qty === 0
                                        ? ""
                                        : b.data.qty > 0
                                        ? "#4ac959"
                                        : "red",
                                  };
                                },
                              }}
                              onChange={(e) => {
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
                                        p_price: 0,
                                        charges_discount: [
                                          {
                                            title: "dsc1",
                                            value: 0,
                                          },
                                          {
                                            title: "dsc2",
                                            value: 0,
                                          },
                                        ],
                                        b_price: 0,
                                      };
                                    } else return a;
                                  }),
                                }));
                                jumpToNextIndex(`selectContainer-${item.uuid}`);
                              }}
                              value={
                                itemsData

                                  .filter((a) => a.item_uuid === item.uuid)
                                  .map((a, j) => ({
                                    value: a.item_uuid,
                                    label:
                                      a.item_title +
                                      "______" +
                                      a.mrp +
                                      `, ${
                                        company.find(
                                          (b) =>
                                            b.company_uuid === a.company_uuid
                                        )?.company_title
                                      }` +
                                      (a.qty > 0
                                        ? "[" +
                                          CovertedQty(
                                            a.qty || 0,
                                            a.conversion
                                          ) +
                                          "]"
                                        : ""),
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
                            onKeyDown={(e) => onPiecesKeyDown(e, item)}
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
                            value={item?.p_price || 0}
                            onChange={(e) => onItemPriceChange(e, item)}
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
                            value={item?.b_price}
                            onChange={(e) => {
                              setOrder((prev) => {
                                return {
                                  ...prev,
                                  item_details: prev.item_details.map((a) =>
                                    a.uuid === item.uuid
                                      ? {
                                          ...a,
                                          b_price: e.target.value,
                                          p_price: (
                                            e.target.value / item.conversion ||
                                            0
                                          ).toFixed(2),
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
                                            b_price: e.target.value,
                                            p_price: (
                                              e.target.value /
                                                item.conversion || 0
                                            ).toFixed(2),
                                          }
                                        : a
                                    )
                                  : prev.length
                                  ? [
                                      ...prev,
                                      {
                                        ...item,
                                        b_price: e.target.value,
                                        p_price: (
                                          e.target.value / item.conversion || 0
                                        ).toFixed(2),
                                      },
                                    ]
                                  : [
                                      {
                                        ...item,

                                        b_price: e.target.value,
                                        p_price: (
                                          e.target.value / item.conversion || 0
                                        ).toFixed(2),
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
                          <input
                            style={{ width: "100px" }}
                            type="number"
                            className="numberInput"
                            onWheel={(e) => e.preventDefault()}
                            value={
                              item?.charges_discount?.find(
                                (b) => b.title === "dsc1"
                              )?.value || ""
                            }
                            onChange={(e) => {
                              setOrder((prev) => {
                                return {
                                  ...prev,
                                  item_details: prev.item_details.map((a) =>
                                    a.uuid === item.uuid
                                      ? {
                                          ...a,
                                          charges_discount:
                                            a.charges_discount.map((b) =>
                                              b.title === "dsc1"
                                                ? {
                                                    ...b,
                                                    value: e.target.value,
                                                  }
                                                : b
                                            ),
                                        }
                                      : a
                                  ),
                                };
                              });
                            }}
                            onFocus={(e) => e.target.select()}
                            onKeyDown={(e) => onPiecesKeyDown(e, item)}
                            disabled={!item.item_uuid}
                          />
                        </td>
                        <td
                          className="ph2 pv1 tc bb b--black-20 bg-white"
                          style={{ textAlign: "center" }}
                        >
                          <input
                            style={{ width: "100px" }}
                            type="number"
                            className="numberInput"
                            onWheel={(e) => e.preventDefault()}
                            value={
                              item?.charges_discount?.find(
                                (b) => b.title === "dsc2"
                              )?.value || ""
                            }
                            onChange={(e) => {
                              setOrder((prev) => {
                                return {
                                  ...prev,
                                  item_details: prev.item_details.map((a) =>
                                    a.uuid === item.uuid
                                      ? {
                                          ...a,
                                          charges_discount:
                                            a.charges_discount.map((b) =>
                                              b.title === "dsc2"
                                                ? {
                                                    ...b,
                                                    value: e.target.value,
                                                  }
                                                : b
                                            ),
                                        }
                                      : a
                                  ),
                                };
                              });
                            }}
                            onFocus={(e) => e.target.select()}
                            onKeyDown={(e) => onPiecesKeyDown(e, item)}
                            disabled={!item.item_uuid}
                          />
                        </td>
                        <td className="ph2 pv1 tc bb b--black-20 bg-white">
                          {+item?.item_price !== +item?.p_price &&
                            (+getSpecialPrice(
                              ledgerData,
                              item,
                              order?.counter_uuid
                            )?.price === +item?.p_price ? (
                              <IoCheckmarkDoneOutline
                                className="table-icon checkmark"
                                onClick={() =>
                                  spcPricePrompt(
                                    item,
                                    order?.counter_uuid,
                                    setLedgerData
                                  )
                                }
                              />
                            ) : (
                              <FaSave
                                className="table-icon"
                                title="Save current price as special item price"
                                onClick={() =>
                                  saveSpecialPrice(
                                    item,
                                    order?.counter_uuid,
                                    setLedgerData
                                  )
                                }
                              />
                            ))}
                        </td>
                        <td
                          className="ph2 pv1 tc bb b--black-20 bg-white"
                          style={{ textAlign: "center" }}
                        >
                          {item?.item_total || ""}
                        </td>
                        <td
                          className="ph2 pv1 tc bb b--black-20 bg-white"
                          style={{ textAlign: "center" }}
                        >
                          <DeleteOutlineIcon
                            style={{ color: "red" }}
                            className="table-icon"
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
                  let empty_item = order.item_details
                    .filter((a) => a.item_uuid)
                    .map((a) => ({
                      ...a,
                      is_empty: !((+a.p || 0) + (+a.b || 0) + (+a.free || 0)),
                    }))
                    .find((a) => a.is_empty);
                  console.log({
                    empty_item,
                    order: order.item_details.map((a) => ({
                      ...a,
                      is_empty: !(+a.p + +a.b + +a.free),
                    })),
                  });
                  if (empty_item) {
                    setNotification({
                      message: `${empty_item.item_title} has 0 Qty.
                      0 Qty Not allowed.`,
                      success: false,
                    });
                    setTimeout(() => setNotification(null), 2000);
                    return;
                  }
                  setOrder((prev) => ({
                    ...prev,
                    item_details: prev.item_details.filter((a) => a.item_uuid),
                  }));
                  callBilling();
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
