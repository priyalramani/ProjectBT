import axios from "axios";
import React, { useState } from "react";

import { openDB } from "idb";

const LoginPage = ({ setUserType }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [userData, setUserData] = useState({
    login_username: "",
    login_password: "",
  });


  const loginHandler = async () => {
    try {
      setIsLoading(true);

      const response = await axios({
        method: "post",
        url: "/users/login",
        data: userData,
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.status !== 200) return setIsLoading(false);

      if (response.data.success) {
        let data = response.data.result;
        localStorage.setItem("user_uuid", data.user_uuid);
        localStorage.setItem("user_title", data.user_title);
        localStorage.setItem("user_role", JSON.stringify(data.user_role || []));
        localStorage.setItem("user_mobile", data.user_mobile);
        localStorage.setItem("warehouse", JSON.stringify(data.warehouse));
        
        sessionStorage.setItem("userType", response.data.result.user_type);
        if (+data.user_type === 0) {
          setUserType(response.data.result.user_type || false);
          window.location.assign("/admin");
          return;
        }
        const result = await axios({
          method: "get",
          url: "/users/getDetails",
          data: userData,
          headers: {
            "Content-Type": "application/json",
          },
        });
        data = result.data.result;

        const db = await openDB(
          "BT",
          +localStorage.getItem("IDBVersion") || 1,
          {
            upgrade(db) {
              for (const property in data) {
                db.createObjectStore(property, {
                  keyPath: "IDENTIFIER",
                });
              }
            },
          }
        );

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
                  : property === "warehouse"
                  ? "warehouse_uuid"
                  : ""
              ];
            console.log({ ...item, IDENTIFIER });
            await store.put({ ...item, IDENTIFIER });
          }
        }
       
       

        let time = new Date();
        localStorage.setItem("indexed_time", time.getTime());
         setTimeout(() => { 
          setUserType(response.data.result.user_type || false);
          setIsLoading(false);
          db.close();
          window.location.assign("/users");
        }, 5000);
      }
    } catch (error) {
      setIsLoading(false);
    }
  };
  return (
    <div
      id="login-container"
      onKeyDown={(e) => (e.key === "Enter" ? loginHandler() : "")}
    >
      {/* <div className="foodDoAdmin"><img src={foodDoAdmin} alt="" /></div> */}

      <div className="form">
        <h1>Sign In</h1>
        <div className="input-container">
          <label htmlFor="username" className="form-label">
            Username
          </label>
          <input
            type="username"
            className="form-input"
            name="username"
            id="username"
            value={userData.login_username}
            onChange={(e) =>
              setUserData((prev) => ({
                ...prev,
                login_username: e.target.value,
              }))
            }
            autoComplete="off"
            required
          />
        </div>

        <div className="input-container">
          <label htmlFor="password" className="form-label">
            Password
          </label>
          <input
            type="password"
            className="form-input"
            name="password"
            id="password"
            value={userData.login_password}
            onChange={(e) =>
              setUserData((prev) => ({
                ...prev,
                login_password: e.target.value,
              }))
            }
            minLength="5"
            autoComplete="off"
            required
          />
        </div>

        {!isLoading ? (
          <button className="submit-btn" onClick={loginHandler}>
            Log In
          </button>
        ) : (
          <button className="submit-btn" id="loading-screen">
            <svg viewBox="0 0 100 100">
              <path
                d="M10 50A40 40 0 0 0 90 50A40 44.8 0 0 1 10 50"
                fill="#ffffff"
                stroke="none"
              >
                <animateTransform
                  attributeName="transform"
                  type="rotate"
                  dur="1s"
                  repeatCount="indefinite"
                  keyTimes="0;1"
                  values="0 50 51;360 50 51"
                ></animateTransform>
              </path>
            </svg>
          </button>
        )}
      </div>
    </div>
  );
};

export default LoginPage;
