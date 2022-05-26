import React from "react";
import { useNavigate } from "react-router-dom";

const Header = () => {
  const Navigate = useNavigate();
  return (
    <div className="header">
      <h1>Bharat Traders</h1>
      <div className="header_right">
        <div className="header_right_link" onClick={()=>Navigate("/admin")}>Dashboard</div>
        <div
          className="header_right_link"
          onClick={() => {
            localStorage.clear();
            Navigate("/login");
          }}
        >
          Logout
        </div>
      </div>
    </div>
  );
};

export default Header;
