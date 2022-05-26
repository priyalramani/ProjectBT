import axios from 'axios';
import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom';

const Processing = () => {
  const [tripData,setTripData]=useState([])
  const getTripData = async () => {
    const response = await axios({
      method: "get",
      url: "/trips/GetTripList",

      headers: {
        "Content-Type": "application/json",
      },
    });
    if (response.data.success) setTripData(response.data.result);
  };
  useEffect(()=>{
    getTripData()
  },[])
  return (
    <div className="servicePage" >
            <div className="servicesContainer" style={{width:"100vw",height:"100vh",overflowY:"scroll"}}>
              {tripData?.filter(a=>a.trip_title).map((data, i) => (
                <Link
                  key={i}
                  to={"#"
                    // pathname + rolesArray.find((a) => +a.type === +data)?.link
                  }
                  onClick={() => {
                    //   props.setPath(pathname);
                    //   outletDetailsDispatch({
                    //     type: Actions.SHOW_SIDE_MENU,
                    //     payload: false,
                    //   });
                  }}
                >
                  <div className="service">
                    <span>
                      {data.trip_title}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
  )
}

export default Processing