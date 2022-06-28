import axios from "axios";
import React, {
  useState,
  useEffect,
  useContext,
  useCallback,
  useRef,
} from "react";
import { useReactToPrint } from "react-to-print";
import TripPage from "./TripPage";
export default function ItemAvilibility({
  isItemAvilableOpen,
  setIsItemAvilableOpen,
}) {
  const [itemsData, setItemsData] = useState([]);
  const [popup, setPopup] = useState(null);
  const [users, setUsers] = useState([]);
  const [btn, setBtn] = useState(false);
  const [itemFilter, setItemFilter] = useState("");
  const [statementTrip, setStatementTrip] = useState();
  const [detailsPopup, setDetailsPopup] = useState(false);
  const componentRef = useRef(null);
  const reactToPrintContent = useCallback(() => {
    return componentRef.current;
  }, [statementTrip]);

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
    if (response.data.success) setUsers(response.data.result);
  };
  const getTripData = async () => {
    const response = await axios({
      method: "get",
      url: "/trips/GetTripListSummary",

      headers: {
        "Content-Type": "application/json",
      },
    });
    if (response.data.success)
      setItemsData(response.data.result.filter((a) => a.status));
  };
  useEffect(() => {
    getTripData();
  }, [btn]);
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
                        Order
                      </th>
                      <th
                        className="pa3 bb b--black-20 "
                        style={{ borderBottom: "2px solid rgb(189, 189, 189)" }}
                        colSpan={4}
                      >
                        Action
                      </th>
                    </tr>
                  </thead>
                  <tbody className="lh-copy">
                    {itemsData
                      .sort((a, b) => a.trip_title.localeCompare(b.trip_title))
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
                            {item.orderLength}
                          </td>
                          <td
                            className="ph3 bb b--black-20 tc bg-white"
                            style={{ textAlign: "center" }}
                          >
                            <button
                              className="item-sales-search"
                              style={{
                                display: "inline",
                                cursor: item?.orderLength
                                  ? "not-allowed"
                                  : "pointer",
                              }}
                              type="button"
                              onClick={() => {
                                completeFunction({ ...item, status: 0 });
                              }}
                              disabled={item?.orderLength}
                            >
                              Complete
                            </button>
                          </td>
                          <td
                            className="ph3 bb b--black-20 tc bg-white"
                            style={{ textAlign: "center" }}
                          >
                            <button
                              className="item-sales-search"
                              style={{
                                display: "inline",
                                cursor: "pointer",
                              }}
                              type="button"
                              onClick={() => {
                                setStatementTrip(item);
                                setTimeout(handlePrint, 2000);
                              }}
                            >
                              Statement
                            </button>
                          </td>
                          <td
                            className="ph3 bb b--black-20 tc bg-white"
                            style={{ textAlign: "center" }}
                          >
                            <button
                              className="item-sales-search"
                              style={{
                                display: "inline",
                              }}
                              type="button"
                              onClick={() => {
                                setPopup(item);
                              }}
                            >
                              Users
                            </button>
                          </td>
                          <td>
                            <button
                              className="item-sales-search"
                              style={{
                                display: "inline",
                              }}
                              type="button"
                              onClick={() => {
                                setDetailsPopup(item.trip_uuid);
                              }}
                            >
                              Details
                            </button>
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
      {detailsPopup ? (
        <PopupTable
          trip_uuid={detailsPopup}
          onSave={() => setDetailsPopup("")}
        />
      ) : (
        ""
      )}
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
              itemsData
                .filter(
                  (a) =>
                    (itemFilter !== ""
                      ? a.trip_title
                          .toLowerCase()
                          .includes(itemFilter.toLowerCase())
                      : true) && a.trip_title
                )[0]
                ?.users.map((a) => users.find((b) => b.user_uuid === a)) || []
            }
            trip_uuid={statementTrip?.trip_uuid || ""}
            created_at={formatAMPM(new Date(statementTrip?.created_at || ""))}
            amt={statementTrip?.amt || 0}
            coin={statementTrip?.coin || 0}
            formatAMPM={formatAMPM}
            cheque={statementTrip?.cheque}
            replacement={statementTrip?.replacement}
            sales_return={statementTrip?.sales_return}
            unpaid_invoice={statementTrip?.unpaid_invoice}
          />
        </div>
      </div>
    </>
  );
}
function NewUserForm({ onSave, popupInfo, users, completeFunction }) {
  const [data, setdata] = useState([]);
  useEffect(() => {
    setdata(popupInfo?.users || []);
  }, []);

  const submitHandler = async (e) => {
    e.preventDefault();
    completeFunction({ ...popupInfo, users: data });
    onSave();
  };
  const onChangeHandler = (e) => {
    let temp = data || [];
    let options = Array.from(
      e.target.selectedOptions,
      (option) => option.value
    );
    for (let i of options) {
      if (data.filter((a) => a === i).length)
        temp = temp.filter((a) => a !== i);
      else temp = [...temp, i];
    }
    // temp = data.filter(a => options.filter(b => b === a.user_uuid).length)
    console.log(options, temp);

    setdata(temp);
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
                    Counter Title
                    <select
                      className="numberInput"
                      style={{ width: "200px", height: "200px" }}
                      value={data.map((a) => a)}
                      onChange={onChangeHandler}
                      multiple
                    >
                      {/* <option selected={occasionsTemp.length===occasionsData.length} value="all">All</option> */}
                      {users.map((occ) => (
                        <option
                          value={occ.user_uuid}
                          style={{ marginBottom: "5px", textAlign: "center" }}
                        >
                          {occ.user_title}
                        </option>
                      ))}
                    </select>
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
function PopupTable({ trip_uuid, onSave }) {
  const [itemDetails, setItemDetails] = useState([]);
  const [counter, setCounter] = useState([]);
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
  const getCompleteOrders = async () => {
    if (trip_uuid) {
      const response = await axios({
        method: "post",
        url: "/orders/getTripCompletedOrderList",
        data: { trip_uuid },
        headers: {
          "Content-Type": "application/json",
        },
      });
      console.log("activity", response);
      if (response.data.success) setItemDetails(response.data.result);
    }
  };
  useEffect(() => {
    getCompleteOrders();
    getCounter();
  }, [trip_uuid]);
  return (
    <div className="overlay" style={{zIndex:999999999999}}>
      <div
        className="modal"
        style={{
          height: "500px",
          width: "max-content",
          minWidth: "206px",
          padding: "10px",
          paddingTop: "40px",
        }}
      >
        <div
          className="content"
          style={{
            padding: "20px",
            width: "80vw",
            overflow: "scroll",
          }}
        >
          <table
            className="user-table"
            style={{
              maxWidth: "100vw",

              overflowX: "scroll",
            }}
          >
            <thead>
              <tr>
                <th>S.N</th>
                <th colSpan={4}>Order Date</th>
                <th colSpan={4}>Delivery Date</th>
                <th colSpan={4}>Counter</th>
                <th colSpan={2}>Invoice</th>
                <th colSpan={2}>Qty</th>
                <th colSpan={2}>Amount</th>
                <th colSpan={2}>Cash</th>
                <th colSpan={2}>Cheque</th>
                <th colSpan={2}>UPI</th>
                <th colSpan={2}>Unpaid</th>
              </tr>
            </thead>
            <tbody className="tbody">
              {itemDetails
                ?.sort((a, b) => a.order_date - b.order_date)
                ?.map((item, i) => (
                  <tr key={Math.random()} style={{ height: "30px" }}>
                    <td>{i + 1}</td>
                    <td colSpan={4}>
                      {new Date(item.order_date).toDateString()} -{" "}
                      {formatAMPM(new Date(item.order_date))}
                    </td>
                    <td colSpan={4}>
                      {new Date(item.delivery_date).toDateString()} -{" "}
                      {formatAMPM(new Date(item.delivery_date))}
                    </td>
                    <td colSpan={4}>
                      {counter.find((a) => a.counter_uuid === item.counter_uuid)
                        ?.counter_title || ""}
                    </td>
                    <td colSpan={2}>{item.invoice_number || ""}</td>
                    <td colSpan={2}>{item.qty || ""}</td>
                    <td colSpan={2}>{item.amt || ""}</td>
                    <td colSpan={2}>
                      {item.modes.find(
                        (a) =>
                          a.mode_uuid === "c67b54ba-d2b6-11ec-9d64-0242ac120002"
                      )?.amt || 0}
                    </td>
                    <td colSpan={2}>
                      {item.modes.find(
                        (a) =>
                          a.mode_uuid === "c67b5794-d2b6-11ec-9d64-0242ac120002"
                      )?.amt || 0}
                    </td>
                    <td colSpan={2}>
                      {item.modes.find(
                        (a) =>
                          a.mode_uuid === "c67b5988-d2b6-11ec-9d64-0242ac120002"
                      )?.amt || 0}
                    </td>
                    <td colSpan={2}>{item.unpaid || 0}</td>
                  </tr>
                ))}
              <tr style={{ height: "30px" }}>
                <td></td>
                <td colSpan={4}>
                  <b>Total</b>
                </td>
                <td colSpan={4}></td>
                <td colSpan={4}></td>
                <td colSpan={2}></td>
                <td colSpan={2}></td>
                <td colSpan={2}>
                  <b>
                    {itemDetails.length > 1
                      ? itemDetails
                          .map((a) => +a?.amt || 0)
                          .reduce((a, b) => a + b)
                      : itemDetails[0]?.amt || 0}
                  </b>
                </td>
                <td colSpan={2}>
                  <b>
                    {itemDetails.length > 1
                      ? itemDetails
                          .map(
                            (a) =>
                              +a?.modes.find(
                                (a) =>
                                  a.mode_uuid ===
                                  "c67b54ba-d2b6-11ec-9d64-0242ac120002"
                              )?.amt || 0
                          )
                          .reduce((a, b) => a + b)
                      : itemDetails[0]?.modes.find(
                          (a) =>
                            a.mode_uuid ===
                            "c67b54ba-d2b6-11ec-9d64-0242ac120002"
                        )?.amt || 0}
                  </b>
                </td>
                <td colSpan={2}>
                  <b>
                    {itemDetails.length > 1
                      ? itemDetails
                          .map(
                            (a) =>
                              +a?.modes.find(
                                (a) =>
                                  a.mode_uuid ===
                                  "c67b5794-d2b6-11ec-9d64-0242ac120002"
                              )?.amt || 0
                          )
                          .reduce((a, b) => a + b)
                      : itemDetails[0]?.modes.find(
                          (a) =>
                            a.mode_uuid ===
                            "c67b5794-d2b6-11ec-9d64-0242ac120002"
                        )?.amt || 0}
                  </b>
                </td>
                <td colSpan={2}>
                  <b>
                    {itemDetails.length > 1
                      ? itemDetails
                          .map(
                            (a) =>
                              +a?.modes.find(
                                (a) =>
                                  a.mode_uuid ===
                                  "c67b5988-d2b6-11ec-9d64-0242ac120002"
                              )?.amt || 0
                          )
                          .reduce((a, b) => a + b)
                      : itemDetails[0]?.modes.find(
                          (a) =>
                            a?.mode_uuid ===
                            "c67b5988-d2b6-11ec-9d64-0242ac120002"
                        )?.amt || 0}
                  </b>
                </td>
                <td colSpan={2}>
                  <b>
                    {itemDetails.length > 1
                      ? itemDetails
                          .map((a) => +a?.unpaid || 0)
                          .reduce((a, b) => a + b)
                      : itemDetails[0]?.unpaid || 0}
                  </b>
                </td>
              </tr>
            </tbody>
          </table>
          <button onClick={onSave} className="closeButton">
            x
          </button>
        </div>
      </div>
    </div>
  );
}
