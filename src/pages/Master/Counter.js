import React, { useState, useEffect } from "react";
import Header from "../../components/Header";
import Sidebar from "../../components/Sidebar";
import axios from "axios";
import {
  ChevronUpIcon,
  ChevronDownIcon,
  MenuAlt2Icon,
} from "@heroicons/react/solid";
const Counter = () => {
  const [counter, setCounter] = useState([]);
  const [filterCounter, setFilterCounter] = useState([]);
  const [filterCounterTitle, setFilterCounterTitle] = useState("");
  const [filterRoute, setFilterRoute] = useState("");
  const [popupForm, setPopupForm] = useState(false);
  const [routesData, setRoutesData] = useState([]);
  const getRoutesData = async () => {
    const response = await axios({
      method: "get",
      url: "/routes/GetRouteList",

      headers: {
        "Content-Type": "application/json",
      },
    });
    if (response.data.success) setRoutesData(response.data.result);
  };
 
  useEffect(() => {
    getRoutesData();
  }, []);
  const getCounter = async () => {
    const response = await axios({
      method: "get",
      url: "/counters/GetCounterList",

      headers: {
        "Content-Type": "application/json",
      },
    });
    if (response.data.success)
      setCounter(
        response.data.result.map((b) => ({
          ...b,
          route_title:
            routesData.find((a) => a.route_uuid === b.route_uuid)
              ?.route_title || "-",
        }))
      );
  };

  useEffect(() => {
    getCounter();
  }, [popupForm, routesData]);
  useEffect(
    () =>
      setFilterCounter(
        counter
          .filter((a) => a.counter_title)
          .filter(
            (a) =>
              !filterCounterTitle ||
              a.counter_title
                .toLocaleLowerCase()
                .includes(filterCounterTitle.toLocaleLowerCase())
          )
          .filter(
            (a) =>
              !filterRoute ||
              a.route_title
                .toLocaleLowerCase()
                .includes(filterRoute.toLocaleLowerCase())
          )
      ),
    [counter, filterCounterTitle, filterRoute]
  );
  return (
    <>
      <Sidebar />
      <Header />
      <div className="item-sales-container orders-report-container">
        <div id="heading">
          <h2>Counter </h2>
        </div>
        <div id="item-sales-top">
          <div
            id="date-input-container"
            style={{
              overflow: "visible",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              width: "100%",
            }}
          >
            <button
              className="item-sales-search"
              onClick={() => setPopupForm(true)}
            >
              Add
            </button>

            <input
              type="text"
              onChange={(e) => setFilterCounterTitle(e.target.value)}
              value={filterCounterTitle}
              placeholder="Search Counter Title..."
              className="searchInput"
            />
            <input
              type="text"
              onChange={(e) => setFilterRoute(e.target.value)}
              value={filterRoute}
              placeholder="Search Route Title..."
              className="searchInput"
            />
            <div>Total Items: {filterCounter.length}</div>
          </div>
        </div>
        <div className="table-container-user item-sales-container">
          <Table
            itemsDetails={filterCounter}
            routesData={routesData}
            setPopupForm={setPopupForm}
          />
        </div>
      </div>
      {popupForm ? (
        <NewUserForm
          onSave={() => setPopupForm(false)}
          routesData={routesData}
          setCounters={setCounter}
          popupInfo={popupForm}
        />
      ) : (
        ""
      )}
    </>
  );
};

