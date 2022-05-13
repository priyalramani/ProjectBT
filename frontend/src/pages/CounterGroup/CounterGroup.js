import React, { useState, useEffect } from "react";
import Header from "../../components/Header";
import Sidebar from "../../components/Sidebar";

import axios from "axios";
const CounterGroup = () => {
    const [counterGroup, setCounterGroup] = useState([]);
    const [popupForm, setPopupForm] = useState(false);
    const getCounterGroup = async () => {
      const response = await axios({
        method: "get",
        url: "/counterGroup/getCounterGroup",
  
        headers: {
          "Content-Type": "application/json",
        },
      });
      if (response.data.success) setCounterGroup(response.data.result);
    };

    useEffect(() => {
      getCounterGroup();
    }, [popupForm]);
  
  
    return (
      <>
        <Sidebar />
        <Header />
        <div className="item-sales-container orders-report-container">
          <div id="heading">
            <h2>Item Categories</h2>
          </div>
          <div id="item-sales-top">
            <div id="date-input-container" style={{ overflow: "visible" }}>
              <button
                className="item-sales-search"
                onClick={() => setPopupForm(true)}
              >
                Add
              </button>
            </div>
          </div>
          <div className="table-container-user item-sales-container">
            <Table itemsDetails={counterGroup} />
          </div>
        </div>
        {popupForm ? (
          <NewUserForm
            onSave={() => setPopupForm(false)}
         
            setRoutesData={setCounterGroup}
          />
        ) : (
          ""
        )}
      </>
    );
}

export default CounterGroup
function Table({ itemsDetails }) {
    return (
      <table
        className="user-table"
        style={{ maxWidth: "100vw", height: "fit-content", overflowX: "scroll" }}
      >
        <thead>
          <tr>
            <th>S.N</th>
            <th colSpan={2}>Counter Group Title</th>
           
          </tr>
        </thead>
        <tbody>
          {itemsDetails
            ?.map((item, i) => (
              <tr key={Math.random()} style={{ height: "30px" }}>
                <td>{i + 1}</td>
                <td colSpan={2}>{item.counter_group_title}</td>
                
              </tr>
            ))}
        </tbody>
      </table>
    );
  }
  function NewUserForm({ onSave, popupInfo, setRoutesData }) {
    const [data, setdata] = useState({});
    const [errMassage, setErrorMassage] = useState("");
    const submitHandler = async (e) => {
      e.preventDefault();
      if(!data.counter_group_title){
        setErrorMassage("Please insert Group Title");
        return;
  
      }
      if (popupInfo?.type === "edit") {
        const response = await axios({
          method: "put",
          url: "/counterGroup/putCounterGroup",
          data,
          headers: {
            "Content-Type": "application/json",
          },
        });
        if (response.data.success) {
          setRoutesData((prev) =>
            prev.map((i) => (i.user_uuid === data.user_uuid ? data : i))
          );
          onSave();
        }
      } else {
        const response = await axios({
          method: "post",
          url: "/counterGroup/postCounterGroup",
          data,
          headers: {
            "Content-Type": "application/json",
          },
        });
        if (response.data.success) {
          setRoutesData((prev) => [...prev, data]);
          onSave();
        }
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
              <form className="form" onSubmit={submitHandler}>
                <div className="row">
                  <h1>Add Counter Group</h1>
                </div>
  
                <div className="formGroup">
                  <div className="row">
                    <label className="selectLabel">
                      Counter Group Title
                      <input
                        type="text"
                        name="route_title"
                        className="numberInput"
                        value={data?.counter_group_title}
                        onChange={(e) =>
                          setdata({
                            ...data,
                            counter_group_title: e.target.value,
                          })
                        }
                        maxLength={42}
                      />
                    </label>
                    
                    
                  </div>
                  
                </div>
                <i style={{ color: "red" }}>
                  {errMassage === "" ? "" : "Error: " + errMassage}
                </i>
  
                <button type="submit" className="submit">
                  Save changes
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
  