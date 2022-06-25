import React, { useEffect, useState } from "react";
import { Route, Routes, useNavigate } from "react-router-dom";
import PullToRefresh from "react-simple-pull-to-refresh";
import "./style.css";
import { Link, useLocation } from "react-router-dom";
import { deleteDB, openDB } from "idb";
import { updateIndexedDb } from "../functions";
import axios from "axios";
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
    <PullToRefresh onRefresh={() => window.location.reload(true)}>
      <div className="servicePage" style={{ maxHeight: "100vh" }}>
        <div className="servicesContainer">
          {userRole?.map((data, i) => (
            <Link
              key={i}
              to={pathname + rolesArray.find((a) => +a.type === +data)?.link}
              onClick={() => {}}
              className="linkDecoration"
              style={{ textDecoration: "none", height: "fit-content" }}
            >
              <div className="service">
                <span>{rolesArray.find((a) => +a.type === +data)?.name}</span>
              </div>
            </Link>
          ))}
        </div>
        <div style={{ position: "fixed", bottom: "60px",right:"20vw",fontSize:"20px" }}>
          Version 19
        </div>
        <button
          type="button"
          className="cartBtn"
          style={{ width: "50%" }}
          onClick={() => setPopupForm(true)}
        >
          Logout
        </button>
        <button
          type="button"
          className="cartBtn"
          style={{ width: "50%", right: "0px", left: "50vw" }}
          onClick={() => setPopupForm("refresh")}
        >
          Refresh
        </button>
        {popupForm ? (
          <Logout onSave={() => setPopupForm(false)} popupForm={popupForm} />
        ) : (
          ""
        )}
      </div>
    </PullToRefresh>
  );
};

export default Main;

function Logout({ onSave, popupForm }) {
  const submitHandler = async (e) => {
    e.preventDefault();
    console.log(popupForm);
    if (popupForm === "refresh") {
      let response = await deleteDB(
        "BT",
        +localStorage.getItem("IDBVersion") || 1
      );
      console.log(response);
      const result = await axios({
        method: "get",
        url: "/users/getDetails",

        headers: {
          "Content-Type": "application/json",
        },
      });
      let data = result.data.result;
      console.log(data);
      const db = await openDB("BT", +localStorage.getItem("IDBVersion") || 1, {
        upgrade(db) {
          for (const property in data) {
            db.createObjectStore(property, {
              keyPath: "IDENTIFIER",
            });
          }
        },
      });

      let store;
      for (const property in data) {
        store = await db
          .transaction(property, "readwrite")
          .objectStore(property);
        for (let item of data[property]) {
          let IDENTIFIER =
            item[
              property === "autobill"
                ? "auto_uuid"
                : property === "companies"
                ? "company_uuid"
                : property === "counter"
                ? "counter_uuid"
                : property === "counter_groups"
                ? "counter_group_uuid"
                : property === "item_category"
                ? "category_uuid"
                : property === "items"
                ? "item_uuid"
                : property === "routes"
                ? "route_uuid"
                : property === "payment_modes"
                ? "mode_uuid"
                : ""
            ];
          console.log({ ...item, IDENTIFIER });
          await store.put({ ...item, IDENTIFIER });
        }
      }
      let time = new Date();
      localStorage.setItem("indexed_time", time.getTime());
      db.close();
      onSave();
    } else {
      await deleteDB("BT", +localStorage.getItem("IDBVersion") || 1);
      localStorage.clear();
      window.location.assign("/login");
    }
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
            <form className="form">
              <div className="row">
                <h1>Are you Confirm </h1>
              </div>

              <button type="submit" onClick={submitHandler} className="submit">
                {popupForm === "refresh" ? "Refresh" : "Logout"}
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
