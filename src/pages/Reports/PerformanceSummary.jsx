import axios from "axios";
import React, { useState } from "react";
import Header from "../../components/Header";
import Sidebar from "../../components/Sidebar";
import {
  TiArrowSortedUp,
  TiArrowSortedDown,
  TiArrowUnsorted,
} from "react-icons/ti";
import { ChevronDownIcon, ChevronUpIcon } from "@heroicons/react/solid";
const today = new Date().getTime();

const formatDate = (_date) => {
  const date = new Date(_date);
  return [
    date?.getFullYear().toString().padStart(4, "0"),
    (date?.getMonth() + 1).toString().padStart(2, "0"),
    date?.getDate().toString().padStart(2, "0"),
  ].join("-");
};

const PerformanceSummary = () => {
  const [data, setData] = useState();
  const [dateValues, setDateValues] = useState({
    from_date: today,
    to_date: today,
  });

  const search = async () => {
    let startDate = new Date(
      new Date(dateValues.from_date).setHours(0, 0, 0, 0)
    ).getTime();
    let endDate = new Date().setDate(
      new Date(dateValues.to_date).getDate() + 1
    );
    endDate = new Date(new Date(endDate).setHours(0, 0, 0, 0)).getTime();

    const query = `?from_date=${startDate}&to_date=${endDate}`;
    const response = await axios("users/performance-summary" + query);
    if (response.status === 200) {
      setData(response.data.result);
    }
  };

  return (
    <>
      <Sidebar />
      <Header />
      <div className="item-sales-container orders-report-container">
        <div id="heading">
          <h2>Performance Summary</h2>
        </div>
        <div id="item-sales-top">
          <div
            id="date-input-container"
            style={{
              overflow: "visible",
              display: "flex",
              alignItems: "center",
              justifyContent: "flex-start",
              width: "100%",
              gap: "20px",
            }}
          >
            <input
              type="date"
              onChange={(e) =>
                setDateValues((prev) => ({
                  ...prev,
                  from_date: e.target.valueAsNumber,
                }))
              }
              max={formatDate(today)}
              value={formatDate(dateValues.from_date)}
              className="searchInput"
              style={{ width: "250px" }}
            />
            <input
              type="date"
              onChange={(e) =>
                setDateValues((prev) => ({
                  ...prev,
                  to_date: e.target.valueAsNumber,
                }))
              }
              max={formatDate(today)}
              value={formatDate(dateValues.to_date)}
              className="searchInput"
              style={{ width: "250px" }}
            />
            <button
              style={{ width: "100px", justifyContent: "center" }}
              className="theme-btn"
              onClick={search}
            >
              Search
            </button>
          </div>
        </div>
        <div className="table-container-user item-sales-container">
          <Table data={data} />
        </div>
      </div>
    </>
  );
};

function Table({ data = [] }) {
  const columns = ["Placed", "Processed", "Checked", "Delivered", "Completed"];
  const [sortingState, setSortingState] = useState({});
  const [items, setItems] = useState("sort_order");
  const [order, setOrder] = useState(null);
  // const sortData = keys => {
  // 	const sortTarget = sortingState?.sort_target?.toLowerCase()
  // 	const sortMethod = sortingState[sortingState?.sort_target]
  // 	const sortedData = keys?.sort(
  // 		(a, b) =>
  // 			(sortTarget === "user"
  // 				? data[a]?.user_title?.localeCompare(data[b]?.user_title)
  // 				: (data[a]?.[sortTarget]?.amount || 0) - (data[b]?.[sortTarget]?.amount || 0)) * sortMethod
  // 	)
  // 	return sortedData
  // }

  function formatIndianCurrency(number) {
    const indianNumberFormat = new Intl.NumberFormat("en-IN");
    return indianNumberFormat.format(number);
  }

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
              <span>Users</span>
              <div className="sort-buttons-container">
                {/* <button
                  onClick={() => {
                    setItems("item_title");
                    setOrder("asc");
                  }}
                >
                  <ChevronUpIcon className="sort-up sort-button" />
                </button>
                <button
                  onClick={() => {
                    setItems("item_title");
                    setOrder("desc");
                  }}
                >
                  <ChevronDownIcon className="sort-down sort-button" />
                </button> */}
              </div>
            </div>
          </th>

          {columns.map((a) => (
            <th colSpan={2}>
              <div className="t-head-element">
                <span>{a}</span>
                {/* <div className="sort-buttons-container">
                  <button
                    onClick={() => {
                      setItems(a);
                      setOrder("asc");
                    }}
                  >
                    <ChevronUpIcon className="sort-up sort-button" />
                  </button>
                  <button
                    onClick={() => {
                      setItems(a);
                      setOrder("desc");
                    }}
                  >
                    <ChevronDownIcon className="sort-down sort-button" />
                  </button>
                </div> */}
              </div>
            </th>
          ))}
        </tr>
      </thead>
      <tbody className="tbody">
        {data
          .sort((a, b) =>
            order == null
              ? 0
              : items?.warehouse_uuid
              ? order === "asc"
                ? (a?.stock?.find(
                    (c) => items.warehouse_uuid === c.warehouse_uuid
                  )?.qty || 0) -
                  (b?.stock?.find(
                    (c) => items.warehouse_uuid === c.warehouse_uuid
                  )?.qty || 0)
                : (b?.stock?.find(
                    (c) => items.warehouse_uuid === c.warehouse_uuid
                  )?.qty || 0) -
                  (a?.stock?.find(
                    (c) => items.warehouse_uuid === c.warehouse_uuid
                  )?.qty || 0)
              : order === "asc"
              ? typeof a[items] === "string"
                ? a[items].localeCompare(b[items])
                : a[items] - b[items]
              : typeof a[items] === "string"
              ? b[items].localeCompare(a[items])
              : b[items] - a[items]
          )
          ?.map((item, i, array) => (
            <tr key={Math.random()} style={{ height: "30px" }}>
              <td className="flex" style={{ justifyContent: "space-between" }}>
                {i + 1}
              </td>

              <td colSpan={2}>{item.user_title || ""}</td>
              {columns.map((a) => {
                let value = item[a.toLowerCase()];
                return (
                  <>
                    <td
                      style={{
                        textAlign: "left",
                        cursor: "pointer",
                      }}
                    >
                      ₹{value?.amount || 0}
                    </td>
                    <td
                      style={{
                        textAlign: "right",
                        cursor: "pointer",
                      }}
                    >
                      {value?.count || 0}
                    </td>
                  </>
                );
              })}
            </tr>
          ))}
        
          <tr style={{fontWeight:"bolder"}}>
            <td colSpan={3} style={{ textAlign: "center" }}>
              Total
              {/* <ChevronDownIcon className="sort-down sort-button" /> */}
            </td>
            {columns?.map((a) => {
              let totalAmount = 0;
              let totalQty = 0;
              data.forEach((item) => {
                totalAmount += item[a.toLowerCase()]?.amount || 0;
                totalQty += item[a.toLowerCase()]?.count || 0;
              });
              return (
                <>
                  <td style={{ textAlign: "left" }}>₹{totalAmount}</td>
                  <td style={{ textAlign: "right" }}>{totalQty}</td>
                </>
              );
            })}
          </tr>
       
      </tbody>
    </table>
  );
}

export default PerformanceSummary;
