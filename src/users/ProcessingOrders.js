import axios from "axios";
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { ChevronUpIcon, ChevronDownIcon } from "@heroicons/react/solid";
const ProcessingOrders = () => {
  const [orders, setOrders] = useState([]);
  const params = useParams();
  const [items, setItems] = useState("sort_order");
  const [order, setOrder] = useState("");
  const getTripOrders = async () => {
    const response = await axios({
      method: "post",
      url: "/orders/GetOrderProcessingList",
      data: {
        trip_uuid: params.trip_uuid,
      },
    });

    if (response.data.success) setOrders(response.data.result);
  };
  useEffect(() => {
    getTripOrders();
  }, []);

  console.log(orders);
  return (
    <div className="item-sales-container orders-report-container" style={{width:"100%",left:"0",top:"0"}}>
      <div className="table-container-user item-sales-container" style={{width:"100%",left:"0",top:"0"}}>
        <table
          className="user-table"
          style={{
            maxWidth: "100vw",
            height: "fit-content",
            overflowX: "scroll",
          }}
        >
          <thead>
            <tr>
              <th>S.N</th>
              <th colSpan={2}>
                <div className="t-head-element">
              Counter Title
                  
                </div>
              </th>
              <th colSpan={2}>
                {" "}
                <div className="t-head-element">
                  Progress
                </div>
              </th>
            </tr>
          </thead>
          <tbody className="tbody">
            {orders
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
                <tr key={Math.random()} style={{ height: "30px" }}>
                  <td>{i + 1}</td>
                  <td colSpan={2}>{item.counter_title}</td>
                  <td colSpan={2}>0/{item?.item_details?.length||0}</td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ProcessingOrders;
