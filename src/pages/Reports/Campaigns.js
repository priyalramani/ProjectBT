import React, { useState, useEffect, useMemo, useContext } from "react";
import Header from "../../components/Header";
import Sidebar from "../../components/Sidebar";
import {
  ChevronUpIcon,
  ChevronDownIcon,
  MenuAlt2Icon,
} from "@heroicons/react/solid";
import { v4 as uuid } from "uuid";
import axios from "axios";
import { Add, CopyAll, Delete, DeleteOutline } from "@mui/icons-material";
import { Switch } from "@mui/material";
import { green } from "@mui/material/colors";
import { alpha, styled } from "@mui/material/styles";
import Context from "../../context/context";
import { server } from "../../App";
import noimg from "../../assets/noimg.jpg";
const GreenSwitch = styled(Switch)(({ theme }) => ({
  "& .MuiSwitch-switchBase.Mui-checked": {
    color: green[500],
    "&:hover": {
      backgroundColor: alpha(green[500], theme.palette.action.hoverOpacity),
    },
  },
  "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": {
    backgroundColor: green[500],
  },
}));
const Campaigns = () => {
  return (
    <>
      <Sidebar />
      <Header />
      <div className="item-sales-container orders-report-container">
        <div id="heading">
          <h2 style={{ width: "100%" }}>Campaigns</h2>
        </div>
        <Incetives />
      </div>
    </>
  );
};
const Incetives = () => {
  const [popupForm, setPopupForm] = useState(false);
  const [itemsData, setItemsData] = useState([]);
  const [deletePopup, setDeletePopup] = useState(false);
  const context = useContext(Context);

  const { setNotification } = context;
  const getItemsData = async () => {
    const response = await axios({
      method: "get",
      url: "/Campaigns/getCampaigns",

      headers: {
        "Content-Type": "application/json",
      },
    });
    if (response.data.success) setItemsData(response.data.result);
  };
  useEffect(() => {
    getItemsData();
  }, [popupForm]);
  const DeleteAutoAdd = async (data) => {
    const response = await axios({
      method: "delete",
      url: "/Campaigns/DeleteCampaigns",
      data,
      headers: {
        "Content-Type": "application/json",
      },
    });
    console.log(response);
    if (response.data.success) {
      setDeletePopup(false);
      getItemsData();
    }
  };
  const sendMsg = async (data) => {
    const response = await axios({
      method: "post",
      url: "/Campaigns/sendMsg",
      data,
      headers: {
        "Content-Type": "application/json",
      },
    });
    console.log(response);
    setNotification(response.data);
    setTimeout(() => setNotification(null), 5000);
    if (response.data.success) {
    }
  };
  return (
    <>
      <div id="item-sales-top">
        <div
          id="date-input-container"
          style={{
            overflow: "visible",
            display: "flex",
            alignItems: "center",
            justifyContent: "flex-end",
            width: "100%",
          }}
        >
          <button
            className="item-sales-search"
            onClick={() => setPopupForm(true)}
          >
            Add
          </button>
        </div>
      </div>
      <div className="table-container-user item-sales-container">
        <Table
          itemsDetails={itemsData}
          setPopupForm={setPopupForm}
          setDeletePopup={setDeletePopup}
          getItemsData={getItemsData}
          sendMsg={sendMsg}
        />
      </div>

      {popupForm ? (
        <IncentivePopup
          onSave={() => setPopupForm(false)}
          popupForm={popupForm}
        />
      ) : (
        ""
      )}
      {deletePopup ? (
        <div className="overlay">
          <div
            className="modal"
            style={{ height: "fit-content", width: "fit-content" }}
          >
            <div
              className="content"
              style={{
                height: "fit-content",
                paddingTop: "40px",
                width: "fit-content",
              }}
            >
              <div style={{ overflowY: "scroll" }}>Sure You Want to Delete</div>

              <div
                style={{
                  width: "100%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <button
                  className="fieldEditButton"
                  onClick={() => DeleteAutoAdd(deletePopup)}
                >
                  Confirm
                </button>
              </div>

              <button
                onClick={() => setDeletePopup(false)}
                className="closeButton"
              >
                x
              </button>
            </div>
          </div>
        </div>
      ) : (
        ""
      )}
    </>
  );
};

export default Campaigns;
function Table({ itemsDetails = [], setPopupForm, sendMsg, setDeletePopup }) {
  const [items, setItems] = useState("incentive_title");
  const [order, setOrder] = useState("asc");

  return (
    <table
      className="user-table"
      style={{ maxWidth: "100vw", height: "fit-content", overflowX: "scroll" }}
    >
      <thead>
        <tr>
          <th>S.N</th>
          <th colSpan={2}>
            <div className="t-head-element">
              <span>Type</span>
              <div className="sort-buttons-container">
                <button
                  onClick={() => {
                    setItems("type");
                    setOrder("asc");
                  }}
                >
                  <ChevronUpIcon className="sort-up sort-button" />
                </button>
                <button
                  onClick={() => {
                    setItems("type");
                    setOrder("desc");
                  }}
                >
                  <ChevronDownIcon className="sort-down sort-button" />
                </button>
              </div>
            </div>
          </th>
          <th colSpan={2}>
            <div className="t-head-element">
              <span>Campaign Title</span>
              <div className="sort-buttons-container">
                <button
                  onClick={() => {
                    setItems("campaign_title");
                    setOrder("asc");
                  }}
                >
                  <ChevronUpIcon className="sort-up sort-button" />
                </button>
                <button
                  onClick={() => {
                    setItems("campaign_title");
                    setOrder("desc");
                  }}
                >
                  <ChevronDownIcon className="sort-down sort-button" />
                </button>
              </div>
            </div>
          </th>
          <th>Counter</th>
          <th colSpan={2}></th>
        </tr>
      </thead>
      <tbody className="tbody">
        {itemsDetails
          ?.filter((a) => a.campaign_title)
          .sort((a, b) =>
            order === "asc"
              ? typeof a[items] === "string"
                ? a[items].localeCompare(b[items])
                : a[items] - b[items]
              : typeof a[items] === "string"
              ? b[items].localeCompare(a[items])
              : b[items] - a[items]
          )
          ?.map((item, i) => (
            <tr
              key={item.counter_uuid}
              style={{ height: "30px" }}
              onClick={(e) => {
                e.stopPropagation();
                setPopupForm({ type: "edit", data: item });
              }}
            >
              <td>{i + 1}</td>
              <td colSpan={2}>{item.type?.toLocaleUpperCase()}</td>
              <td colSpan={2}>{item.campaign_title}</td>
              <td>
                {item.type === "general"
                  ? item.counters.length
                  : item.counter_status?.length
                  ? item.counter_status?.filter((a) => +a.status).length +
                    "/" +
                    item.counter_status?.length
                  : 0}
              </td>
              <td>
                <button
                  className="item-sales-search"
                  onClick={(e) => {
                    e.stopPropagation();
                    sendMsg(item);
                  }}
                >
                  Shoot
                </button>
              </td>
              <td
                onClick={(e) => {
                  e.stopPropagation();

                  setDeletePopup(item);
                }}
              >
                <DeleteOutline />
              </td>
            </tr>
          ))}
      </tbody>
    </table>
  );
}

function IncentivePopup({ onSave, popupForm }) {
  const [objData, setObgData] = useState({
    type: "general",
    message: [],
    created_by: localStorage.getItem("user_uuid"),
    campaign_title: "",
    counters: [],
    counter_status: [],
  });
  const [counters, setCounter] = useState([]);
  const [active, setActive] = useState("");
  const [copied, setCopied] = useState("");
  const [orderForm, setOrderForm] = useState([]);
  const [routesData, setRoutesData] = useState([]);
  const [filterCounterTitle, setFilterCounterTitle] = useState("");
  const [filterRouteTitle, setFilterRouteTitle] = useState("");
  const getRoutesData = async () => {
    const response = await axios({
      method: "get",
      url: "/routes/GetRouteList",

      headers: {
        "Content-Type": "application/json",
      },
    });
    if (response.data.success) setRoutesData(response.data.result);
  };
  const getCounter = async () => {
    const response = await axios({
      method: "post",
      url: "/counters/GetCounterData",
      data: ["counter_uuid", "counter_title", "status", "route_uuid"],
      headers: {
        "Content-Type": "application/json",
      },
    });
    if (response.data.success) setCounter(response.data.result);
  };
  const getOrderForm = async () => {
    const response = await axios({
      method: "post",
      url: "orderForm/GetFormList",
      data: ["form_uuid", "form_title"],
      headers: {
        "Content-Type": "application/json",
      },
    });
    if (response.data.success) setOrderForm(response.data.result);
  };

  useEffect(() => {
    getOrderForm();
    getRoutesData();
    getCounter();
    if (popupForm?.type === "edit") setObgData(popupForm.data);
  }, []);

  const submitHandler = async (e) => {
    e.preventDefault();

    let data = objData;
    for (let message of data.message?.filter((a) => a.img)) {
      const previousFile = message.img;
      const newFile = new File([previousFile], message.uuid + ".png");
      const form = new FormData();
      form.append("file", newFile);
      await axios({
        method: "post",
        url: "/uploadImage",
        data: form,
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
    }
    if (popupForm?.type === "edit") {
      const response = await axios({
        method: "put",
        url: "/Campaigns/UpdateCampaigns",
        data,
        headers: {
          "Content-Type": "application/json",
        },
      });
      console.log(response);
      if (response.data.success) {
        onSave();
      }
    } else {
      const response = await axios({
        method: "post",
        url: "/Campaigns/CreateCampaigns",
        data,
        headers: {
          "Content-Type": "application/json",
        },
      });
      console.log(response);
      if (response.data.success) {
        onSave();
      }
    }
  };
  const filteredCounter = useMemo(
    () =>
      counters.filter(
        (a) =>
          !filterCounterTitle ||
          a.counter_title
            ?.toLocaleLowerCase()
            ?.includes(filterCounterTitle?.toLocaleLowerCase())
      ),
    [counters, filterCounterTitle]
  );
  const filterRoute = useMemo(
    () =>
      routesData
        .filter(
          (a) =>
            (!filterRouteTitle ||
              a.route_title
                ?.toLocaleLowerCase()
                ?.includes(filterRouteTitle?.toLocaleLowerCase())) &&
            a.route_uuid &&
            filteredCounter?.filter((b) => a.route_uuid === b.route_uuid).length
        )

        .sort((a, b) => a?.route_title?.localeCompare(b?.route_title)),
    [filterRouteTitle, filteredCounter, routesData]
  );
  const objcounters = useMemo(() => {
    console.count("counter");
    return objData.counters;
  }, [objData.counters]);
  const objcounter_status = useMemo(() => {
    console.count("counter");
    return objData.counter_status;
  }, [objData.counter_status]);
  console.count("render");
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
          <div
            className="flex"
            style={{ justifyContent: "flex-start", alignItems: "flex-start" }}
          >
            <div style={{ maxHeight: "500px", overflowY: "scroll" }}>
              <table
                className="user-table"
                style={{
                  width: "fit-content",
                }}
              >
                <tbody>
                  <tr>
                    <td
                      colSpan={2}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "flex-start",
                        width: "400px",
                      }}
                    >
                      <b style={{ width: "100px" }}>Type : </b>
                      <select
                        onWheel={(e) => e.target.blur()}
                        type="text"
                        className="searchInput"
                        style={{
                          border: "none",
                          borderBottom: "2px solid black",
                          borderRadius: "0px",
                        }}
                        placeholder=""
                        value={objData.type}
                        disabled={popupForm?.type === "edit"}
                        onChange={(e) =>
                          setObgData((prev) => ({
                            ...prev,
                            type: e.target.value,
                            form_uuid: e.target.value === "order" ? "d" : "",
                          }))
                        }
                      >
                        <option value="general">General</option>
                        <option value="order">Order</option>
                      </select>
                    </td>
                  </tr>
                  <tr>
                    <td
                      colSpan={2}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "flex-start",
                        width: "400px",
                      }}
                    >
                      <b style={{ width: "100px" }}>Campaign Title : </b>
                      <input
                        onWheel={(e) => e.target.blur()}
                        type="text"
                        className="searchInput"
                        style={{
                          border: "none",
                          borderBottom: "2px solid black",
                          borderRadius: "0px",
                        }}
                        placeholder=""
                        value={objData.campaign_title}
                        onChange={(e) =>
                          setObgData((prev) => ({
                            ...prev,
                            campaign_title: e.target.value,
                          }))
                        }
                      />
                    </td>
                  </tr>
                  {objData.type === "general" ? (
                    <>
                      <tr>
                        <td
                          colSpan={2}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "flex-start",
                          }}
                        >
                          <b style={{ width: "100px" }}>Message : </b>
                          <span
                            onClick={(e) => {
                              console.log(objData);
                              setObgData((prev) => ({
                                ...prev,
                                message: [
                                  ...(prev.message || []),
                                  { type: "text", uuid: uuid() },
                                ],
                              }));
                            }}
                            className="fieldEditButton"
                          >
                            <Add />
                          </span>
                        </td>
                      </tr>
                      {objData?.message?.map((item) => (
                        <tr key={item.uuid}>
                          <td
                            colSpan={2}
                            style={{
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "flex-start",
                            }}
                          >
                            <span
                              onClick={() =>
                                setObgData((prev) => ({
                                  ...prev,
                                  message: prev.message.filter(
                                    (a) => a.uuid !== item.uuid
                                  ),
                                }))
                              }
                            >
                              <DeleteOutline />
                            </span>
                            <select
                              className="searchInput"
                              value={item.type}
                              onChange={(e) => {
                                setObgData((prev) => ({
                                  ...prev,
                                  message: prev.message.map((a) =>
                                    a.uuid === item.uuid
                                      ? { ...a, type: e.target.value }
                                      : a
                                  ),
                                }));
                              }}
                            >
                              <option value="text">Text</option>
                              <option value="img">Image</option>
                            </select>

                            {item?.type === "text" ? (
                              <textarea
                                onWheel={(e) => e.target.blur()}
                                className="searchInput"
                                style={{
                                  border: "none",
                                  borderBottom: "2px solid black",
                                  borderRadius: "0px",
                                  height: "100px",
                                }}
                                onFocus={() => setActive(item.uuid)}
                                placeholder=""
                                value={item.text}
                                onChange={(e) => {
                                  setObgData((prev) => ({
                                    ...prev,
                                    message: prev.message.map((a) =>
                                      a.uuid === item.uuid
                                        ? { ...a, text: e.target.value }
                                        : a
                                    ),
                                  }));
                                }}
                              />
                            ) : (
                              <label htmlFor={item.uuid} className="flex">
                                Upload Image
                                <input
                                  className="searchInput"
                                  type="file"
                                  id={item.uuid}
                                  style={{ display: "none" }}
                                  onChange={(e) =>
                                    setObgData((prev) => ({
                                      ...prev,
                                      message: prev.message.map((a) =>
                                        a.uuid === item.uuid
                                          ? { ...a, img: e.target.files[0] }
                                          : a
                                      ),
                                    }))
                                  }
                                />
                                {console.log(server + item.uuid + ".png")}
                                <img
                                  style={{
                                    width: "100px",
                                    height: "100px",
                                    objectFit: "contain",
                                  }}
                                  src={server + "/" + item.uuid + ".png"}
                                  onError={({ currentTarget }) => {
                                    currentTarget.onerror = null; // prevents looping
                                    currentTarget.src = noimg;
                                  }}
                                  alt=""
                                />
                              </label>
                            )}
                          </td>
                        </tr>
                      ))}
                      <tr>
                        <td
                          colSpan={2}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "flex-start",
                          }}
                        >
                          <button
                            className="item-sales-search"
                            onClick={(e) =>
                              setObgData((prev) => ({
                                ...prev,
                                message: prev.message.map((a) =>
                                  a.uuid === active
                                    ? {
                                        ...a,
                                        text: a.text + "{counter_title}",
                                      }
                                    : a
                                ),
                              }))
                            }
                          >
                            Counter Title
                          </button>
                          <button
                            className="item-sales-search"
                            onClick={(e) =>
                              setObgData((prev) => ({
                                ...prev,
                                message: prev.message.map((a) =>
                                  a.uuid === active
                                    ? { ...a, text: a.text + "{short_link}" }
                                    : a
                                ),
                              }))
                            }
                          >
                            Counter Link
                          </button>
                        </td>
                      </tr>
                      <tr>
                        <td
                          colSpan={2}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "flex-start",
                          }}
                        >
                          <button
                            className="item-sales-search"
                            onClick={(e) =>
                              setObgData((prev) => ({
                                ...prev,
                                message: prev.message.map((a) =>
                                  a.uuid === active
                                    ? {
                                        ...a,
                                        text: a.text + "{invoice_number}",
                                      }
                                    : a
                                ),
                              }))
                            }
                          >
                            Invoice Number
                          </button>
                          <button
                            className="item-sales-search"
                            onClick={(e) =>
                              setObgData((prev) => ({
                                ...prev,
                                message: prev.message.map((a) =>
                                  a.uuid === active
                                    ? { ...a, text: a.text + "{amount}" }
                                    : a
                                ),
                              }))
                            }
                          >
                            Amount
                          </button>
                        </td>
                      </tr>
                      <tr>
                        <td
                          colSpan={2}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "flex-start",
                          }}
                        >
                          <b style={{ width: "100px" }}>Mobile : </b>
                          <textarea
                            onWheel={(e) => e.target.blur()}
                            className="searchInput"
                            style={{
                              border: "none",
                              borderBottom: "2px solid black",
                              borderRadius: "0px",
                              height: "100px",
                            }}
                            placeholder=""
                            value={objData?.mobile
                              ?.toString()
                              ?.replace(/,/g, "\n")}
                            onChange={(e) =>
                              setObgData((prev) => ({
                                ...prev,
                                mobile: e.target.value.split("\n"),
                              }))
                            }
                          />
                        </td>
                      </tr>
                    </>
                  ) : (
                    <>
                      <tr>
                        <td
                          colSpan={2}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "flex-start",
                            width: "400px",
                          }}
                        >
                          <b style={{ width: "100px" }}>Order Form : </b>
                          <select
                            onWheel={(e) => e.target.blur()}
                            type="text"
                            className="searchInput"
                            style={{
                              border: "none",
                              borderBottom: "2px solid black",
                              borderRadius: "0px",
                            }}
                            placeholder=""
                            value={objData.form_uuid}
                            onChange={(e) =>
                              setObgData((prev) => ({
                                ...prev,

                                form_uuid: e.target.value,
                              }))
                            }
                          >
                            <option value="d">Default</option>
                            {orderForm.map((a) => (
                              <option value={a.form_uuid}>
                                {a.form_title}
                              </option>
                            ))}
                          </select>
                        </td>
                      </tr>
                      {objData.campaign_short_link ? (
                        <tr>
                          <td
                            colSpan={2}
                            style={{
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "flex-start",
                            }}
                          >
                            <b style={{ width: "100px" }}>
                              Campaign Short Link :{" "}
                            </b>
                            <input
                              onWheel={(e) => e.target.blur()}
                              className="searchInput"
                              style={{
                                border: "none",
                                borderBottom: "2px solid black",
                                borderRadius: "0px",
                              }}
                              placeholder=""
                              value={"cam-" + objData?.campaign_short_link}
                              disabled
                            />
                            <span
                              onClick={(e) => {
                                e.stopPropagation();
                                navigator.clipboard.writeText(
                                  "cam-" + objData.campaign_short_link
                                );
                                setCopied(true);
                                setTimeout(() => setCopied(""), 3000);
                              }}
                            >
                              {copied ? (
                                <div
                                  style={{
                                    // position: "absolute",
                                    top: "-15px",
                                    right: "10px",
                                    fontSize: "10px",
                                    backgroundColor: "#000",
                                    color: "#fff",
                                    padding: "3px",
                                    borderRadius: "10px",
                                    textAlign: "center",
                                  }}
                                >
                                  Copied!
                                </div>
                              ) : (
                                <CopyAll />
                              )}
                            </span>
                          </td>
                        </tr>
                      ) : (
                        ""
                      )}
                    </>
                  )}
                </tbody>
              </table>
            </div>
            <div style={{ maxHeight: "500px", overflowY: "scroll" }}>
              <input
                type="text"
                onChange={(e) => setFilterCounterTitle(e.target.value)}
                value={filterCounterTitle}
                placeholder="Search Counter Title..."
                className="searchInput"
              />
              <input
                type="text"
                onChange={(e) => setFilterRouteTitle(e.target.value)}
                value={filterRouteTitle}
                placeholder="Search Route Title..."
                className="searchInput"
              />
              <table
                className="user-table"
                style={{
                  maxWidth: "500px",
                  height: "fit-content",
                  overflowX: "scroll",
                }}
              >
                <thead>
                  <tr>
                    <th>S.N</th>
                    <th colSpan={2}>Counter Title</th>
                  </tr>
                </thead>
                <tbody className="tbody">
                  {filterRoute.map((a) => (
                    <>
                      <tr style={{ pageBreakAfter: "auto", width: "100%" }}>
                        <td colSpan={3}>
                          {a.route_title}
                          <span
                            onClick={(e) => {
                              e.stopPropagation();
                              if (objData.type === "general") {
                                setObgData((prev) => ({
                                  ...prev,
                                  counters: prev.counters.filter((c) =>
                                    filteredCounter?.find(
                                      (b) =>
                                        a.route_uuid === b.route_uuid &&
                                        c === b.counter_uuid
                                    )
                                  ).length
                                    ? prev.counters.filter(
                                        (c) =>
                                          !filteredCounter?.find(
                                            (b) =>
                                              a.route_uuid === b.route_uuid &&
                                              c === b.counter_uuid
                                          )
                                      )
                                    : [
                                        ...(prev.counters || []),
                                        ...filteredCounter
                                          ?.filter(
                                            (b) => a.route_uuid === b.route_uuid
                                          )
                                          .map((c) => c.counter_uuid),
                                      ],
                                }));
                              } else {
                                setObgData((prev) => ({
                                  ...prev,
                                  counter_status: prev.counter_status.filter(
                                    (c) =>
                                      filteredCounter?.find(
                                        (b) =>
                                          a.route_uuid === b.route_uuid &&
                                          c.counter_uuid === b.counter_uuid
                                      )
                                  ).length
                                    ? prev.counter_status.filter(
                                        (c) =>
                                          !filteredCounter?.find(
                                            (b) =>
                                              a.route_uuid === b.route_uuid &&
                                              c.counter_uuid === b.counter_uuid
                                          )
                                      )
                                    : [
                                        ...(prev.counter_status || []),
                                        ...filteredCounter?.filter(
                                          (b) => a.route_uuid === b.route_uuid
                                        ),
                                      ],
                                }));
                              }
                            }}
                            style={{ marginLeft: "10px" }}
                          >
                            <input
                              type="checkbox"
                              checked={
                                objData.type === "general"
                                  ? objcounters?.filter((c) =>
                                      filteredCounter?.find(
                                        (b) =>
                                          a.route_uuid === b.route_uuid &&
                                          c === b.counter_uuid
                                      )
                                    ).length ===
                                    filteredCounter?.filter(
                                      (b) => a.route_uuid === b.route_uuid
                                    ).length
                                  : objcounter_status?.filter((c) =>
                                      filteredCounter?.find(
                                        (b) =>
                                          a.route_uuid === b.route_uuid &&
                                          c.counter_uuid === b.counter_uuid
                                      )
                                    ).length ===
                                    filteredCounter?.filter(
                                      (b) => a.route_uuid === b.route_uuid
                                    ).length
                              }
                              style={{ transform: "scale(1.3)" }}
                            />
                          </span>
                        </td>
                      </tr>
                      {filteredCounter
                        ?.filter((b) => a.route_uuid === b.route_uuid)
                        ?.sort((a, b) =>
                          a.counter_title?.localeCompare(b.counter_title)
                        )
                        ?.map((item, i, array) => {
                          return (
                            <tr key={Math.random()} style={{ height: "30px" }}>
                              <td
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (objData.type === "general") {
                                    setObgData((prev) => ({
                                      ...prev,
                                      counters: prev.counters.filter(
                                        (a) => a === item.counter_uuid
                                      ).length
                                        ? prev.counters.filter(
                                            (a) => a !== item.counter_uuid
                                          )
                                        : [
                                            ...(prev.counters || []),
                                            item.counter_uuid,
                                          ],
                                    }));
                                  } else {
                                    setObgData((prev) => ({
                                      ...prev,
                                      counter_status:
                                        prev.counter_status.filter(
                                          (a) =>
                                            a.counter_uuid === item.counter_uuid
                                        ).length
                                          ? prev.counter_status.filter(
                                              (a) =>
                                                a.counter_uuid !==
                                                item.counter_uuid
                                            )
                                          : [
                                              ...(prev.counter_status || []),
                                              item,
                                            ],
                                    }));
                                  }
                                }}
                                className="flex"
                                style={{ justifyContent: "space-between" }}
                              >
                                <input
                                  type="checkbox"
                                  checked={
                                    objData.type === "general"
                                      ? objcounters.find(
                                          (a) => a === item.counter_uuid
                                        )
                                      : objcounter_status.find(
                                          (a) =>
                                            a.counter_uuid === item.counter_uuid
                                        )
                                  }
                                  style={{ transform: "scale(1.3)" }}
                                />
                                {i + 1}
                              </td>

                              <td colSpan={2}>{item.counter_title || ""}</td>
                            </tr>
                          );
                        })}
                    </>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div
            style={{
              width: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <button className="fieldEditButton" onClick={submitHandler}>
              {popupForm?.type === "edit" ? "Update" : "Save"}
            </button>
          </div>

          <button onClick={onSave} className="closeButton">
            x
          </button>
        </div>
      </div>
    </div>
  );
}
