import React, { useState, useEffect, useMemo } from "react";
import Header from "../../components/Header";
import Sidebar from "../../components/Sidebar";
import {
  ChevronUpIcon,
  ChevronDownIcon,
  MenuAlt2Icon,
} from "@heroicons/react/solid";
import { v4 as uuid } from "uuid";
import axios from "axios";
import { Delete } from "@mui/icons-material";
import { Switch } from "@mui/material";
import { green } from "@mui/material/colors";
import { alpha, styled } from "@mui/material/styles";

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
function Table({
  itemsDetails = [],
  setPopupForm,
  setDeletePopup,
  getItemsData,
}) {
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
            <tr key={item.counter_uuid} style={{ height: "30px" }}>
              <td>{i + 1}</td>
              <td
                colSpan={2}
                onClick={(e) => {
                  e.stopPropagation();
                  setPopupForm({ type: "edit", data: item });
                }}
              >
                {item.campaign_title}
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
    message: "",
    created_by: localStorage.getItem("user_uuid"),
    campaign_title: "",
    counters:[]
  });
  const [counters, setCounter] = useState([]);
  const [routesData, setRoutesData] = useState([]);
  const [filterCounterTitle, setFilterCounterTitle] = useState("");
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
      method: "get",
      url: "/counters/GetCounterList",

      headers: {
        "Content-Type": "application/json",
      },
    });
    if (response.data.success) setCounter(response.data.result);
  };
  useEffect(() => {
    getRoutesData();
    getCounter();
    if (popupForm?.type === "edit") setObgData(popupForm.data);
  }, []);

  const submitHandler = async (e) => {
    e.preventDefault();

    let data = objData;

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
  console.log(objData);
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
            <table
              className="user-table"
              style={{
                width: "fit-content",

                overflow: "scroll",
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
                    <textarea
                      onWheel={(e) => e.target.blur()}
                      className="searchInput"
                      style={{
                        border: "none",
                        borderBottom: "2px solid black",
                        borderRadius: "0px",
                        height: "200px",
                      }}
                      placeholder=""
                      value={objData.message}
                      onChange={(e) =>
                        setObgData((prev) => ({
                          ...prev,
                          message: e.target.value,
                        }))
                      }
                    />
                  </td>
                </tr>
              </tbody>
            </table>
            <div style={{ maxHeight: "500px", overflowY: "scroll" }}>
              <input
                type="text"
                onChange={(e) => setFilterCounterTitle(e.target.value)}
                value={filterCounterTitle}
                placeholder="Search Counter Title..."
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
                  {routesData
                    .filter(
                      (a) =>
                        a.route_uuid &&
                        filteredCounter?.filter(
                          (b) => a.route_uuid === b.route_uuid
                        ).length
                    )
                    .sort((a, b) =>
                      a?.route_title?.localeCompare(b?.route_title)
                    )

                    .map((a) => (
                      <>
                        <tr style={{ pageBreakAfter: "auto", width: "100%" }}>
                          <td colSpan={3}>
                            {a.route_title}
                            <span
                              onClick={(e) => {
                                e.stopPropagation();
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
                                              a.route_uuid ===
                                                b.route_uuid &&
                                              c === b.counter_uuid
                                          )
                                      )
                                    : [
                                        ...(prev.counters || []),
                                        ...filteredCounter
                                          ?.filter(
                                            (b) =>
                                              a.route_uuid ===
                                              b.route_uuid
                                          )
                                          .map((c) => c.counter_uuid),
                                      ],
                                }));
                              }}
                              style={{ marginLeft: "10px" }}
                            >
                              <input
                                type="checkbox"
                                checked={
                                  objData.counters.filter((c) =>
                                    filteredCounter?.find(
                                      (b) =>
                                        a.route_uuid === b.route_uuid &&
                                        c === b.counter_uuid
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
                              <tr
                                key={Math.random()}
                                style={{ height: "30px" }}
                              >
                                <td
                                  onClick={(e) => {
                                    e.stopPropagation();
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
                                  }}
                                  className="flex"
                                  style={{ justifyContent: "space-between" }}
                                >
                                  <input
                                    type="checkbox"
                                    checked={objData.counters.find(
                                      (a) => a === item.counter_uuid
                                    )}
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
