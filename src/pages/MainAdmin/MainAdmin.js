import axios from "axios";
import React, { useEffect, useState } from "react";
import Header from "../../components/Header";
import Sidebar from "../../components/Sidebar";
import "./style.css";
import Card from "../../components/Card";
import { AiOutlineReload } from "react-icons/ai";
import VerticalTabs from "../../components/VerticalTabs";
import ItemAvilibility from "../../components/ItemAvilibility";
const MainAdmin = () => {
  const [isItemAvilableOpen, setIsItemAvilableOpen] = useState(false);
  const [popupForm, setPopupForm] = useState(false);
  const [orders, setOrders] = useState([]);
  const [routesData, setRoutesData] = useState([]);
  const [tripData, setTripData] = useState([]);
  const [counter, setCounter] = useState([]);
  const [btn, setBtn] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState([]);
  const [selectedRouteOrder, setSelectedRouteOrder] = useState({});
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
  const getTripData = async () => {
    const response = await axios({
      method: "get",
      url: "/trips/GetTripList",

      headers: {
        "Content-Type": "application/json",
      },
    });
    if (response.data.success) setTripData(response.data.result);
  };
  useEffect(() => {
    getTripData();
  }, [popupForm]);
  useEffect(() => {
    getRoutesData();
    getCounter();
    setInterval(getRunningOrders, 180000);
  }, []);
  const getRunningOrders = async () => {
    const response = await axios({
      method: "get",
      url: "/orders/GetOrderRunningList",
    });

    if (response.data.success) setOrders(response.data.result);
  };
  console.log(selectedOrder);
  useEffect(() => {
    if (
      window.location.pathname.includes("admin") ||
      window.location.pathname.includes("trip")
    ) {
      getRunningOrders();
    }
  }, [btn, popupForm]);
  return (
    <>
      <Sidebar setIsItemAvilableOpen={setIsItemAvilableOpen} />
      <div className="right-side">
        <Header />
        <AiOutlineReload
          style={{
            position: "fixed",
            fontSize: "20px",
            zIndex: "99999",
            top: "10px",
            right: "250px",
            cursor: "pointer",
          }}
          onClick={() => setBtn((prev) => !prev)}
        />
        <div style={{ display: "flex", height: "100%" }}>
          <VerticalTabs />

          <div className="content-container" id="content-file-container">
            {window.location.pathname.includes("admin") ? (
              <>
                {orders.filter(
                  (a) =>
                    counter.filter(
                      (b) =>
                        a.counter_uuid === b.counter_uuid &&
                        !routesData.filter((c) => c.route_uuid === b.route_uuid)
                          .length
                    ).length
                ).length ? (
                  <div key={Math.random()} className="sectionDiv">
                    <h1>UnKnown</h1>
                    <div
                      className="content"
                      style={{
                        flexDirection: "row",
                        flexWrap: "wrap",
                        gap: "5",
                      }}
                      id="seats_container"
                    >
                      {orders
                        .filter(
                          (a) =>
                            counter.filter(
                              (b) =>
                                a.counter_uuid === b.counter_uuid &&
                                routesData.filter(
                                  (c) => c.route_uuid !== b.route_uuid
                                ).length
                            ).length
                        )
                        .map((item) => {
                          return (
                            <div
                              className={`seatSearchTarget`}
                              key={Math.random()}
                              seat-name={item.seat_name}
                              seat-code={item.seat_uuid}
                              seat={item.seat_uuid}
                              // section={section.section_uuid}
                              // section-name={section?.section_name}
                              // outlet={outletIdState}
                              onClick={() =>
                                setSelectedRouteOrder(item.order_uuid)
                              }
                            >
                              <span
                                className="dblClickTrigger"
                                style={{ display: "none" }}
                                // onClick={() =>
                                //   menuOpenHandler(item)
                                // }
                              />
                              <Card
                                // on_order={order}
                                // key={item.seat_uuid}
                                title1={item?.invoice_number || ""}
                                selectedOrder={
                                  selectedRouteOrder === item.order_uuid
                                }
                                title2={item?.counter_title||""}
                                // color={item.color}
                                // price={item.price}
                                // visibleContext={visibleContext}
                                // setVisibleContext={setVisibleContext}
                                // isMouseInsideContext={isMouseInsideContext}
                                // seats={seatsState.filter(s => +s.seat_status === 1)}
                                rounded
                              />
                            </div>
                          );
                        })}
                    </div>
                  </div>
                ) : (
                  ""
                )}
                {routesData.length ? (
                  <>
                    {routesData.map((route) => {
                      let counterRoute = counter.find(
                        (a) => a.route_uuid === route.route_uuid
                      );
                      if (
                        counterRoute &&
                        orders.filter(
                          (a) => a.counter_uuid === counterRoute.counter_uuid
                        ).length
                      )
                        return (
                          <div key={Math.random()} className="sectionDiv">
                            <h1>{route.route_title}</h1>
                            <div
                              className="content"
                              style={{
                                flexDirection: "row",
                                flexWrap: "wrap",
                                gap: "5",
                              }}
                              id="seats_container"
                            >
                              {orders
                                .filter(
                                  (a) =>
                                    a.counter_uuid === counterRoute.counter_uuid
                                )
                                .map((item) => {
                                  return (
                                    <div
                                      className={`seatSearchTarget`}
                                      key={Math.random()}
                                      seat-name={item.seat_name}
                                      seat-code={item.seat_uuid}
                                      seat={item.seat_uuid}
                                      // section={section.section_uuid}
                                      // section-name={section?.section_name}
                                      // outlet={outletIdState}
                                      onClick={() =>
                                        setSelectedRouteOrder(item.order_uuid)
                                      }
                                    >
                                      <span
                                        className="dblClickTrigger"
                                        style={{ display: "none" }}
                                        // onClick={() =>
                                        //   menuOpenHandler(item)
                                        // }
                                      />
                                      <Card
                                        // on_order={on_order && on_order}
                                        // key={item.seat_uuid}
                                        title1={item?.invoice_number || ""}
                                        selectedOrder={
                                          selectedRouteOrder === item.order_uuid
                                        }
                                        title2={item?.counter_title||""}
                                        // color={item.color}
                                        // price={item.price}
                                        // visibleContext={visibleContext}
                                        // setVisibleContext={setVisibleContext}
                                        // isMouseInsideContext={isMouseInsideContext}
                                        // seats={seatsState.filter(s => +s.seat_status === 1)}
                                        rounded
                                      />
                                    </div>
                                  );
                                })}
                            </div>
                          </div>
                        );
                    })}
                  </>
                ) : (
                  ""
                )}
              </>
            ) : (
              <>
                <button
                  className="item-sales-search"
                  onClick={() => setPopupForm(true)}
                  style={{ position: "absolute", left: "50vw", top: "60px" }}
                >
                  Add
                </button>
                {selectedOrder.length ? (
                  <button
                    className="item-sales-search"
                    onClick={() => setPopupForm({ type: "edit" })}
                    style={{ position: "absolute", left: "70vw", top: "60px" }}
                  >
                    Assign
                  </button>
                ) : (
                  ""
                )}
                {orders.filter((a) => !a?.trip_uuid).length ? (
                  <div key={Math.random()} className="sectionDiv">
                    <h1>UnKnown</h1>
                    <div
                      className="content"
                      style={{
                        flexDirection: "row",
                        flexWrap: "wrap",
                        gap: "5",
                      }}
                      id="seats_container"
                    >
                      {orders
                        .filter((a) => !a?.trip_uuid)
                        .map((item) => {
                          return (
                            <div
                              className={`seatSearchTarget`}
                              key={Math.random()}
                              seat-name={item.seat_name}
                              seat-code={item.seat_uuid}
                              seat={item.seat_uuid}
                              // section={section.section_uuid}
                              // section-name={section?.section_name}
                              // outlet={outletIdState}
                              onClick={(e) => {
                                setSelectedOrder(
                                  selectedOrder.filter(
                                    (a) => a.order_uuid === item.order_uuid
                                  ).length
                                    ? selectedOrder.filter(
                                        (a) => a.order_uuid !== item.order_uuid
                                      )
                                    : selectedOrder.length
                                    ? [...selectedOrder, item]
                                    : [item]
                                );
                              }}
                            >
                              <span
                                className="dblClickTrigger"
                                style={{ display: "none" }}
                                // onClick={() =>
                                //   menuOpenHandler(item)
                                // }
                              />
                              <Card
                                // on_order={order}
                                // key={item.seat_uuid}
                                title1={item?.invoice_number || ""}
                                selectedOrder={
                                  selectedOrder.filter(
                                    (a) => a.order_uuid === item.order_uuid
                                  ).length
                                }
                                title2={item?.counter_title||""}
                                // color={item.color}
                                // price={item.price}
                                // visibleContext={visibleContext}
                                // setVisibleContext={setVisibleContext}
                                // isMouseInsideContext={isMouseInsideContext}
                                // seats={seatsState.filter(s => +s.seat_status === 1)}
                                rounded
                              />
                            </div>
                          );
                        })}
                    </div>
                  </div>
                ) : (
                  ""
                )}
                {tripData.length ? (
                  <>
                    {tripData.map((trip) => {
                      if (
                        orders.filter((a) => a.trip_uuid === trip.trip_uuid)
                          .length
                      )
                        return (
                          <div key={Math.random()} className="sectionDiv">
                            <h1>{trip.trip_title}</h1>
                            <div
                              className="content"
                              style={{
                                flexDirection: "row",
                                flexWrap: "wrap",
                                gap: "5",
                              }}
                              id="seats_container"
                            >
                              {orders
                                .filter((a) => a.trip_uuid === trip.trip_uuid)
                                .map((item) => {
                                  return (
                                    <div
                                      className={`seatSearchTarget`}
                                      key={Math.random()}
                                      seat-name={item.seat_name}
                                      seat-code={item.seat_uuid}
                                      seat={item.seat_uuid}
                                      // section={section.section_uuid}
                                      // section-name={section?.section_name}
                                      // outlet={outletIdState}
                                      onClick={(e) => {
                                        setSelectedOrder((prev) =>
                                          prev.filter(
                                            (a) =>
                                              a.order_uuid === item.order_uuid
                                          ).length
                                            ? prev.filter(
                                                (a) =>
                                                  a.order_uuid !==
                                                  item.order_uuid
                                              )
                                            : prev.length
                                            ? [...prev, item]
                                            : [item]
                                        );
                                      }}
                                    >
                                      <span
                                        className="dblClickTrigger"
                                        style={{ display: "none" }}
                                        // onClick={() =>
                                        //   menuOpenHandler(item)
                                        // }
                                      />
                                      <Card
                                        // on_order={on_order && on_order}
                                        // key={item.seat_uuid}
                                        title1={item?.invoice_number || ""}
                                        selectedOrder={
                                          selectedOrder.filter(
                                            (a) =>
                                              a.order_uuid === item.order_uuid
                                          ).length
                                        }
                                        title2={item?.counter_title||""}
                                        // color={item.color}
                                        // price={item.price}
                                        // visibleContext={visibleContext}
                                        // setVisibleContext={setVisibleContext}
                                        // isMouseInsideContext={isMouseInsideContext}
                                        // seats={seatsState.filter(s => +s.seat_status === 1)}
                                        rounded
                                      />
                                    </div>
                                  );
                                })}
                            </div>
                          </div>
                        );
                    })}
                  </>
                ) : (
                  ""
                )}
              </>
            )}

            <div
              className="searchBar"
              style={{
                width: "400px",
              }}
            >
              <input
                type="search"
                placeholder="Search..."
                // value={searchState}
                // onClick={() => setSearchInFocus(true)}
                // onBlur={() => setSearchInFocus(false)}
                // onChange={(e) => handleSearch(e)}
                // onKeyDown={(e) => {
                //   if (e.key === "+" || e.key === "-" || e.shiftKey || e.ctrlKey)
                //     e.preventDefault();
                //   if (e.key === "Backspace") {
                //     e.target.value = "";
                //     handleSearch(e);
                //   }
                // }}
                // autoFocus={searchInFocus}
              />
            </div>
          </div>
          {isItemAvilableOpen && (
            <ItemAvilibility
              isItemAvilableOpen={isItemAvilableOpen}
              setIsItemAvilableOpen={setIsItemAvilableOpen}
            />
          )}
        </div>
      </div>
      {popupForm ? (
        <NewUserForm
          onSave={() => {
            setPopupForm(false);
            setSelectedOrder([]);
          }}
          setRoutesData={setRoutesData}
          popupInfo={popupForm}
          orders={selectedOrder}
          trips={tripData}
        />
      ) : (
        ""
      )}
    </>
  );
};

