import axios from "axios";
import React, { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { AiOutlineArrowLeft } from "react-icons/ai";
const Processing = () => {
  const [tripData, setTripData] = useState([]);
  const Navigate = useNavigate();
  const Location = useLocation();
  const getTripData = async () => {
    const response = await axios({
      method: "get",
      url: Location.pathname.includes("checking")
        ? "/trips/GetCheckingTripList"
        : "/trips/GetProcessingTripList",

      headers: {
        "Content-Type": "application/json",
      },
    });
    if (response.data.success) setTripData(response.data.result);
  };
  useEffect(() => {
    getTripData();
  }, []);
  const postActivity = async (trip) => {
    let time = new Date();
    let data = {
      user_uuid: localStorage.getItem("user_uuid"),
      role: Location.pathname.includes("checking")?"Checking":"Processing",
      narration: +trip.trip_uuid === 0 ? "Unknown" : trip.trip_title,
      timestamp: time.getTime(),
      activity: "trip_open",
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
    <div className="servicePage">
      <nav className="user_nav" style={{ top: "0" }}>
        <div className="user_menubar">
          <AiOutlineArrowLeft onClick={() => Navigate(-1)} />
        </div>
      </nav>
      <div
        className="servicesContainer"
        style={{
          width: "100%",
          padding: "20px",
          height: "90vh",
          gridAutoFlow: "row",
          gridAutoRows: "20%",
          marginTop: "20px",
          backgroundColor: "#f2f2f2",
          overflowY: "scroll",
        }}
      >
        {tripData.length ? (
          tripData
            ?.filter((a) => a.trip_title && a.orderLength)
            ?.sort((a, b) => (a.created_at ? a.created_at - b.created_at : -1))
            .map((data, i) => (
              <Link
                key={i}
                to={
                  "#"
                  // pathname + rolesArray.find((a) => +a.type === +data)?.link
                }
                onClick={() => {
                  postActivity(data);
                  sessionStorage.setItem("trip_title", data.trip_title);
                  window.location.assign(`/users/${Location.pathname.includes("checking")?"checking":"processing"}/` + data.trip_uuid);
                }}
              >
                <div className="service">
                  <span>{data.trip_title}</span>
                </div>
              </Link>
            ))
        ) : (
          <h1>No Order</h1>
        )}
      </div>
    </div>
  );
};

export default Processing;
