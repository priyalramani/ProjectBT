import axios from "axios";
import React, { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { IoArrowBackOutline } from "react-icons/io5";
const Processing = () => {
  const [tripData, setTripData] = useState([]);
  const Navigate = useNavigate();
  const Location = useLocation();
  const getTripData = async () => {
    const response = await axios({
      method: "get",
      url: Location.pathname.includes("checking")
        ? "/trips/GetCheckingTripList":
        Location.pathname.includes("delivery")
        ? "/trips/GetDeliveryTripList"
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
  
  return (
    <div className="servicePage">
      <nav className="user_nav nav_styling" style={{ top: "0" }}>
        <div className="user_menubar">
          <IoArrowBackOutline
            className="user_Back_icon"
            onClick={() => Navigate(-1)}
          />
        </div>

        <h1 style={{ width: "100%", textAlign: "center" }}>Trips</h1>
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
                className="linkDecoration"
                onClick={() => {
                 
                  sessionStorage.setItem("trip_title", data.trip_title);
                  window.location.assign(`/users/${
                    Location.pathname.includes("checking")?"checking"
                   :Location.pathname.includes("delivery")?"delivery"
                    :"processing"}/` + data.trip_uuid);
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
