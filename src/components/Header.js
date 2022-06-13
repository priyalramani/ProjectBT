import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import MessagePopup from "./MessagePopup";

const Header = () => {
  const Navigate = useNavigate();
  const [logoutPopup, setLogoutPopup] = useState("");
  return (
    <>
      <div className="header">
        <h1>Bharat Traders</h1>
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
            Navigate("/login");
          }}
          onSave={()=>setLogoutPopup(false)}
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
