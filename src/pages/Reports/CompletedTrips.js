import axios from "axios";
import React, { useEffect, useState } from "react";
import Header from "../../components/Header";
import Sidebar from "../../components/Sidebar";
let date = new Date();
const CompletedTrips = () => {
  const [searchData, setSearchData] = useState({
    startDate: "",
    endDate: "",
    user_uuid: "",
  });
  const [users, setUsers] = useState([]);
  const [items, setItems] = useState([]);
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

  const getActivityData = async () => {
    let startDate = new Date(searchData.startDate + " 00:00:00 AM");
    startDate = startDate.getTime();
    let endDate = new Date(searchData.endDate + " 00:00:00 AM");
    endDate = endDate.getTime();

    const response = await axios({
      method: "post",
      url: "/trips/GetCompletedTripList",
      data: { user_uuid: searchData.user_uuid, startDate, endDate },
      headers: {
        "Content-Type": "application/json",
      },
    });
    console.log("activity", response);
    if (response.data.success) setItems(response.data.result);
  };
  useEffect(() => {
    let time = new Date();
    let curTime = "yy-mm-dd"
      .replace("mm", ("00" + (time?.getMonth() + 1).toString()).slice(-2))
      .replace("yy", ("0000" + time?.getFullYear().toString()).slice(-4))
      .replace("dd", ("00" + time?.getDate().toString()).slice(-2));
    setSearchData((prev) => ({
      ...prev,
      startDate: curTime,
      endDate: curTime,
    }));
    getUsers();
  }, []);
  useEffect(() => {
    if (users.length)
      setSearchData((prev) => ({ ...prev, user_uuid: users[0]?.user_uuid }));
  }, [users]);
  console.log(searchData);
  return (
    <>
      <Sidebar />
      <Header />
      <div className="item-sales-container orders-report-container">
        <div id="heading">
          <h2>User Activity </h2>
        </div>
        <div id="item-sales-top">
          <div
            id="date-input-container"
            style={{
              overflow: "visible",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              width: "100%",
            }}
          >
            <input
              type="date"
              onChange={(e) =>
                setSearchData((prev) => ({
                  ...prev,
                  startDate: e.target.value,
                }))
              }
              max={"yy-mm-dd"
                .replace(
                  "mm",
                  ("00" + (date?.getMonth() + 1).toString()).slice(-2)
                )
                .replace(
                  "yy",
                  ("0000" + date?.getFullYear().toString()).slice(-4)
                )
                .replace("dd", ("00" + date?.getDate().toString()).slice(-2))}
              value={searchData.startDate}
              placeholder="Search Counter Title..."
              className="searchInput"
            />
            <input
              type="date"
              onChange={(e) =>
                setSearchData((prev) => ({ ...prev, endDate: e.target.value }))
              }
              max={"yy-mm-dd"
                .replace(
                  "mm",
                  ("00" + (date?.getMonth() + 1).toString()).slice(-2)
                )
                .replace(
                  "yy",
                  ("0000" + date?.getFullYear().toString()).slice(-4)
                )
                .replace("dd", ("00" + date?.getDate().toString()).slice(-2))}
              value={searchData.endDate}
              placeholder="Search Route Title..."
              className="searchInput"
            />
            <select
              className="searchInput"
              onChange={(e) =>
                setSearchData((prev) => ({
                  ...prev,
                  startDate: e.target.value,
                }))
              }
              value={searchData.startDate}
            >
              {users
                .filter((a) => a.user_uuid)
                .map((a) => (
                  <option value={a.user_uuid}>{a.user_title}</option>
                ))}
            </select>

            <button
              className="item-sales-search"
              onClick={() => getActivityData()}
            >
              Search
            </button>
          </div>
        </div>
        <div className="table-container-user item-sales-container">
          <Table itemsDetails={items} />
        </div>
      </div>
    </>
  );
};

export default CompletedTrips;

function Table({ itemsDetails }) {
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
  function format(date) {
    var hours = (date / 3600000).toFixed(0);
    var minutes = (date / 60000).toFixed(0);

    minutes = minutes < 10 ? "0" + minutes : minutes;

    var strTime = hours + ":" + minutes;
    return strTime;
  }
  return (
    <table
      className="user-table"
      style={{ maxWidth: "100vw", height: "fit-content", overflowX: "scroll" }}
    >
      <thead>
        <tr>
          <th>S.N</th>
          <th colSpan={2}>Created At</th>
          <th colSpan={3}>Trip Title</th>
          <th colSpan={2}>Users</th>
          <th colSpan={2}>Orders</th>
        </tr>
      </thead>
      <tbody className="tbody">
        {itemsDetails
          ?.sort((a, b) => a.created_at - b.created_at)
          ?.map((item, i, array) => (
            <tr key={Math.random()} style={{ height: "30px" }}>
              <td>{i + 1}</td>
              <td colSpan={2}>
                {new Date(item.created_at).toDateString()} -{" "}
                {formatAMPM(new Date(item.created_at))}
              </td>
              <td colSpan={3}>{item.trip_title || ""}</td>
              <td colSpan={2}>
                {item.users.length
                  ? item.users.map((b, index) =>
                      index !== 0 ? ", " + b.user_title : b.user_title
                    )
                  : ""}
              </td>
              <td colSpan={2}>{item.orderLength || ""}</td>
            </tr>
          ))}
      </tbody>
    </table>
  );
}