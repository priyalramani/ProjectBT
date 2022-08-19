import axios from "axios";
import React, { useEffect, useState } from "react";
import Header from "../../components/Header";
import Sidebar from "../../components/Sidebar";

const Outstanding = () => {
  const [outstanding, setOutstanding] = useState();
  const [users, setUsers] = useState([]);
  const [counters, setCounters] = useState([]);

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
  const getOutstanding = async () => {
    const response = await axios({
      method: "get",
      url: "/Outstanding/getOutstanding",

      headers: {
        "Content-Type": "application/json",
      },
    });
    console.log("users", response);
    if (response.data.success)
      setOutstanding(
        response.data.result.map((a) => ({
          ...a,
          user_title: users.find((b) => b.user_uuid === a.user_uuid)
            ?.user_title,
          counter_title: counters.find((b) => b.counter_uuid === a.counter_uuid)
            ?.counter_title,
        }))
      );
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
    getUsers();
  }, []);
  useEffect(() => {
    getOutstanding();
  }, [counters, users]);
  return (
    <>
      <Sidebar />
      <Header />
      <div className="item-sales-container orders-report-container">
        <div id="heading">
          <h2>Outstanding</h2>
        </div>

        <div className="table-container-user item-sales-container">
          <Table itemsDetails={outstanding} />
        </div>
      </div>
    </>
  );
};

export default Outstanding;

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
    let time = new Date();
    time = time.getTime() - date;

    var hours = time / 3600000;
    var minutes = Math.floor(+(hours-(+hours.toString().split(".")[0])) * 60);

    minutes = +minutes < 10 ? "0" + minutes : minutes;

    var strTime = Math.floor(hours) + ":" + minutes;
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
          <th colSpan={3}>Time Stamp</th>
          <th colSpan={2}>User</th>
          <th colSpan={2}>Invoice Number</th>
          <th colSpan={2}>Counter</th>
          <th colSpan={2}>Duration</th>
          <th colSpan={2}>Amount</th>
        </tr>
      </thead>
      <tbody className="tbody">
        {itemsDetails
          ?.sort((a, b) => a.time - b.time)
          ?.map((item, i, array) => (
            <tr key={Math.random()} style={{ height: "30px" }}>
              <td>{i + 1}</td>
              <td colSpan={3}>
                {new Date(item.time).toDateString()} -{" "}
                {formatAMPM(new Date(item.time))}
              </td>
              <td colSpan={2}>{item.user_title || ""}</td>
              <td colSpan={2}>{item.invoice_number || ""}</td>
              <td colSpan={2}>{item.counter_title || ""}</td>
              <td colSpan={2}>{i !== 0 ? format(+item.time) : ""}</td>
              <td colSpan={2}>{item.amount || ""}</td>
            </tr>
          ))}
      </tbody>
    </table>
  );
}
