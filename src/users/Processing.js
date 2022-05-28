import axios from "axios";
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const Processing = () => {
  const [tripData, setTripData] = useState([]);
  const getTripData = async () => {
    const response = await axios({
      method: "get",
      url: "/trips/GetProcessingTripList",

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
    let data = {
      user_uuid: localStorage.getItem("user_uuid"),
      role: "Processing",
      narration:
        trip.trip_uuid ,
      timestamp: (new Date()).getTime(),
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
      <div
        className="servicesContainer"
        style={{
          width:"90%",
          height:"90vh",
          gridAutoFlow: "row",
          gridAutoRows: "20%",

          overflowY: "scroll",
        }}
      >
        {tripData.length? tripData
          ?.filter((a) => a.trip_title&&a.orderLength)
          ?.sort((a,b)=>a.created_at?a.created_at-b.created_at:-1)
          .map((data, i) => (
            <Link
              key={i}
              to={
                "#"
                // pathname + rolesArray.find((a) => +a.type === +data)?.link
              }
              onClick={() => {
                postActivity(data)
                window.location.assign("/users/processing/" + data.trip_uuid);
              }}
            >
              <div className="service">
                <span>{data.trip_title}</span>
              </div>
            </Link>
          )):<h1>No Order</h1>}
      </div>
    </div>
  );
};

export default Processing;
