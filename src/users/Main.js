import React, { useEffect, useState } from "react";
import { Route, Routes, useNavigate } from "react-router-dom";
import "./style.css";
import { Link, useLocation } from "react-router-dom";

const Main = () => {
  const [userRole, setUserRole] = useState([]);
  const { pathname } = useLocation();
  const Navigate = useNavigate();
  const rolesArray = [
    {
      type: 1,
      name: "Order",
      link: "/orders",
      img: "dinein.png",
    },
    {
      type: 2,
      name: "Processing",
      link: "/processing",
      img: "dinein.png",
    },
    {
      type: 3,
      name: "Checking",
      link: "/checking",
      img: "dinein.png",
    },
    {
      type: 4,
      name: "Delivery",
      link: "/delivery",
      img: "dinein.png",
    },
  ];

  useEffect(() => {
    let user_uuid = localStorage.getItem("user_uuid");

    if (!user_uuid) {
      Navigate("/login");
    }
    let user_roles = localStorage.getItem("user_role");
    console.log("user_roles", typeof user_roles);
    if (user_roles) {
      user_roles = JSON.parse(user_roles);
    }
    console.log("user_roles", user_roles);
    setUserRole(user_roles || []);
    return () => setUserRole([]);
  }, []);
  console.log(typeof userRole);
  return (
    
          <div className="servicePage">
            <div className="servicesContainer">
              {userRole?.map((data, i) => (
                <Link
                  key={i}
                  to={
                    pathname + rolesArray.find((a) => +a.type === +data)?.link
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
                      {rolesArray.find((a) => +a.type === +data)?.name}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        
 

      

  );
};

export default Main;
