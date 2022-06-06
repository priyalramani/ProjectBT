import axios from "axios";
import React, {
  useState,
  useEffect,
  useContext,
  useCallback,
  useRef,
} from "react";
import { useReactToPrint } from "react-to-print";
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
        <div className="itemavilabelitycontainer">
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
                        colSpan={3}
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
                              Assign
                            </button>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

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
      <div
        ref={componentRef}
        style={{
          width: "21cm",
          height: "29.7cm",
          margin: "30mm 45mm 30mm 45mm",
          textAlign: "center",
          position: "fixed",
          top: -100,
          left: -180,
          zIndex: "-1000",
          padding: "100px",
        }}
      >
        <TripPage
          ref={componentRef}
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
        />
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

const TripPage = ({
  trip_title,
  users,
  trip_uuid,
  created_at,
  cheque,
  replacement,
  sales_return,
  coin,
  amt,
  formatAMPM,
}) => {
  console.log(
    cheque,
    replacement,
    sales_return,
    );
  if (!trip_title) return <div />;
  return (
    <>
      <table style={{ width: "100%", margin: "10px" }}>
        <tr style={{ width: "100%" }}>
          <td
            colSpan={2}
            style={{
              width: "100%",
              fontSize: "xx-large",
              fontWeight: "bolder",
            }}
          >
            {trip_title}
          </td>
        </tr>
        <tr>
          <td colSpan={2} style={{ fontSize: "larger", fontWeight: "bold" }}>
            {users.map((a, i) =>
              i === 0 ? a?.user_title : ", " + a?.user_title
            )}
          </td>{" "}
        </tr>
        <tr>
          <td style={{ fontSize: "small", textAlign: "left" }}></td>
          <td></td>
        </tr>
        <tr>
          <td style={{ fontSize: "small", textAlign: "left" }}>
            Trip UUID : {trip_uuid}
          </td>
          <td></td>
        </tr>
        <tr>
          <td style={{ fontSize: "small", textAlign: "left" }}>
            Trip Created At : {created_at}
          </td>
          <td></td>
        </tr>
        <tr>
          <td style={{ fontSize: "small", textAlign: "left" }}>
            Statement Printed At : {formatAMPM(new Date())}
          </td>
          <td></td>
        </tr>
      </table>
      <table style={{ margin: "10px" }}>
        <tr>
          <td style={{ fontSize: "small", textAlign: "left" }}>
            Total Cash : {amt}
          </td>
        </tr>
        <tr>
          <td style={{ fontSize: "small", textAlign: "left" }}>
            Coin : {coin}
          </td>
        </tr>
      </table>
      {cheque.length?<table style={{ margin: "10px", width: "100%" }}>
        <tr>
          <td style={{ fontSize: "small", textAlign: "left" }}>
            Cheque Details
          </td>
        </tr>
        <tr>
          <th style={{ border: "1px solid #000" }}>Counter</th>
          <th style={{ border: "1px solid #000" }}>Amount</th>
          <th style={{ border: "1px solid #000" }}>Invoice Number</th>
        </tr>
        {cheque.map((item) => (
          <tr>
            <td style={{ border: "1px solid #000" }}>{item.counter}</td>
            <td style={{ border: "1px solid #000" }}>{item.amt}</td>
            <td style={{ border: "1px solid #000" }}>{item.invoice_number}</td>
          </tr>
        ))}
      </table>:""}
      {replacement.length?<table style={{ margin: "10px", width: "100%" }}>
        <tr>
          <td style={{ fontSize: "small", textAlign: "left" }}>
            Counter Wise Replacements:
          </td>
        </tr>
        <tr>
          <th style={{ border: "1px solid #000" }}>Counter</th>
          <th style={{ border: "1px solid #000" }}>Replacement MRP</th>
          <th style={{ border: "1px solid #000" }}>Replacement</th>
          <th style={{ border: "1px solid #000" }}>Invoice Number</th>
        </tr>
        {replacement.map((item) => (
          <tr>
            <td style={{ border: "1px solid #000" }}>{item.counter_title}</td>
            <td style={{ border: "1px solid #000" }}>{item.replacement}</td>
            <td style={{ border: "1px solid #000" }}>{item.replacement_mrp}</td>
            <td style={{ border: "1px solid #000" }}>{item.invoice_number}</td>
          </tr>
        ))}
        <tr style={{ fontWeight: "bold" }}>
          <td style={{ border: "1px solid #000" }}>Total</td>
          <td style={{ border: "1px solid #000" }}>
            {replacement.length > 1
              ? replacement
                  .map((a) => +a.replacement || 0)
                  .reduce((a, b) => a + b)
              : replacement[0].replacement}
          </td>
          <td style={{ border: "1px solid #000" }}>
            {replacement.length > 1
              ? replacement
                  .map((a) => +a.replacement_mrp || 0)
                  .reduce((a, b) => a + b)
              : replacement[0].replacement_mrp}
          </td>
          <td style={{ border: "1px solid #000" }}></td>
        </tr>
      </table>:""}
      {sales_return.length?<table style={{ margin: "10px", width: "100%" }}>
        <tr>
          <td style={{ fontSize: "small", textAlign: "left" }}>
            Sales Return Items:
          </td>
        </tr>
        <tr>
          <th style={{ border: "1px solid #000" }}>Item</th>
          <th style={{ border: "1px solid #000" }}>Quantity</th>
        </tr>
        {sales_return.map((item) => (
          <tr>
            <td style={{ border: "1px solid #000" }}>{item.item_title}</td>
            <td style={{ border: "1px solid #000" }}>
              {item.b}:{item.p}
            </td>
          </tr>
        ))}
      </table>:""}
    </>
  );
};
