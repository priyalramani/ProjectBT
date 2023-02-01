import React, { useState } from "react";
import Context from "./context";

import { v4 as uuidv4 } from "uuid";
import axios from "axios";

const State = (props) => {
  const [calculationPopup, setcalculationPopup] = useState(null);
  const [loading, setLoading] = useState(null);
  const CalculateLines = async (days,type) => {
    setLoading(true);
    const response = await axios({
      method: "put",
      url: "/counters/CalculateLines",
      data: { days,type },
      headers: {
        "Content-Type": "application/json",
      },
    });
    if (response.data.success) {
      setLoading(false);
    }
  };
  return (
    <Context.Provider
      value={{
        calculationPopup,
        setcalculationPopup,
        CalculateLines,
        loading,
        setLoading,
      }}
    >
      {props.children}
    </Context.Provider>
  );
};

export default State;
