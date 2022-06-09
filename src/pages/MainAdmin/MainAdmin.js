import axios from "axios";
import React, { useEffect, useState } from "react";
import Header from "../../components/Header";
import Sidebar from "../../components/Sidebar";
import "./style.css";
import Card from "../../components/Card";
import { AiOutlineReload } from "react-icons/ai";
import VerticalTabs from "../../components/VerticalTabs";
import ItemAvilibility from "../../components/ItemAvilibility";
import { OrderDetails } from "../../components/OrderDetails";
import { ArrowDropDown, SquareFoot } from "@mui/icons-material";
const MainAdmin = () => {
  const [isItemAvilableOpen, setIsItemAvilableOpen] = useState(false);
  const [popupForm, setPopupForm] = useState(false);
  const [orders, setOrders] = useState([]);
  const [details, setDetails] = useState([]);
  const [routesData, setRoutesData] = useState([]);
  const [tripData, setTripData] = useState([]);
  const [counter, setCounter] = useState([]);
  const [btn, setBtn] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState([]);
  const [selectedRouteOrder, setSelectedRouteOrder] = useState({});
  const [selectedTrip, setSelectedTrip] = useState("");
  const [searchItems, setSearhItems] = useState("");
  const [popupOrder, setPopupOrder] = useState(null);
  const [users, setUsers] = useState([]);
  const [dropdown, setDropDown] = useState(false);
  const [selectOrder, setSelectOrder] = useState(false);
  const getUsers = async () => {
    const response = await axios({
      method: "get",
      url: "/users/GetUserList",

      headers: {
        "Content-Type": "application/json",
      },
    });
    console.log("users", response);
    if (response.data.success) setUsers(response.data.result);
  };

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
  const getDetails = async () => {
    const response = await axios({
      method: "get",
      url: "/details/GetDetails",

      headers: {
        "Content-Type": "application/json",
      },
    });
    if (response.data.success) setDetails(response.data.result);
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
    setInterval(() => {
      getRunningOrders();
      if (window.location.pathname.includes("admin")) {
        getRoutesData();
      } else if (window.location.pathname.includes("trip")) {
        getTripData();
      }
    }, 180000);
    getDetails();
    getUsers();
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
    if (window.location.pathname.includes("admin")) {
      getRoutesData();
    } else if (window.location.pathname.includes("trip")) {
      getTripData();
    }
  }, [btn, popupForm]);
  const postOrderData = async () => {
    const response = await axios({
      method: "put",
      url: "/orders/putOrders",
      data: selectedOrder.map((a) => ({
        ...a,
        trip_uuid: +selectedTrip === 0 ? "" : selectedTrip,
      })),
      headers: {
        "Content-Type": "application/json",
      },
    });
    if (response.data.success) {
      setSelectedOrder([]);
      setSelectedTrip("");
      setBtn((prev) => !prev);
    }
  };
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
          <div className="inputs">
            <div
              id="customer-dropdown-trigger"
              className={"active"}
              style={{
                position: "fixed",
                top: "70px",
                right: "10px",
                transform: dropdown ? "rotate(0deg)" : "rotate(180deg)",
                width: "30px",
                height: "30px",
                backgroundColor: "#fff",
              }}
              onClick={(e) => {
                setDropDown((prev) => !prev);
              }}
            >
              <ArrowDropDown />
            </div>
          </div>
          {dropdown && (
            <div
              id="customer-details-dropdown"
              className={"page1"}
              style={{ top: "100px", width: "100px" }}
              onMouseLeave={() => setDropDown(false)}
            >
              {window.location.pathname.includes("trip") ? (
                <button
                  className="item-sales-search"
                  onClick={() => setPopupForm(true)}
                  style={{ padding: "10px" }}
                >
                  Add
                </button>
              ) : (
                ""
              )}
              <button
                style={{ padding: "10px" }}
                className="item-sales-search"
                type="button"
                onClick={() => setSelectOrder(true)}
              >
                Select
              </button>
            </div>
          )}
          <div className="content-container" id="content-file-container">
            {window.location.pathname.includes("admin") ? (
              <>
                {routesData.length ? (
                  <>
                    {routesData.map((route) => {
                      let counterRoute = counter.find(
                        (a) => a.route_uuid === route.route_uuid
                      );

                      if (
                        orders
                          .filter(
                            (a) =>
                              a.route_uuid === "0" ||
                              a?.counter_uuid === counterRoute?.counter_uuid
                          )
                          .filter(
                            (a) =>
                              !searchItems ||
                              a.invoice_number
                                ?.toString()
                                ?.includes(searchItems.toLocaleLowerCase()) ||
                              a.counter_title
                                ?.toLocaleLowerCase()
                                ?.includes(searchItems.toLocaleLowerCase())
                          ).length
                      )
                        return (
                          <div key={Math.random()} className="sectionDiv">
                            <h1>
                              {route.route_title} ({route.orderLength}) [
                              processing: {route?.processingLength}, Checking:{" "}
                              {route.checkingLength}, Delivery:{" "}
                              {route?.deliveryLength}]
                              {selectOrder ? (
                                <input
                                  type="checkbox"
                                  style={{ marginLeft: "10px" }}
                                  onClick={() =>
                                    orders.filter(
                                      (a) =>
                                        (a.route_uuid === "0" ||
                                          a?.counter_uuid ===
                                            counterRoute?.counter_uuid) &&
                                        selectedOrder.filter(
                                          (b) => b.order_uuid === a.order_uuid
                                        ).length
                                    ).length ===
                                    orders.filter(
                                      (a) =>
                                        a.route_uuid === "0" ||
                                        a?.counter_uuid ===
                                          counterRoute?.counter_uuid
                                    ).length
                                      ? setSelectedOrder(
                                          selectedOrder.filter(
                                            (b) =>
                                              !orders.filter(
                                                (a) =>
                                                  (a.route_uuid === "0" ||
                                                    a?.counter_uuid ===
                                                      counterRoute?.counter_uuid) &&
                                                  b.order_uuid === a.order_uuid
                                              ).length
                                          )
                                        )
                                      : setSelectedOrder(
                                          selectedOrder.length
                                            ? [
                                                ...selectedOrder.filter(
                                                  (b) =>
                                                    !orders.filter(
                                                      (a) =>
                                                        (a.route_uuid === "0" ||
                                                          a?.counter_uuid ===
                                                            counterRoute?.counter_uuid) &&
                                                        b.order_uuid ===
                                                          a.order_uuid
                                                    ).length
                                                ),
                                                ...orders.filter(
                                                  (a) =>
                                                    a.route_uuid === "0" ||
                                                    a?.counter_uuid ===
                                                      counterRoute?.counter_uuid
                                                ),
                                              ]
                                            : orders.filter(
                                                (a) =>
                                                  a.route_uuid === "0" ||
                                                  a?.counter_uuid ===
                                                    counterRoute?.counter_uuid
                                              )
                                        )
                                  }
                                  defaultChecked={
                                    orders.filter(
                                      (a) =>
                                        (a.route_uuid === "0" ||
                                          a?.counter_uuid ===
                                            counterRoute?.counter_uuid) &&
                                        selectedOrder.filter(
                                          (b) => b.order_uuid === a.order_uuid
                                        ).length
                                    ).length ===
                                    orders.filter(
                                      (a) =>
                                        a.route_uuid === "0" ||
                                        a?.counter_uuid ===
                                          counterRoute?.counter_uuid
                                    ).length
                                  }
                                />
                              ) : (
                                ""
                              )}
                            </h1>
                            <div
                              className="content"
                              style={{
                                flexDirection: "row",
                                flexWrap: "wrap",
                                gap: "0",
                                marginBottom: "50px",
                              }}
                              id="seats_container"
                            >
                              {orders
                                .filter(
                                  (a) =>
                                    a?.counter_uuid ===
                                    counterRoute?.counter_uuid
                                )
                                .filter(
                                  (a) =>
                                    !searchItems ||
                                    a.invoice_number
                                      ?.toString()
                                      ?.includes(
                                        searchItems.toLocaleLowerCase()
                                      ) ||
                                    a.counter_title
                                      ?.toLocaleLowerCase()
                                      ?.includes(
                                        searchItems.toLocaleLowerCase()
                                      )
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
                                      onClick={(e) =>
                                        selectedTrip || selectOrder
                                          ? setSelectedOrder((prev) =>
                                              prev.filter(
                                                (a) =>
                                                  a.order_uuid ===
                                                  item.order_uuid
                                              ).length
                                                ? prev.filter(
                                                    (a) =>
                                                      a.order_uuid !==
                                                      item.order_uuid
                                                  )
                                                : prev.length
                                                ? [...prev, item]
                                                : [item]
                                            )
                                          : setSelectedRouteOrder(
                                              item.order_uuid
                                            )
                                      }
                                      onDoubleClick={() =>
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
                                        details={details}
                                        onDoubleClick={() =>
                                          setPopupOrder(item)
                                        }
                                        // on_order={on_order && on_order}
                                        // key={item.seat_uuid}
                                        dateTime={item?.status[0]?.time}
                                        title1={item?.invoice_number || ""}
                                        selectedOrder={
                                          selectedTrip || selectOrder
                                            ? selectedOrder.filter(
                                                (a) =>
                                                  a.order_uuid ===
                                                  item.order_uuid
                                              ).length
                                            : selectedRouteOrder ===
                                              item.order_uuid
                                        }
                                        title2={item?.counter_title || ""}
                                        status={
                                          +item.status[item.status.length - 1]
                                            ?.stage === 1
                                            ? "Processing"
                                            : +item.status[
                                                item.status.length - 1
                                              ]?.stage === 2
                                            ? "Checking"
                                            : +item.status[
                                                item.status.length - 1
                                              ]?.stage === 3
                                            ? "Delivery"
                                            : +item.status[
                                                item.status.length - 1
                                              ]?.stage === 4
                                            ? "Complete"
                                            : +item.status[
                                                item.status.length - 1
                                              ]?.stage === 5
                                            ? "Cancelled"
                                            : ""
                                        }
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
                {/* <button
                  className="item-sales-search"
                  onClick={() => setPopupForm({ type: "edit" })}
                  style={{ position: "absolute", left: "70vw", top: "60px" }}
                >
                  Assign
                </button>

                {selectedOrder.length && selectedTrip ? (
                  <button
                    className="item-sales-search"
                    onClick={() => postOrderData()}
                    style={{ position: "absolute", right: "0", top: "60px" }}
                  >
                    Done
                  </button>
                ) : (
                  ""
                )} */}
                {orders
                  .filter(
                    (a) =>
                      !searchItems ||
                      a.invoice_number
                        ?.toString()
                        ?.includes(searchItems.toLocaleLowerCase()) ||
                      a.counter_title
                        ?.toLocaleLowerCase()
                        ?.includes(searchItems.toLocaleLowerCase())
                  )
                  .filter((a) => !a?.trip_uuid).length ? (
                  <div key={Math.random()} className="sectionDiv">
                    <h2 style={{ marginTop: "50px" }}>
                      UnKnown ({orders.filter((a) => !a?.trip_uuid).length}) [
                      processing:{" "}
                      {
                        tripData.find((a) => +a.trip_uuid === 0)
                          ?.processingLength
                      }
                      , Checking:{" "}
                      {tripData.find((a) => +a.trip_uuid === 0)?.checkingLength}
                      , Delivery:{" "}
                      {tripData.find((a) => +a.trip_uuid === 0)?.deliveryLength}
                      ]
                      {selectOrder ? (
                        <input
                          type="checkbox"
                          style={{ marginLeft: "10px" }}
                          defaultChecked={
                            orders.filter(
                              (a) =>
                                !a?.trip_uuid &&
                                selectedOrder.filter(
                                  (b) => b.order_uuid === a.order_uuid
                                ).length
                            ).length ===
                            orders.filter((a) => !a?.trip_uuid).length
                          }
                          onClick={() =>
                            orders?.filter(
                              (a) =>
                                !a?.trip_uuid &&
                                selectedOrder?.filter(
                                  (b) => b.order_uuid === a.order_uuid
                                )?.length
                            ).length ===
                            orders?.filter((a) => !a?.trip_uuid)?.length
                              ? setSelectedOrder(
                                  selectedOrder.filter(
                                    (b) =>
                                      !orders.filter(
                                        (a) =>
                                          !a?.trip_uuid &&
                                          b.order_uuid === a.order_uuid
                                      ).length
                                  )
                                )
                              : setSelectedOrder(
                                  selectedOrder.length
                                    ? [
                                        ...selectedOrder.filter(
                                          (b) =>
                                            !orders.filter(
                                              (a) =>
                                                !a?.trip_uuid &&
                                                b.order_uuid === a.order_uuid
                                            ).length
                                        ),
                                        ...orders.filter((a) => !a?.trip_uuid),
                                      ]
                                    : orders?.filter((a) => !a?.trip_uuid)
                                )
                          }
                        />
                      ) : (
                        ""
                      )}
                    </h2>
                    <div
                      className="content"
                      style={{
                        flexDirection: "row",
                        flexWrap: "wrap",
                        gap: "0",
                        marginBottom: "50px",
                      }}
                      id="seats_container"
                    >
                      {orders
                        .filter((a) => !a?.trip_uuid)
                        .filter(
                          (a) =>
                            !searchItems ||
                            a.invoice_number
                              ?.toString()
                              ?.includes(searchItems.toLocaleLowerCase()) ||
                            a.counter_title
                              ?.toLocaleLowerCase()
                              ?.includes(searchItems.toLocaleLowerCase())
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
                              onClick={(e) =>
                                selectedTrip || selectOrder
                                  ? setSelectedOrder((prev) =>
                                      prev.filter(
                                        (a) => a.order_uuid === item.order_uuid
                                      ).length
                                        ? prev.filter(
                                            (a) =>
                                              a.order_uuid !== item.order_uuid
                                          )
                                        : prev.length
                                        ? [...prev, item]
                                        : [item]
                                    )
                                  : setSelectedRouteOrder(item.order_uuid)
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
                                details={details}
                                onDoubleClick={() => setPopupOrder(item)}
                                // on_order={order}
                                dateTime={item?.status[0]?.time}
                                // key={item.seat_uuid}
                                title1={item?.invoice_number || ""}
                                selectedOrder={
                                  selectedTrip || selectOrder
                                    ? selectedOrder.filter(
                                        (a) => a.order_uuid === item.order_uuid
                                      ).length
                                    : selectedRouteOrder === item.order_uuid
                                }
                                title2={item?.counter_title || ""}
                                status={
                                  +item.status[item.status.length - 1]
                                    ?.stage === 1
                                    ? "Processing"
                                    : +item.status[item.status.length - 1]
                                        ?.stage === 2
                                    ? "Checking"
                                    : +item.status[item.status.length - 1]
                                        ?.stage === 3
                                    ? "Delivery"
                                    : +item.status[item.status.length - 1]
                                        ?.stage === 4
                                    ? "Complete"
                                    : +item.status[item.status.length - 1]
                                        ?.stage === 5
                                    ? "Cancelled"
                                    : ""
                                }
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
                        orders
                          .filter((a) => a.trip_uuid === trip.trip_uuid)
                          .filter(
                            (a) =>
                              a.invoice_number
                                ?.toString()

                                ?.includes(searchItems.toLocaleLowerCase()) ||
                              a.counter_title
                                ?.toLocaleLowerCase()
                                ?.includes(searchItems.toLocaleLowerCase())
                          ).length
                      )
                        return (
                          <div key={Math.random()} className="sectionDiv">
                            <h1>
                              {trip.trip_title} (
                              {
                                orders.filter(
                                  (a) => a.trip_uuid === trip.trip_uuid
                                ).length
                              }
                              ) [ processing: {trip?.processingLength},
                              Checking: {trip?.checkingLength}, Delivery:{" "}
                              {trip?.deliveryLength}] [
                              {trip?.users?.map((a, i) =>
                                i === 0
                                  ? users?.find((b) => b.user_uuid === a)
                                      ?.user_title
                                  : ", " +
                                    users?.find((b) => b.user_uuid === a)
                                      ?.user_title
                              )}
                              ]
                              {selectOrder ? (
                                <input
                                  type="checkbox"
                                  style={{ marginLeft: "10px" }}
                                  defaultChecked={
                                    orders.filter(
                                      (a) =>
                                        a.trip_uuid === trip.trip_uuid &&
                                        selectedOrder.filter(
                                          (b) => b.order_uuid === a.order_uuid
                                        ).length
                                    ).length ===
                                    orders.filter(
                                      (a) => a.trip_uuid === trip.trip_uuid
                                    ).length
                                  }
                                  onClick={() =>
                                    orders?.filter(
                                      (a) =>
                                        a.trip_uuid === trip.trip_uuid &&
                                        selectedOrder?.filter(
                                          (b) => b.order_uuid === a.order_uuid
                                        )?.length
                                    ).length ===
                                    orders?.filter(
                                      (a) => a.trip_uuid === trip.trip_uuid
                                    )?.length
                                      ? setSelectedOrder(
                                          selectedOrder.filter(
                                            (b) =>
                                              !orders.filter(
                                                (a) =>
                                                  a.trip_uuid ===
                                                    trip.trip_uuid &&
                                                  b.order_uuid === a.order_uuid
                                              ).length
                                          )
                                        )
                                      : setSelectedOrder(
                                          selectedOrder.length
                                            ? [
                                                ...selectedOrder.filter(
                                                  (b) =>
                                                    !orders.filter(
                                                      (a) =>
                                                        a.trip_uuid ===
                                                          trip.trip_uuid &&
                                                        b.order_uuid ===
                                                          a.order_uuid
                                                    ).length
                                                ),
                                                ...orders.filter(
                                                  (a) =>
                                                    a.trip_uuid ===
                                                    trip.trip_uuid
                                                ),
                                              ]
                                            : orders?.filter(
                                                (a) =>
                                                  a.trip_uuid === trip.trip_uuid
                                              )
                                        )
                                  }
                                />
                              ) : (
                                ""
                              )}
                            </h1>
                            <div
                              className="content"
                              style={{
                                flexDirection: "row",
                                flexWrap: "wrap",
                                gap: "0",
                                marginBottom: "50px",
                              }}
                              id="seats_container"
                            >
                              {orders
                                .filter((a) => a.trip_uuid === trip.trip_uuid)
                                .filter(
                                  (a) =>
                                    !searchItems ||
                                    a.invoice_number
                                      ?.toString()
                                      ?.includes(
                                        searchItems.toLocaleLowerCase()
                                      ) ||
                                    a.counter_title
                                      ?.toLocaleLowerCase()
                                      ?.includes(
                                        searchItems.toLocaleLowerCase()
                                      )
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
                                      onClick={(e) =>
                                        selectedTrip || selectOrder
                                          ? setSelectedOrder((prev) =>
                                              prev.filter(
                                                (a) =>
                                                  a.order_uuid ===
                                                  item.order_uuid
                                              ).length
                                                ? prev.filter(
                                                    (a) =>
                                                      a.order_uuid !==
                                                      item.order_uuid
                                                  )
                                                : prev.length
                                                ? [...prev, item]
                                                : [item]
                                            )
                                          : setSelectedRouteOrder(
                                              item.order_uuid
                                            )
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
                                        details={details}
                                        onDoubleClick={() =>
                                          setPopupOrder(item)
                                        }
                                        // on_order={on_order && on_order}
                                        // key={item.seat_uuid}
                                        dateTime={item?.status[0]?.time}
                                        title1={item?.invoice_number || ""}
                                        selectedOrder={
                                          selectedTrip || selectOrder
                                            ? selectedOrder.filter(
                                                (a) =>
                                                  a.order_uuid ===
                                                  item.order_uuid
                                              ).length
                                            : selectedRouteOrder ===
                                              item.order_uuid
                                        }
                                        title2={item?.counter_title || ""}
                                        status={
                                          +item.status[item.status.length - 1]
                                            ?.stage === 1
                                            ? "Processing"
                                            : +item.status[
                                                item.status.length - 1
                                              ]?.stage === 2
                                            ? "Checking"
                                            : +item.status[
                                                item.status.length - 1
                                              ]?.stage === 3
                                            ? "Delivery"
                                            : +item.status[
                                                item.status.length - 1
                                              ]?.stage === 4
                                            ? "Complete"
                                            : +item.status[
                                                item.status.length - 1
                                              ]?.stage === 5
                                            ? "Cancelled"
                                            : ""
                                        }
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
                type="text"
                placeholder="Search..."
                value={searchItems}
                onChange={(e) => setSearhItems(e.target.value)}
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
          selectedTrip={selectedTrip}
          setSelectedTrip={setSelectedTrip}
          setRoutesData={setRoutesData}
          popupInfo={popupForm}
          orders={selectedOrder}
          trips={tripData}
        />
      ) : (
        ""
      )}
      {popupOrder ? (
        <OrderDetails
          onSave={() => {
            setPopupOrder(null);
            getRunningOrders();
          }}
          order={popupOrder}
        />
      ) : (
        ""
      )}
    </>
  );
};

export default MainAdmin;
function NewUserForm({
  onSave,
  popupInfo,
  setSelectedTrip,
  selectedTrip,
  trips,
}) {
  const [data, setdata] = useState("");
  const [errMassage, setErrorMassage] = useState("");
  useEffect(() => {
    if (popupInfo?.type === "edit") setSelectedTrip("0");
  }, []);
  const submitHandler = async (e) => {
    e.preventDefault();
    if (popupInfo?.type === "edit") {
      console.log(data);
      onSave();
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
            padding: "20p0",
            marginBottom: "50px",
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
                        value={selectedTrip}
                        onChange={(e) => setSelectedTrip(e.target.value)}
                        maxLength={42}
                        style={{ width: "200px" }}
                      >
                        <option value="0">None</option>
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
