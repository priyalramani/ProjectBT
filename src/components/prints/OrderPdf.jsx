import axios from "axios";
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import OrderPrint from "./OrderPrint";

const OrderPdf = () => {
  const params = useParams();
  const [counter, setCounter] = useState([]);
  const [order, setOrder] = useState(null);
  const [user, setUser] = useState({});
  const [reminderDate, setReminderDate] = useState();
  const [itemData, setItemsData] = useState([]);
  const [route, setRoute] = useState("");

  const getCounters = async (counter_uuid) => {
    const response = await axios({
      method: "post",
      url: "/counters/GetCounterList",
      data: { counters: [counter_uuid] },
      headers: {
        "Content-Type": "application/json",
      },
    });
    if (response.data.success) setCounter(response.data.result[0]);
  };
  const getRoute = async () => {
    const response = await axios({
      method: "get",
      url: "/routes/GetRouteList",
      headers: {
        "Content-Type": "application/json",
      },
    });
    if (response.data.success) setRoute(response.data.result.route_name);
  };

  const getItemsData = async (items) => {
    const response = await axios({
      method: "post",
      url: "/items/GetItemList",
      data: { items },
      headers: {
        "Content-Type": "application/json",
      },
    });
    if (response.data.success) setItemsData(response.data.result);
  };

  const getUser = async (user_uuid) => {
    const response = await axios({
      method: "get",
      url: "/users/GetUser/" + user_uuid,
      headers: {
        "Content-Type": "application/json",
      },
    });
    if (response.data.success) setUser(response.data.result);
  };

  const getItemsDataReminder = async () => {
    const response = await axios({
      method: "get",
      url: "/items/getNewItemReminder",
      headers: {
        "Content-Type": "application/json",
      },
    });
    if (response.data.success) setReminderDate(response.data.result);
  };

  useEffect(() => {
    if (!params.order_uuid) return;
    (async () => {
      const api_response = await axios.get(
        "/orders/GetOrder/" + params.order_uuid
      );
      if (!api_response.data.success)
        return console.log("Failed to fetch order");
      setOrder(api_response.data.result);
      getItemsData(
        api_response.data.result.item_details.map((a) => a.item_uuid)
      );
      getCounters(api_response.data.result?.counter_uuid);
      getUser(api_response.data.result.status[0]?.user_uuid);
      getItemsDataReminder();
      getRoute();
    })();
  }, [params.order_uuid]);

  return (
    <div id="item-container" style={{ backgroundColor: "#fff" }}>
      {order &&
        Array.from(
          Array(Math.ceil(order?.item_details?.length / 12)).keys()
        )?.map((a, i) => (
          <OrderPrint
            counter={counter}
            reminderDate={reminderDate}
            order={JSON.parse(JSON.stringify(order))}
            date={new Date(order?.status?.[0]?.time)}
            user={user?.user_title || ""}
            itemData={itemData}
            item_details={order?.item_details?.slice(a * 12, 12 * (a + 1))}
            footer={!(order?.item_details?.length > 12 * (a + 1))}
            route={route}
          />
        ))}
    </div>
  );
};

export default OrderPdf;
