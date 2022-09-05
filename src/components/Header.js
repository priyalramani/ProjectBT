import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import MessagePopup from "./MessagePopup";

const Header = () => {
  const Navigate = useNavigate();
  const [logoutPopup, setLogoutPopup] = useState("");
  return (
    <>
      <div className="header">
        <div className="name">
          <h2>Bharat Traders</h2>
          <h4>{localStorage.getItem("user_title")||""}</h4>
        </div>
        <div className="header_right">
          <div className="header_right_link" onClick={() => Navigate("/admin")}>
            Dashboard
          </div>
          <div
            className="header_right_link"
            onClick={() => {
              setLogoutPopup(true);
            }}
          >
            Logout
          </div>
        </div>
      </div>
      {logoutPopup ? (
        <MessagePopup
          onClose={() => {
            localStorage.clear();
            sessionStorage.clear();
            window.location.reload();
            Navigate("/login");
          }}
          onSave={() => setLogoutPopup(false)}
          message="Confirm Logout"
          button1="Logout"
          button2="Cancel"
        />
      ) : (
        ""
      )}
    </>
  );
};

export default Header;
