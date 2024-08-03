import axios from "axios";
import React, {
  useState,
  useEffect,
  useCallback,
  useRef,
  useMemo,
  useContext,
} from "react";
import { useReactToPrint } from "react-to-print";
import PopupTripOrderTable from "../../components/PopupTripOrderTable";
import TripPage from "../../components/TripPage";
import { ArrowDropDown, ArrowDropUp } from "@mui/icons-material";
import Select from "react-select";
import context from "../../context/context";
import TransactionsStatement from "../../components/prints/TransactionsStatement";

export default function CashRegister() {
  const [itemsData, setItemsData] = useState([]);
  const [popupForm, setPopupForm] = useState(false);
  const [popup, setPopup] = useState(null);
  const [users, setUsers] = useState([]);
  const [btn, setBtn] = useState(false);
  const [itemFilter, setItemFilter] = useState("");
  const [statementTrip_uuid, setStatementTrip_uuid] = useState();
  const [statementTrip, setStatementTrip] = useState();
  const [detailsPopup, setDetailsPopup] = useState(false);
  const [warehousePopup, setWarehousePopup] = useState(false);
  const componentRef = useRef(null);
  const [counterPopup, setCounterPopup] = useState(false);
  const statementRef = useRef(null);
  const { setCashRegisterPopup, setNotification } = useContext(context);
  const [statementData, setStatementData] = useState({});

  const reactToPrintContent = useCallback(() => {
    return componentRef.current;
  }, []);

  const handlePrint = useReactToPrint({
    content: reactToPrintContent,
    documentTitle: "Statement",
    removeAfterPrint: true,
  });

  const statementContent = useCallback(() => {
    console.log(statementRef.current);
    if (statementData) return statementRef.current;
    else return <></>;
  }, [statementData]);

  const printStatement = useReactToPrint({
    content: statementContent,
    documentTitle: "Statement",
    removeAfterPrint: true,
  });

  const getStatement = async (cash_register) => {
    try {
      const response = await axios.get(
        `cashRegistrations/statement/${cash_register?.register_uuid}`
      );
      if (!response?.data?.result?.length) return;
      setStatementData({
        cash_register: {
          register_uuid: cash_register?.register_uuid,
          created_at: cash_register?.created_at,
        },
        data: {
          transactions: response.data.result,
          grand_total: response.data.result
            .filter((a) => a.type === "in")
            .reduce((sum, i) => sum + (+i.amount || 0), 0),
          expense_total: response.data.result
            .filter((a) => a.type === "out")
            .reduce((sum, i) => sum + (+i.amount || 0), 0),
        },
      });
      printStatement();
    } catch (error) {
      console.error(error);
    }
  };

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
      url:
        "/cashRegistrations/GetAllActiveCashRegistrations/" +
        localStorage.getItem("user_uuid"),

      headers: {
        "Content-Type": "application/json",
      },
    });
    if (response.data.success) {
      setItemsData(response.data.result);
    } else {
      setItemsData([]);
    }
  };
  const filterCashRegister = useMemo(() => {
    return itemsData
      .map((b) => ({
        ...b,

        user_title: users.find((c) => b.created_by === c.user_uuid)?.user_title,
      }))
      .filter((a) =>
        a.user_title?.toLowerCase().includes(itemFilter.toLowerCase())
      );
  }, [itemFilter, itemsData, users]);
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
  }, [btn, warehousePopup, users]);
  useEffect(() => {
    getUsers();
  }, []);

  return (
    <>
      <div className="itemavilablelity">
        <div
          className="itemavilabelitycontainer"
          style={{ position: "relative" }}
        >
          <div className="itemavilablelity_header">
            <h2>Cash Registrations</h2>
          </div>

          <div className="availablecontainer">
            <div className="itemavilablelitybox">
              <div
                className="flex"
                style={{ justifyContent: "space-between", width: "50%" }}
              >
                <input
                  className="numberInput"
                  type="text"
                  name="item_filter"
                  value={itemFilter}
                  onChange={(e) => {
                    setItemFilter(e.target.value);
                  }}
                  placeholder="Items Register"
                  style={{ width: "300px", margin: "10px 0" }}
                />
                <button
                  className="theme-btn"
                  onClick={() => setPopupForm(true)}
                >
                  Add Register
                </button>
              </div>

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
                        Users
                      </th>
                      <th
                        className="pa3 bb b--black-20 "
                        style={{ borderBottom: "2px solid rgb(189, 189, 189)" }}
                      >
                        Balance
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
                    {filterCashRegister
                      .sort((a, b) => a.created_at - b.created_at)
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
                            {item?.user_title || ""}
                          </td>
                          <td
                            className="ph3 bb b--black-20 tc bg-white"
                            style={{ textAlign: "center" }}
                          >
                            {item?.balance || ""}
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
                                  top: "-20px",
                                  flexDirection: "column",
                                  left: "-200px",
                                  zIndex: "200",
                                  width: "200px",
                                  height: "135px",
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
                                  className="theme-btn"
                                  style={{
                                    display: "inline",
                                    cursor: item?.orderLength
                                      ? "not-allowed"
                                      : "pointer",
                                    width: "100%",
                                  }}
                                  type="button"
                                  onClick={() => {
                                    setPopupForm({ ...item, status: 0 });
                                  }}
                                  disabled={item?.orderLength}
                                >
                                  Complete
                                </button>
                                <button
                                  className="theme-btn"
                                  style={{
                                    display: "inline",
                                    cursor: item?.orderLength
                                      ? "not-allowed"
                                      : "pointer",
                                    width: "100%",
                                  }}
                                  type="button"
                                  onClick={() => {
                                    setPopupForm({ ...item, expense: true });
                                  }}
                                  disabled={item?.orderLength}
                                >
                                  Expense
                                </button>

                                <button
                                  className="theme-btn"
                                  style={{
                                    display: "inline",
                                    cursor: "pointer",
                                    width: "100%",
                                  }}
                                  type="button"
                                  onClick={() => getStatement(item)}
                                >
                                  Statement
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
              setCashRegisterPopup(false);
            }}
            className="closeButton"
          >
            x
          </button>

          <div
            onClick={() => {
              setCashRegisterPopup(false);
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
      {counterPopup ? (
        <CounterTable
          onSave={() => setCounterPopup(false)}
          trip_uuid={counterPopup}
        />
      ) : (
        ""
      )}
      {popupForm ? (
        <NewRegisterForm
          onSave={() => {
            setPopupForm(false);
            getTripData();
          }}
          setItemsData={setItemsData}
          popupInfo={popupForm}
          items={itemsData}
          setNotification={setNotification}
        />
      ) : (
        ""
      )}
      <div style={{ display: "none" }}>
        <div ref={statementRef}>
          <TransactionsStatement {...statementData} />
        </div>
      </div>
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
function CounterTable({ trip_uuid, onSave }) {
  const [counter, setCounter] = useState([]);
  const [filterCounterTitle, setFilterCounterTitle] = useState("");
  const [routesData, setRoutesData] = useState([]);
  const [filterRouteTitle, setFilterRouteTitle] = useState("");

  const getCounter = async (controller = new AbortController()) => {
    const response = await axios({
      method: "post",
      url: "/counters/GetCounterData",
      signal: controller.signal,
      data: ["counter_uuid", "counter_title", "trip_uuid", "route_uuid"],
      headers: {
        "Content-Type": "application/json",
      },
    });
    if (response.data.success) {
      setCounter(
        response.data.result.sort((a, b) =>
          (a.trip_uuid === b.trip_uuid) === trip_uuid
            ? 0
            : a.trip_uuid === trip_uuid
            ? -1
            : 1
        )
      );
    }
  };
  const getRoutesData = async (controller = new AbortController()) => {
    const response = await axios({
      method: "get",
      url: "/routes/GetRouteList",
      signal: controller.signal,
      headers: {
        "Content-Type": "application/json",
      },
    });
    if (response.data.success) setRoutesData(response.data.result);
  };
  useEffect(() => {
    let controller = new AbortController();
    getCounter(controller);
    getRoutesData(controller);
    return () => {
      controller.abort();
    };
  }, []);
  const submitHandler = async (e) => {
    e.preventDefault();
    const response = await axios({
      method: "put",
      url: "/counters/putCounter",
      data: counter.filter((a) => a.edit),
      headers: {
        "Content-Type": "application/json",
      },
    });
    if (response.data.success) {
      onSave();
    }
  };
  const filterCounter = useMemo(
    () =>
      counter?.filter(
        (a) =>
          a.counter_uuid &&
          (!filterCounterTitle ||
            a.counter_title
              ?.toLocaleLowerCase()
              ?.includes(filterCounterTitle?.toLocaleLowerCase()))
      ),
    [counter, filterCounterTitle]
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
            filterCounter?.filter((b) => a.route_uuid === b.route_uuid)?.length
        )

        .sort((a, b) => a?.route_title?.localeCompare(b?.route_title)),
    [filterRouteTitle, filterCounter, routesData]
  );

  return (
    <div className="overlay" style={{ zIndex: 9999999 }}>
      <div
        className="modal"
        style={{
          height: "max-content",
          width: "fit-content",
          maxHeight: "90vh",
        }}
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
                <h1>Counters</h1>
              </div>
              <div className="formGroup">
                <div className="flex">
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
                    placeholder="Search route Title..."
                    className="searchInput"
                  />
                </div>

                <div className="row">
                  <div
                    style={{
                      overflowY: "scroll",
                      height: "45vh",
                      minWidth: "600px",
                    }}
                  >
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
                            <tr
                              style={{ pageBreakAfter: "auto", width: "100%" }}
                            >
                              <td colSpan={2}>
                                {a.route_title}
                                <span
                                  onClick={(e) => {
                                    e.stopPropagation();

                                    setCounter((prev) => {
                                      let counter_trip_uuid =
                                        filterCounter?.filter(
                                          (b) =>
                                            a.route_uuid === b.route_uuid &&
                                            trip_uuid === b.trip_uuid
                                        )?.length ===
                                        filterCounter?.filter(
                                          (b) => a.route_uuid === b.route_uuid
                                        )?.length
                                          ? ""
                                          : trip_uuid;
                                      return prev.map((count) =>
                                        count.route_uuid === a.route_uuid
                                          ? {
                                              ...count,
                                              trip_uuid: counter_trip_uuid,
                                              edit: true,
                                            }
                                          : count
                                      );
                                    });
                                  }}
                                  style={{ marginLeft: "10px" }}
                                >
                                  <input
                                    type="checkbox"
                                    checked={
                                      filterCounter?.filter(
                                        (b) =>
                                          a.route_uuid === b.route_uuid &&
                                          trip_uuid === b.trip_uuid
                                      )?.length ===
                                      filterCounter?.filter(
                                        (b) => a.route_uuid === b.route_uuid
                                      )?.length
                                    }
                                    style={{ transform: "scale(1.3)" }}
                                  />
                                </span>
                              </td>
                              <td
                                onClick={() =>
                                  setRoutesData((prev) =>
                                    prev.map((b) =>
                                      b.route_uuid === a.route_uuid
                                        ? { ...b, expand: !b.expand }
                                        : b
                                    )
                                  )
                                }
                                style={{
                                  // fontSize: "20px",
                                  // width: "20px",
                                  transition: "all ease 1s",
                                }}
                              >
                                {filterCounter?.filter(
                                  (c) =>
                                    a.route_uuid === c.route_uuid &&
                                    c.trip_uuid === trip_uuid
                                ).length +
                                  "/" +
                                  filterCounter?.filter(
                                    (c) => a.route_uuid === c.route_uuid
                                  ).length}
                                {a.expand ? (
                                  <ArrowDropUp
                                    style={{ fontSize: "20px", width: "20px" }}
                                  />
                                ) : (
                                  <ArrowDropDown
                                    style={{ fontSize: "20px", width: "20px" }}
                                  />
                                )}
                              </td>
                            </tr>
                            {a.expand
                              ? filterCounter
                                  ?.filter((b) => a.route_uuid === b.route_uuid)
                                  ?.sort((a, b) =>
                                    a.counter_title?.localeCompare(
                                      b.counter_title
                                    )
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
                                            setCounter((prev) =>
                                              prev.map((a) =>
                                                a.counter_uuid ===
                                                item.counter_uuid
                                                  ? {
                                                      ...a,
                                                      trip_uuid:
                                                        a.trip_uuid ===
                                                        trip_uuid
                                                          ? ""
                                                          : trip_uuid,
                                                      edit: true,
                                                    }
                                                  : a
                                              )
                                            );
                                          }}
                                          className="flex"
                                          style={{
                                            justifyContent: "space-between",
                                          }}
                                        >
                                          <input
                                            type="checkbox"
                                            checked={
                                              item.trip_uuid === trip_uuid
                                            }
                                            style={{
                                              transform: "scale(1.3)",
                                            }}
                                          />
                                          {i + 1}
                                        </td>

                                        <td colSpan={2}>
                                          {item.counter_title || ""}
                                        </td>
                                      </tr>
                                    );
                                  })
                              : ""}
                          </>
                        ))}
                      </tbody>
                    </table>
                    {/* <table className="table">
                      <thead>
                        <tr>
                          <th className="description" style={{ width: "10%" }}>
                            S.r
                          </th>

                          <th className="description" style={{ width: "25%" }}>
                            Counter
                          </th>

                          <th style={{ width: "25%" }}>Action</th>
                        </tr>
                      </thead>

                      <tbody>
                        {filterCounter.map((item, index) => {
                          return (
                            <tr key={item.counter_uuid}>
                              <td>{index + 1}</td>

                              <td>{item?.counter_title}</td>

                              <td>
                                <button
                                  type="button"
                                  className="noBgActionButton"
                                  style={{
                                    backgroundColor:
                                      item.trip_uuid === trip_uuid
                                        ? "red"
                                        : "var(--mainColor)",
                                    width: "150px",
                                    fontSize: "large",
                                  }}
                                  onClick={(event) =>
                                    setCounter((prev) =>
                                      prev.map((a) =>
                                        a.counter_uuid === item.counter_uuid
                                          ? {
                                              ...a,
                                              trip_uuid:
                                                a.trip_uuid === trip_uuid
                                                  ? ""
                                                  : trip_uuid,
                                              edit: true,
                                            }
                                          : a
                                      )
                                    )
                                  }
                                >
                                  {item.trip_uuid === trip_uuid
                                    ? "Remove"
                                    : "Add"}
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table> */}
                  </div>
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
function NewRegisterForm({
  onSave,
  popupInfo,

  setNotification,
}) {
  const [data, setData] = useState({ amt: 0, expense_uuid: "", remarks: "" });
  const [expense, setExpense] = useState([]);
  const [loader, setLoader] = useState(false);

  const submitHandler = async (e) => {
    let obj = { created_by: localStorage.getItem("user_uuid") };
    e.preventDefault();

    if (popupInfo?.expense) {
      if (data.expense_uuid === "") {
        setNotification({ success: false, message: "Please select expense" });
        setTimeout(() => setNotification(null), 3000);
        return;
      }
      obj = { register_uuid: popupInfo.register_uuid, ...data };
      const response = await axios({
        method: "put",
        url: "/cashRegistrations/PutExpenseCashRegister",
        data: obj,
        headers: {
          "Content-Type": "application/json",
        },
      });
      if (response.data.success) {
        onSave();
      }
    } else if (popupInfo?.register_uuid) {
      obj = { register_uuid: popupInfo.register_uuid, status: 0 };
      const response = await axios({
        method: "put",
        url: "/cashRegistrations/PutCashRegister",
        data: obj,
        headers: {
          "Content-Type": "application/json",
        },
      });
      if (response.data.success) {
        onSave();
      }
    } else {
      const response = await axios({
        method: "post",
        url: "/cashRegistrations/PostCashRegister",
        data: obj,
        headers: {
          "Content-Type": "application/json",
        },
      });
      if (response.data.success) {
        onSave();
      } else {
        setNotification(response.data);
        setTimeout(() => setNotification(null), 3000);
      }
    }
  };
  const getItemsData = async (controller = new AbortController()) => {
    setLoader(true);
    const response = await axios({
      method: "get",
      url: "/expense/GetAllExpenses",
      signal: controller.signal,
      headers: {
        "Content-Type": "application/json",
      },
    });
    if (response.data.success) setExpense(response.data.result);
    setLoader(false);
  };
  useEffect(() => {
    const controller = new AbortController();
    if (popupInfo?.expense) getItemsData(controller);
    return () => {
      controller.abort();
    };
  }, [popupInfo?.expense]);
  return (
    <div className="overlay" style={{ zIndex: 9999999 }}>
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
          {loader ? (
            <div className="loader">
              <div className="loader-spinner"></div>
            </div>
          ) : (
            <div style={{ overflowY: "scroll" }}>
              <form className="form" onSubmit={submitHandler}>
                <div className="row">
                  <h1>
                    {popupInfo.expense
                      ? "Expense"
                      : popupInfo.register_uuid
                      ? "Complete"
                      : "Add"}{" "}
                    Register
                  </h1>
                </div>

                {popupInfo.expense ? (
                  <div className="row">
                    <label className="selectLabel">
                      Expense
                      <select
                        name="user_type"
                        className="select"
                        value={data?.expense_uuid}
                        onChange={(e) =>
                          setData({
                            ...data,
                            expense_uuid: e.target.value,
                            expense_title:
                              expense.find(
                                (a) => a.company_uuid === e.target.value
                              )?.expense_title ?? "",
                          })
                        }
                      >
                        <option value="" disabled>
                          None
                        </option>
                        {expense
                          .sort((a, b) =>
                            a.expense_title?.localeCompare(b.expense_title)
                          )
                          .map((a) => (
                            <option value={a.expense_uuid}>
                              {a.expense_title}
                            </option>
                          ))}
                      </select>
                    </label>
                    <label className="selectLabel">
                      Amount
                      <input
                        type="number"
                        name="one_pack"
                        className="numberInput"
                        value={data.amt}
                        onChange={(e) =>
                          setData((prev) => ({ ...prev, amt: e.target.value }))
                        }
                      />
                    </label>
                    <label className="selectLabel">
                      Remarks
                      <input
                        type="text"
                        name="one_pack"
                        className="numberInput"
                        placeholder="Remarks"
                        value={data.remarks}
                        onChange={(e) =>
                          setData((prev) => ({
                            ...prev,
                            remarks: e.target.value,
                          }))
                        }
                      />
                    </label>
                  </div>
                ) : (
                  ""
                )}

                <button type="submit" className="submit">
                  {popupInfo.expense
                    ? "Save"
                    : popupInfo.register_uuid
                    ? "Complete"
                    : " Save"}
                </button>
              </form>
            </div>
          )}
          <button onClick={onSave} className="closeButton">
            x
          </button>
        </div>
      </div>
    </div>
  );
}