export default MainAdmin;
function NewUserForm({ onSave, popupInfo, orders, trips }) {
  const [data, setdata] = useState(popupInfo?.type === "edit" ? "" : {});
  const [errMassage, setErrorMassage] = useState("");

  const submitHandler = async (e) => {
    e.preventDefault();
    if (popupInfo?.type === "edit") {
      console.log(data);
      const response = await axios({
        method: "put",
        url: "/orders/putOrders",
        data: orders.map((a) => ({ ...a, trip_uuid: data })),
        headers: {
          "Content-Type": "application/json",
        },
      });
      if (response.data.success) {
        onSave();
      }
    } else {
      if (!data.trip_title) {
        setErrorMassage("Please insert Trip Title");
        return;
      }

      const response = await axios({
        method: "post",
        url: "/trips/postTrip",
        data,
        headers: {
          "Content-Type": "application/json",
        },
      });
      if (response.data.success) {
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
          // style={{ flexDirection: "row", flexWrap: "wrap", gap: "5" }}
          style={{
            height: "fit-content",
            padding: "20px",
            width: "fit-content",
          }}
        >
          <div style={{ overflowY: "scroll" }}>
            <form className="form" onSubmit={submitHandler}>
              <div className="row">
                <h1>{popupInfo.type === "edit" ? "Edit" : "Add"} Trip</h1>
              </div>

              <div className="formGroup">
                <div className="row">
                  <label className="selectLabel">
                    {popupInfo.type === "edit" ? "Trip" : "Trip Title"}
                    {popupInfo.type === "edit" ? (
                      <select
                        name="route_title"
                        className="numberInput"
                        value={data}
                        onChange={(e) => setdata(e.target.value)}
                        maxLength={42}
                        style={{ width: "200px" }}
                      >
                        <option value="">None</option>
                        {trips
                          .filter((a) => a.trip_uuid && a.status)
                          .map((a) => (
                            <option value={a.trip_uuid}>{a.trip_title}</option>
                          ))}
                      </select>
                    ) : (
                      <input
                        type="text"
                        name="route_title"
                        className="numberInput"
                        value={data?.trip_title}
                        onChange={(e) =>
                          setdata({
                            ...data,
                            trip_title: e.target.value,
                          })
                        }
                        maxLength={42}
                      />
                    )}
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
