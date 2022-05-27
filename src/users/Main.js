import React, { useEffect, useState } from "react";
import { Route, Routes, useNavigate } from "react-router-dom";
import "./style.css";
import { Link, useLocation } from "react-router-dom";
import { deleteDB } from "idb";

const Main = () => {
  const [userRole, setUserRole] = useState([]);
  const [popupForm, setPopupForm] = useState(false);
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
    <div className="servicePage" style={{ maxHeight: "100vh" }}>
      <div className="servicesContainer">
        {userRole?.map((data, i) => (
          <Link
            key={i}
            to={pathname + rolesArray.find((a) => +a.type === +data)?.link}
            onClick={() => {
              //   props.setPath(pathname);
              //   outletDetailsDispatch({
              //     type: Actions.SHOW_SIDE_MENU,
              //     payload: false,
              //   });
            }}
          >
            <div className="service">
              <span>{rolesArray.find((a) => +a.type === +data)?.name}</span>
            </div>
          </Link>
        ))}
      </div>
      <button
        type="button"
        className="item-sales-search"
        style={{ position: "fixed", bottom: "0", left: "0" }}
        onClick={() => setPopupForm(true)}
      >
        Logout
      </button>
      {popupForm ? <Logout onSave={() => setPopupForm(false)} /> : ""}
    </div>
  );
};

export default Main;

function Logout({ onSave }) {


  const submitHandler = async (e) => {
    e.preventDefault();
    await deleteDB("BT", +localStorage.getItem("IDBVersion") || 1);
    localStorage.clear()
    window.location.assign("/login")
  };

  return (
    <div className="overlay">
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
                <h1>Are you Confirm </h1>
              </div>

              <button type="submit" className="submit">
                Logout
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
