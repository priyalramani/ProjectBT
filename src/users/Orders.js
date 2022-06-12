import { openDB } from "idb";
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { IoArrowBackOutline } from "react-icons/io5";
import axios from "axios";
import { Phone } from "@mui/icons-material";
const Orders = () => {
  const [counters, setCounters] = useState([]);
  const [counterFilter, setCounterFilter] = useState("");
  const [routes, setRoutes] = useState([]);
  const [phonePopup, setPhonePopup] = useState(false);
  const Navigate = useNavigate();
  const getIndexedDbData = async () => {
    const db = await openDB("BT", +localStorage.getItem("IDBVersion") || 1);
    let tx = await db
      .transaction("counter", "readwrite")
      .objectStore("counter");
    let counter = await tx.getAll();
    setCounters(counter);
    let store = await db
      .transaction("routes", "readwrite")
      .objectStore("routes");
    let route = await store.getAll();
    setRoutes(route);
  };
  useEffect(() => {
    getIndexedDbData();
    return () => setCounters([]);
  }, []);
  const postActivity = async (counter, route) => {
    let time = new Date();
    let data = {
      user_uuid: localStorage.getItem("user_uuid"),
      role: "Order",
      narration:
        counter.counter_title +
        (route.route_title ? ", " + route.route_title : ""),
      timestamp: time.getTime(),
      activity: "Counter Open",
    };
    const response = await axios({
      method: "post",
      url: "/userActivity/postUserActivity",
      data,
      headers: {
        "Content-Type": "application/json",
      },
    });
    if (response.data.success) {
      console.log(response);
    }
  };
  return (
    <>
      <div
        className="item-sales-container orders-report-container"
        style={{ overflow: "visible", left: "0" }}
      >
        <nav className="user_nav nav_styling" style={{ top: "0" }}>
          <div className="user_menubar">
            <IoArrowBackOutline
              className="user_Back_icon"
              onClick={() => Navigate(-1)}
            />
          </div>

          <h1 style={{ width: "100%", textAlign: "center" }}>Counters</h1>
        </nav>
        <div
          style={{
            position: "absolute",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            flexDirection: "column",
            width: "100vw",
            top: "10px",
          }}
        >
          <input
            type="text"
            onChange={(e) => setCounterFilter(e.target.value)}
            value={counterFilter}
            placeholder="Search Counter Title..."
            className="searchInput counterSearch"
            style={{ width: "200px" }}
          />
          {counterFilter.length >= 3 ? (
            <div
              style={{
                overflowY: "scroll",
                height: "70vh",
                marginTop: "100px",
                backgroundColor: "#fff",
              }}
            >
              <table className="table" style={{ width: "100vw" }}>
                <tbody style={{ width: "100%" }}>
                  {counters
                    ?.filter((a) => a.counter_title)
                    ?.filter(
                      (a) =>
                        !counterFilter ||
                        a.counter_title
                          .toLocaleLowerCase()
                          .includes(counterFilter.toLocaleLowerCase())
                    )
                    ?.map((item, index) => {
                      return (
                        <tr
                          key={item.counter_uuid}
                          className="counterSearch"
                          onClick={(e) => {
                            e.stopPropagation();
                            postActivity(
                              item,
                              routes.find(
                                (a) => a?.route_uuid === item?.route_uuid
                              )
                            );
                            sessionStorage.setItem(
                              "route_title",
                              routes.find(
                                (a) => a?.route_uuid === item?.route_uuid
                              )?.route_title
                            );
                            Navigate("/users/orders/" + item.counter_uuid);
                          }}
                        >
                          <td style={{ width: "50%" }}>{item.counter_title}</td>
                          <td style={{ width: "50%" }}>
                            {
                              routes.find(
                                (a) => a?.route_uuid === item?.route_uuid
                              )?.route_title
                            }
                          </td>
                          <td>
                            {item?.mobile.length ? (
                              <Phone
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (item.mobile.length === 1) {
                                    window.location.assign(
                                      "tel:" + item?.mobile[0]
                                    );
                                  } else {
                                    setPhonePopup(item.mobile);
                                  }
                                }}
                                className="user_Back_icon"
                                style={{ color: "#4ac959" }}
                              />
                            ) : (
                              ""
                            )}
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>
          ) : (
            ""
          )}
        </div>
      </div>
      {phonePopup ? (
        <PhoneList onSave={() => setPhonePopup(false)} mobile={phonePopup} />
      ) : (
        ""
      )}
    </>
  );
};

export default Orders;
const PhoneList = ({ onSave, mobile }) => {
  return (
    <div className="overlay" style={{ zIndex: 999999999 }}>
      <div
        className="modal"
        style={{
          height: "fit-content",
          width: "max-content",
          minWidth: "250px",
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
          <div style={{ overflowY: "scroll", width: "100%" }}>
            {mobile.length ? (
              <div
                className="flex"
                style={{ flexDirection: "column", width: "100%" }}
              >
                <table
                  className="user-table"
                  style={{
                    width: "100%",
                    height: "fit-content",
                  }}
                >
                  <tbody className="tbody">
                    {mobile?.map((item, i) => (
                      <tr
                        key={item?.item_uuid || Math.random()}
                        style={{
                          height: "30px",
                          width: "100%",
                        }}
                      >
                        <td
                          colSpan={3}
                          className="flex"
                          onClick={() => {
                            window.location.assign("tel:" + item);
                            onSave();
                          }}
                        >
                          <Phone />
                          {item}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div
                className="flex"
                style={{ flexDirection: "column", width: "100%" }}
              >
                <i>No Data Present</i>
              </div>
            )}
          </div>
          <button onClick={onSave} className="closeButton">
            x
          </button>
        </div>
      </div>
    </div>
  );
};
