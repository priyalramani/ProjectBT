import React, { useState } from "react";
import Context from "./context";

import { v4 as uuidv4 } from "uuid";
import axios from "axios";

const State = (props) => {
  const [calculationPopup, setcalculationPopup] = useState(null);
  const [cashRegisterPopup, setCashRegisterPopup] = useState(null);
  const [isItemAvilableOpen, setIsItemAvilableOpen] = useState(false);
  const [notification, setNotification] = useState(null);
  const [loading, setLoading] = useState(null);
  const CalculateLines = async (days, type) => {
    setLoading(true);
    const response = await axios({
      method: "put",
      url: "/counters/CalculateLines",
      data: { days, type },
      headers: {
        "Content-Type": "application/json",
      },
    });
    if (response.data.success) {
      setLoading(false);
    }
  };
  const updateServerPdf = async (data) => {
    console.log(data);
  };
  return (
    <Context.Provider
      value={{
        calculationPopup,
        setcalculationPopup,
        CalculateLines,
        loading,
        setLoading,
        notification,
        setNotification,
        updateServerPdf,
        cashRegisterPopup,
        setCashRegisterPopup,
        isItemAvilableOpen,
        setIsItemAvilableOpen
      }}

    >
      {props.children}
    </Context.Provider>
  );
};

export default State;
