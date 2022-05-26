import axios from "axios";
import React, { useEffect, useState } from "react";
import Header from "../../components/Header";
import Sidebar from "../../components/Sidebar";
import "./style.css";
import Card from "../../components/Card";
const MainAdmin = () => {
  const [orders, setOrders] = useState([]);
  const [routesData, setRoutesData] = useState([]);
  const [counter, setCounter] = useState([]);
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
  useEffect(() => {
    getRoutesData();
    getCounter();
  }, []);
  const getRunningOrders = async () => {
    const response = await axios({
      method: "get",
      url: "/orders/GetOrderRunningList",
    });

    if (response.data.success) setOrders(response.data.result);
  };

  useEffect(() => {
    if (window.location.pathname.includes("admin")) {
      getRunningOrders();
      setInterval(getRunningOrders, 180000);
    }
  }, []);
  return (
    <>
      <Sidebar />
      <div className="right-side">
        <Header />
        {orders.map(
                  (a) =>
                    counter.map(
                      (b) =>
                      console.log(a.counter_uuid === b.counter_uuid ,
                        !routesData.filter((c) => c.route_uuid === b.route_uuid)
                          .length)
                    )
                )}
        <div className="content-container" id="content-file-container">
          <>
            {routesData.length && (
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
                    <div className="content" id="seats_container">
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
                              // onClick={e => {
                              //   switch (e.detail) {
                              //     case 2:
                              //       menuOpenHandler(item);
                              //       break;
                              //     default:
                              //       seatClickHandler(e.currentTarget.querySelector('.card-focus'), item?.seat_uuid, e.detail);
                              //       return;
                              //   }
                              // }}
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
                                // title2={item.seat_name}
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
                ):""}
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
                        <div className="content" id="seats_container">
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
                                  // onClick={e => {
                                  //   switch (e.detail) {
                                  //     case 2:
                                  //       menuOpenHandler(item);
                                  //       break;
                                  //     default:
                                  //       seatClickHandler(e.currentTarget.querySelector('.card-focus'), item?.seat_uuid, e.detail);
                                  //       return;
                                  //   }
                                  // }}
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
                                    // title2={item.seat_name}
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
            )}
          </>

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
      </div>
    </>
  );
};

export default MainAdmin;
