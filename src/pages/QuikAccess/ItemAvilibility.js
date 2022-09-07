import axios from "axios";
import React, { useState, useEffect, useCallback, useRef } from "react";
import { useReactToPrint } from "react-to-print";
import PopupTripOrderTable from "../../components/PopupTripOrderTable";
import TripPage from "../../components/TripPage";
import { ArrowDropDown } from "@mui/icons-material";
import Select from "react-select";
export default function ItemAvilibility({ setIsItemAvilableOpen }) {
  const [itemsData, setItemsData] = useState([]);
  const [popup, setPopup] = useState(null);
  const [users, setUsers] = useState([]);
  const [btn, setBtn] = useState(false);
  const [itemFilter, setItemFilter] = useState("");
  const [statementTrip_uuid, setStatementTrip_uuid] = useState();
  const [statementTrip, setStatementTrip] = useState();
  const [detailsPopup, setDetailsPopup] = useState(false);
  const [warehousePopup, setWarehousePopup] = useState(false);
  const componentRef = useRef(null);

  const reactToPrintContent = useCallback(() => {
    return componentRef.current;
  }, []);

  const handlePrint = useReactToPrint({
    content: reactToPrintContent,
    documentTitle: "Statement",
    removeAfterPrint: true,
  });

  function formatAMPM(date) {
    var hours = date.getHours();
    var minutes = date.getMinutes();
    var ampm = hours >= 12 ? "pm" : "am";
    hours = hours % 12;
    hours = hours ? hours : 12; // the hour '0' should be '12'
    minutes = minutes < 10 ? "0" + minutes : minutes;
    var strTime =
      date.toDateString() + " - " + hours + ":" + minutes + " " + ampm;
    return strTime;
  }
  const getUsers = async () => {
    const response = await axios({
      method: "get",
      url: "/users/GetUserList",

      headers: {
        "Content-Type": "application/json",
      },
    });
    console.log("users", response);
    if (response.data.success)
      setUsers(
        response.data.result
          .filter((a) => a.status)
          .sort((a, b) => a.user_title?.localeCompare(b.user_title))
      );
  };
  const getTripData = async () => {
    const response = await axios({
      method: "get",
      url: "/trips/GetTripListSummary/" + localStorage.getItem("user_uuid"),

      headers: {
        "Content-Type": "application/json",
      },
    });
    if (response.data.success)
      setItemsData(
        response.data.result
          .filter((a) => a.status)
          .map((b) => ({
            ...b,

            users_name:
              b?.users?.map(
                (a) => users.find((c) => a === c.user_uuid)?.user_title
              ) || [],
          }))
      );
  };
  const getTripDetails = async () => {
    const response = await axios({
      method: "get",
      url: "/trips/GetTripSummaryDetails/" + statementTrip_uuid,

      headers: {
        "Content-Type": "application/json",
      },
    });
    if (response.data.success) {
      console.log(response);
      setStatementTrip(response.data.result);
      setStatementTrip_uuid(false);
      setTimeout(handlePrint, 2000);
    }
  };
  useEffect(() => {
    if (statementTrip_uuid) {
      getTripDetails();
    }
  }, [statementTrip_uuid]);
  useEffect(() => {
    getTripData();
  }, [btn, warehousePopup]);
  useEffect(() => {
    getUsers();
  }, []);
  const completeFunction = async (data) => {
    const response = await axios({
      method: "put",
      url: "/trips/putTrip",
      data,
      headers: {
        "Content-Type": "application/json",
      },
    });
    if (response.data.success) {
      setBtn((prev) => !prev);
    }
  };
  console.log(statementTrip);
  return (
    <>
      <div className="itemavilablelity">
        <div
          className="itemavilabelitycontainer"
          style={{ position: "relative" }}
        >
          <div className="itemavilablelity_header">
            <h2>Trips</h2>
          </div>

          <div className="availablecontainer">
            <div className="itemavilablelitybox">
              <input
                className="numberInput"
                type="text"
                name="item_filter"
                value={itemFilter}
                onChange={(e) => {
                  setItemFilter(e.target.value);
                }}
                placeholder="Items Filter"
                style={{ width: "200px", margin: "10px 0" }}
              />
              <div className="items_table">
                <table className="f6 w-100 center" cellSpacing="0">
                  <thead className="lh-copy">
                    <tr className="white">
                      <th
                        className="pa3 bb b--black-20 "
                        style={{ borderBottom: "2px solid rgb(189, 189, 189)" }}
                      >
                        Created At
                      </th>
                      <th
                        className="pa3 bb b--black-20 "
                        style={{ borderBottom: "2px solid rgb(189, 189, 189)" }}
                      >
                        Title
                      </th>
                      <th
                        className="pa3 bb b--black-20 "
                        style={{ borderBottom: "2px solid rgb(189, 189, 189)" }}
                      >
                        Users
                      </th>
                      <th
                        className="pa3 bb b--black-20 "
                        style={{ borderBottom: "2px solid rgb(189, 189, 189)" }}
                      >
                        Warehouse
                      </th>
                      <th
                        className="pa3 bb b--black-20 "
                        style={{ borderBottom: "2px solid rgb(189, 189, 189)" }}
                      >
                        Order
                      </th>
                      <th
                        className="pa3 bb b--black-20 "
                        style={{ borderBottom: "2px solid rgb(189, 189, 189)" }}
                      >
                        Action
                      </th>
                    </tr>
                  </thead>
                  <tbody className="lh-copy">
                    {itemsData
                      .sort((a, b) => a.created_at - b.created_at)
                      .filter(
                        (a) =>
                          (itemFilter !== ""
                            ? a.trip_title
                                .toLowerCase()
                                .includes(itemFilter.toLowerCase())
                            : true) && a.trip_title
                      )
                      .map((item, index) => (
                        <tr
                          key={index}
                          style={{
                            borderBottom: "2px solid rgb(189, 189, 189)",
                            height: "50px",
                          }}
                        >
                          <td
                            className="ph3 bb b--black-20 tc bg-white"
                            style={{ textAlign: "center" }}
                          >
                            {new Date(item.created_at).toDateString()}
                          </td>
                          <td
                            className="ph3 bb b--black-20 tc bg-white"
                            style={{ textAlign: "center" }}
                          >
                            {item.trip_title}
                          </td>
                          <td
                            className="ph3 bb b--black-20 tc bg-white"
                            style={{ textAlign: "center" }}
                          >
                            {item?.users_name?.length
                              ? item.users_name.map((a, i) =>
                                  i === 0 ? a : ", " + a
                                )
                              : ""}
                          </td>
                          <td
                            className="ph3 bb b--black-20 tc bg-white"
                            style={{ textAlign: "center" }}
                          >
                            {item?.warehouse_title || ""}
                          </td>
                          <td
                            className="ph3 bb b--black-20 tc bg-white"
                            style={{ textAlign: "center" }}
                          >
                            {item.orderLength}
                          </td>
                          <td
                            className="ph3 bb b--black-20 tc bg-white"
                            style={{
                              textAlign: "center",
                              position: "relative",
                            }}
                          >
                            <div
                              id="customer-dropdown-trigger"
                              className={"active"}
                              style={{
                                transform: item.dropdown
                                  ? "rotate(0deg)"
                                  : "rotate(180deg)",
                                width: "30px",
                                height: "30px",
                                backgroundColor: "#000",
                                color: "#fff",
                              }}
                              onClick={(e) => {
                                setItemsData((prev) =>
                                  prev.map((a) =>
                                    a.trip_uuid === item.trip_uuid
                                      ? { ...a, dropdown: !a.dropdown }
                                      : { ...a, dropdown: false }
                                  )
                                );
                              }}
                            >
                              <ArrowDropDown />
                            </div>
                            {item.dropdown ? (
                              <div
                                id="customer-details-dropdown"
                                className={"page1 flex"}
                                style={{
                                  top: "-70px",
                                  flexDirection: "column",
                                  left: "-200px",
                                  zIndex: "200",
                                  width: "200px",
                                  height: "300px",
                                  justifyContent: "space-between",
                                }}
                                onMouseLeave={() =>
                                  setItemsData((prev) =>
                                    prev.map((a) =>
                                      a.trip_uuid === item.trip_uuid
                                        ? { ...a, dropdown: false }
                                        : a
                                    )
                                  )
                                }
                              >
                                <button
                                  className="item-sales-search"
                                  style={{
                                    display: "inline",
                                    cursor: "pointer",
                                    width: "100%",
                                  }}
                                  type="button"
                                  onClick={() => {
                                    setWarehousePopup(item);
                                  }}
                                >
                                  Warehouse
                                </button>
                                <button
                                  className="item-sales-search"
                                  style={{
                                    display: "inline",
                                    cursor: item?.orderLength
                                      ? "not-allowed"
                                      : "pointer",
                                    width: "100%",
                                  }}
                                  type="button"
                                  onClick={() => {
                                    completeFunction({ ...item, status: 0 });
                                  }}
                                  disabled={item?.orderLength}
                                >
                                  Complete
                                </button>

                                <button
                                  className="item-sales-search"
                                  style={{
                                    display: "inline",
                                    cursor: "pointer",
                                    width: "100%",
                                  }}
                                  type="button"
                                  onClick={() => {
                                    setStatementTrip_uuid(item.trip_uuid);
                                  }}
                                >
                                  Statement
                                </button>

                                <button
                                  className="item-sales-search"
                                  style={{
                                    display: "inline",
                                    width: "100%",
                                  }}
                                  type="button"
                                  onClick={() => {
                                    setPopup(item);
                                  }}
                                >
                                  Users
                                </button>

                                <button
                                  className="item-sales-search"
                                  style={{
                                    display: "inline",
                                    width: "100%",
                                  }}
                                  type="button"
                                  onClick={() => {
                                    setDetailsPopup(item.trip_uuid);
                                  }}
                                >
                                  Details
                                </button>
                              </div>
                            ) : (
                              ""
                            )}
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
          <button
            onClick={() => {
              setIsItemAvilableOpen(false);
            }}
            className="closeButton"
          >
            x
          </button>

          <div
            onClick={() => {
              setIsItemAvilableOpen(false);
            }}
          >
            <button className="savebtn">Done</button>
          </div>
        </div>
      </div>
      {popup ? (
        <NewUserForm
          onSave={() => setPopup(false)}
          popupInfo={popup}
          users={users}
          completeFunction={completeFunction}
        />
      ) : (
        ""
      )}
      {warehousePopup ? (
        <WarehousePopup
          onSave={() => setWarehousePopup(false)}
          tripData={warehousePopup}
        />
      ) : (
        ""
      )}
      {detailsPopup ? (
        <PopupTripOrderTable
          trip_uuid={detailsPopup}
          onSave={() => setDetailsPopup("")}
        />
      ) : (
        ""
      )}
      {statementTrip?.trip_uuid ? (
        <div
          style={{ position: "fixed", top: -100, left: -180, zIndex: "-1000" }}
        >
          <div
            ref={componentRef}
            style={{
              width: "21cm",
              height: "29.7cm",

              textAlign: "center",

              // padding: "100px",
              pageBreakInside: "auto",
            }}
          >
            <TripPage
              trip_title={statementTrip?.trip_title || ""}
              users={
                statementTrip?.users.map((a) =>
                  users.find((b) => b.user_uuid === a)
                ) || []
              }
              trip_uuid={statementTrip?.trip_uuid || ""}
              created_at={formatAMPM(new Date(statementTrip?.created_at || ""))}
              amt={statementTrip?.amt || 0}
              coin={statementTrip?.coin || 0}
              cash={statementTrip?.cash || 0}
              formatAMPM={formatAMPM}
              cheque={statementTrip?.cheque}
              replacement={statementTrip?.replacement}
              sales_return={statementTrip?.sales_return}
              unpaid_invoice={statementTrip?.unpaid_invoice}
            />
          </div>
        </div>
      ) : (
        ""
      )}
    </>
  );
}
function NewUserForm({ onSave, popupInfo, users, completeFunction }) {
  const [data, setdata] = useState([]);
  useEffect(() => {
    setdata(popupInfo?.users || []);
  }, [popupInfo?.users]);

  const submitHandler = async (e) => {
    e.preventDefault();
    completeFunction({ ...popupInfo, users: data });
    onSave();
  };

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
            <form className="form" onSubmit={submitHandler}>
              <div className="row">
                <h1>{popupInfo.type === "edit" ? "Edit" : "Add"} Counter </h1>
              </div>

              <div className="form">
                <div className="row">
                  <label className="selectLabel">
                    Users
                    <div
                      className="formGroup"
                      style={{ height: "200px", overflow: "scroll" }}
                    >
                      {users.map((occ) => (
                        <div
                          style={{
                            marginBottom: "5px",
                            textAlign: "center",
                            backgroundColor: data?.filter(
                              (a) => a === occ.user_uuid
                            ).length
                              ? "#caf0f8"
                              : "#fff",
                          }}
                          onClick={(e) => {
                            e.stopPropagation();
                            setdata((prev) =>
                              prev?.find((a) => a === occ.user_uuid)
                                ? prev.filter((a) => a !== occ.user_uuid)
                                : [...prev, occ?.user_uuid]
                            );
                          }}
                        >
                          {occ.user_title}
                        </div>
                      ))}
                    </div>
                  </label>
                </div>
              </div>

              <button type="submit" className="submit">
                Save changes
              </button>
            </form>
          </div>
          <button onClick={onSave} className="closeButton">
            x
          </button>
        </div>
      </div>
    </div>
  );
}
function WarehousePopup({ onSave, tripData }) {
  const [data, setdata] = useState([]);
  const [warehouse, setWarehouse] = useState([]);
  const getItemsData = async () => {
    const response = await axios({
      method: "get",
      url: "/warehouse/GetWarehouseList",

      headers: {
        "Content-Type": "application/json",
      },
    });
    if (response.data.success) setWarehouse(response.data.result);
  };
  useEffect(() => {
    setdata(tripData);
    getItemsData();
  }, [tripData]);

  const submitHandler = async (e) => {
    e.preventDefault();
    const response = await axios({
      method: "put",
      url: "/trips/putTrip",
      data,
      headers: {
        "Content-Type": "application/json",
      },
    });
    if (response.data.success) {
      onSave();
    }
  };

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
            <form className="form" onSubmit={submitHandler}>
              <div className="row">
                <h1>Warehouse </h1>
              </div>

              <div className="form">
                <div className="row">
                  <label className="selectLabel">
                    Warehouse
                    <div className="inputGroup" style={{ width: "500px" }}>
                      <Select
                        options={warehouse.map((a) => ({
                          value: a.warehouse_uuid,
                          label: a.warehouse_title,
                        }))}
                        onChange={(doc) =>
                          setdata((prev) => ({
                            ...prev,
                            warehouse_uuid: doc.value,
                          }))
                        }
                        value={
                          data?.warehouse_uuid
                            ? {
                                value: data?.counter_uuid,
                                label: warehouse?.find(
                                  (j) =>
                                    j.warehouse_uuid === data.warehouse_uuid
                                )?.warehouse_title,
                              }
                            : ""
                        }
                        autoFocus={!data?.counter_uuid}
                        openMenuOnFocus={true}
                        menuPosition="fixed"
                        menuPlacement="auto"
                        placeholder="Select"
                      />
                    </div>
                  </label>
                </div>
              </div>

              <button type="submit" className="submit">
                Save changes
              </button>
            </form>
          </div>
          <button onClick={onSave} className="closeButton">
            x
          </button>
        </div>
      </div>
    </div>
  );
}