export default Counter;
function Table({ itemsDetails, routesData, setPopupForm }) {
  const [items, setItems] = useState("sort_order");
  const [order, setOrder] = useState("");
  return (
    <table
      className="user-table"
      style={{ maxWidth: "100vw", height: "fit-content", overflowX: "scroll" }}
    >
      <thead>
        <tr>
          <th>S.N</th>
          <th colSpan={2}>
            <div className="t-head-element">
              <span>Router Title</span>
              <div className="sort-buttons-container">
                <button
                  onClick={() => {
                    setItems("route_title");
                    setOrder("asc");
                  }}
                >
                  <ChevronUpIcon className="sort-up sort-button" />
                </button>
                <button
                  onClick={() => {
                    setItems("route_title");
                    setOrder("desc");
                  }}
                >
                  <ChevronDownIcon className="sort-down sort-button" />
                </button>
              </div>
            </div>
          </th>
          <th colSpan={2}>
            <div className="t-head-element">
              <span>Counter Title</span>
              <div className="sort-buttons-container">
                <button
                  onClick={() => {
                    setItems("counter_title");
                    setOrder("asc");
                  }}
                >
                  <ChevronUpIcon className="sort-up sort-button" />
                </button>
                <button
                  onClick={() => {
                    setItems("counter_title");
                    setOrder("desc");
                  }}
                >
                  <ChevronDownIcon className="sort-down sort-button" />
                </button>
              </div>
            </div>
          </th>
          <th colSpan={2}>
            <div className="t-head-element">
              <span>Mobile</span>
              <div className="sort-buttons-container">
                <button
                  onClick={() => {
                    setItems("mobile");
                    setOrder("asc");
                  }}
                >
                  <ChevronUpIcon className="sort-up sort-button" />
                </button>
                <button
                  onClick={() => {
                    setItems("mobile");
                    setOrder("desc");
                  }}
                >
                  <ChevronDownIcon className="sort-down sort-button" />
                </button>
              </div>
            </div>
          </th>
        </tr>
      </thead>
      <tbody>
        {itemsDetails
          .sort((a, b) =>
            order === "asc"
              ? typeof a[items] === "string"
                ? a[items].localeCompare(b[items])
                : a[items] - b[items]
              : typeof a[items] === "string"
              ? b[items].localeCompare(a[items])
              : b[items] - a[items]
          )
          ?.map((item, i) => (
            <tr
              key={Math.random()}
              style={{ height: "30px" }}
              onClick={() => setPopupForm({ type: "edit", data: item })}
            >
              <td>{i + 1}</td>
              <td colSpan={2}>{item.route_title}</td>
              <td colSpan={2}>{item.counter_title}</td>
              <td colSpan={2}>{item.mobile}</td>
            </tr>
          ))}
      </tbody>
    </table>
  );
}
function NewUserForm({ onSave, popupInfo, setCounters, routesData }) {
  const [data, setdata] = useState({});
  const [errMassage, setErrorMassage] = useState("");
  useEffect(
    () => (popupInfo?.type === "edit" ? setdata(popupInfo.data) : {}),
    []
  );

  const submitHandler = async (e) => {
    e.preventDefault();
    if (!data.counter_title) {
      setErrorMassage("Please insert  Title");
      return;
    }
    if (data.mobile.length !== 10) {
      setErrorMassage("Please enter 10 Numbers in Mobile");
      return;
    }
    if (!data.route_uuid) {
      setdata({ ...data, route_uuid: "0" });
    }
    if (popupInfo?.type === "edit") {
      const response = await axios({
        method: "put",
        url: "/counters/putCounter",
        data:[data],
        headers: {
          "Content-Type": "application/json",
        },
      });
      if (response.data.success) {
        setCounters((prev) =>
          prev.map((i) => (i.counter_uuid === data.counter_uuid ? data : i))
        );
        onSave();
      }
    } else {
      const response = await axios({
        method: "post",
        url: "/counters/postCounter",
        data,
        headers: {
          "Content-Type": "application/json",
        },
      });
      if (response.data.success) {
        setCounters((prev) => [...prev, data]);
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
                <h1>{popupInfo.type === "edit" ? "Edit" : "Add"} Counter </h1>
              </div>

              <div className="form">
                <div className="row">
                  <label className="selectLabel">
                    Counter Title
                    <input
                      type="text"
                      name="route_title"
                      className="numberInput"
                      value={data?.counter_title}
                      onChange={(e) =>
                        setdata({
                          ...data,
                          counter_title: e.target.value,
                        })
                      }
                      maxLength={42}
                    />
                  </label>

                  <label className="selectLabel">
                    Sort Order
                    <input
                      type="number"
                      name="sort_order"
                      className="numberInput"
                      value={data?.sort_order}
                      onChange={(e) =>
                        setdata({
                          ...data,
                          sort_order: e.target.value,
                        })
                      }
                    />
                  </label>
                </div>
                <div className="row">
                  <label className="selectLabel" style={{ width: "50%" }}>
                    Mobile
                    <input
                      type="number"
                      name="sort_order"
                      className="numberInput"
                      value={data?.mobile}
                      onChange={(e) =>
                        setdata({
                          ...data,
                          mobile: e.target.value,
                        })
                      }
                    />
                  </label>
                  <label className="selectLabel">
                    Route
                    <select
                      name="user_type"
                      className="select"
                      value={data?.route_uuid}
                      onChange={(e) =>
                        setdata({
                          ...data,
                          route_uuid: e.target.value,
                        })
                      }
                    >
                      <option value="">None</option>
                      {routesData
                        ?.sort((a, b) => a.sort_order - b.sort_order)
                        ?.map((a) => (
                          <option value={a.route_uuid}>{a.route_title}</option>
                        ))}
                    </select>
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
