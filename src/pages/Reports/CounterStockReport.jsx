import React, { useContext, useEffect, useMemo, useState } from "react";
import Header from "../../components/Header";
import Sidebar from "../../components/Sidebar";
import Select from "react-select";
import axios from "axios";
import context from "../../context/context";
const CounterStockReport = () => {
  const [searchData, setSearchData] = useState({
    startDate: "",
    endDate: "",
    counter_uuid: "",
  });
  const [popupOrder, setPopupOrder] = useState(null);
  const [items, setItems] = useState([]);
  const [counter, setCounter] = useState([]);
  const [initial, setInitial] = useState(false);
  const { setNotification } = useContext(context);
  const getCounter = async () => {
    const response = await axios({
      method: "get",
      url: "/counters/GetCounterList",

      headers: {
        "Content-Type": "application/json",
      },
    });
    if (response.data.success) setCounter(response.data.result);
  };
  const getCounterStockReport = async () => {
    if (!searchData?.counter_uuid) {
      setNotification({
        message: "Please select a counter first",
        success: false,
      });
      setTimeout(() => {
        setNotification(null);
      }, 3000);

      return;
    }
    let startDate =  new Date(new Date(searchData.startDate).setHours(0, 0, 0, 0)).getTime();

    let endDate = new Date(new Date(searchData.endDate).setHours(0, 0, 0, 0)).getTime();

    const response = await axios({
      method: "post",
      url: "/counterStock/getCounterStocksReport",
      data: { startDate, endDate, counter_uuid: searchData.counter_uuid },
      headers: {
        "Content-Type": "application/json",
      },
    });
    console.log("activity", response);
    if (response.data.success) setItems(response.data.result);
    else setItems([]);
  };

  useEffect(() => {
    let time = new Date();
    let curTime = "yy-mm-dd"
      .replace("mm", ("00" + (time?.getMonth() + 1)?.toString()).slice(-2))
      .replace("yy", ("0000" + time?.getFullYear()?.toString()).slice(-4))
      .replace("dd", ("00" + time?.getDate()?.toString()).slice(-2));
    let sTime = "yy-mm-dd"
      .replace("mm", ("00" + time?.getMonth()?.toString()).slice(-2))
      .replace("yy", ("0000" + time?.getFullYear()?.toString()).slice(-4))
      .replace("dd", ("00" + time?.getDate()?.toString()).slice(-2));
    setSearchData((prev) => ({
      ...prev,
      startDate: sTime,
      endDate: curTime,
    }));
    getCounter();
  }, []);
  useEffect(() => {
    if (initial) getCounterStockReport();
    else setInitial(true);
  }, [popupOrder]);

  return (
    <>
      <Sidebar />
      <Header />
      <div className="item-sales-container orders-report-container">
        <div id="heading">
          <h2>Counter Order Stocks</h2>
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
            <input
              type="date"
              onChange={(e) =>
                setSearchData((prev) => ({
                  ...prev,
                  startDate: e.target.value,
                }))
              }
              value={searchData.startDate}
              placeholder="Search Counter Title..."
              className="searchInput"
              pattern="\d{4}-\d{2}-\d{2}"
            />
            <input
              type="date"
              onChange={(e) =>
                setSearchData((prev) => ({ ...prev, endDate: e.target.value }))
              }
              value={searchData.endDate}
              placeholder="Search Route Title..."
              className="searchInput"
              pattern="\d{4}-\d{2}-\d{2}"
            />
            
            <div className="inputGroup" style={{ width: "50%" }}>
              <Select
                options={[
                  ...counter.map((a) => ({
                    value: a.counter_uuid,
                    label: a.counter_title + " , " + a.route_title,
                  })),
                ]}
                onChange={(doc) =>
                  setSearchData((prev) => ({
                    ...prev,
                    counter_uuid: doc.value,
                  }))
                }
                value={
                  searchData?.counter_uuid
                    ? {
                        value: searchData?.counter_uuid,
                        label: counter?.find(
                          (j) => j.counter_uuid === searchData.counter_uuid
                        )?.counter_title,
                      }
                    : null
                }
                openMenuOnFocus={true}
                menuPosition="fixed"
                menuPlacement="auto"
                placeholder="Select counter"
              />
            </div>
            <button
              className="theme-btn"
              onClick={() => getCounterStockReport()}
            >
              Search
            </button>
          </div>
        </div>
        <div className="table-container-user item-sales-container">
          <Table
            itemsDetails={items}
            setPopupOrder={setPopupOrder}
            counter={counter}
          />
        </div>
      </div>
      {popupOrder ? (
        <ItemDetails
          onSave={() => {
            setPopupOrder(null);
            getCounterStockReport();
          }}
          data={popupOrder}
        />
      ) : (
        ""
      )}
    </>
  );
};

export default CounterStockReport;

function Table({ itemsDetails, setPopupOrder }) {
  function formatAMPM(date) {
    var hours = date.getHours();
    var minutes = date.getMinutes();
    var ampm = hours >= 12 ? "pm" : "am";
    hours = hours % 12;
    hours = hours ? hours : 12; // the hour '0' should be '12'
    minutes = minutes < 10 ? "0" + minutes : minutes;
    var strTime = hours + ":" + minutes + " " + ampm;
    return strTime;
  }
  const estimated_price=
    (items) => {
      let sum = 0;
      if (items?.length) {
        for (let item of items) {
          sum += +item?.pcs * +item?.item_price;
        }
      }
      return sum.toFixed(2);
    }
  
  return (
    <table
      className="user-table"
      style={{ maxWidth: "100vw", height: "fit-content", overflowX: "scroll" }}
    >
      <thead>
        <tr>
          <th>S.N</th>
          <th colSpan={2}>Order Date</th>

          <th colSpan={3}>Counter</th>
          <th colSpan={3}>Users</th>
          <th colSpan={3}>Est. Value</th>
        </tr>
      </thead>
      <tbody className="tbody">
        {itemsDetails
          ?.sort((a, b) => a.timestamp - b.timestamp)
          ?.map((item, i, array) => (
            <tr
              key={Math.random()}
              style={{ height: "30px" }}
              onClick={() => setPopupOrder(item)}
            >
              <td>{i + 1}</td>
              <td colSpan={2}>
                {new Date(+item.timestamp).toDateString()}
              </td>

              <td colSpan={3}>{item?.counter_title || ""}</td>
              <td colSpan={3}>{item?.user_title || ""}</td>
              <td colSpan={3}>{estimated_price(item.details) || ""}</td>
            </tr>
          ))}
      </tbody>
    </table>
  );
}

function ItemDetails({ onSave, data }) {
  const [items, setItems] = useState([]);

  const [filterItemTitle, setFilterItemTitle] = useState("");

  useEffect(() => {
    setItems(data?.details || []);
  }, [data]);

  const filterItem = useMemo(
    () =>
      items
        .filter(
          (a) =>
            !filterItemTitle ||
            a.item_title
              ?.toLocaleLowerCase()
              ?.includes(filterItemTitle?.toLocaleLowerCase())
        )

        .sort((a, b) => a?.item_title?.localeCompare(b?.item_title)),
    [items, filterItemTitle]
  );
  const estimated_price = useMemo(() => {
    let sum = 0;
    for (let item of items) {
      sum += +item?.pcs * +item?.item_price;
    }
    return sum.toFixed(2);
  }, [items]);
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
            padding: "10px",
            width: "fit-content",
          }}
        >
          <div
            className="flex"
            style={{ justifyContent: "flex-start", alignItems: "flex-start" }}
          >
            <div style={{ maxHeight: "400px", overflowY: "scroll" }}>
              <div>
                <input
                  type="text"
                  onChange={(e) => setFilterItemTitle(e.target.value)}
                  value={filterItemTitle}
                  placeholder="Search Item..."
                  className="searchInput"
                  style={{ width: "150px" }}
                />
                <table
                  className="user-table"
                  style={{
                    maxWidth: "300px",
                    height: "fit-content",
                    overflowX: "scroll",
                  }}
                >
                  <thead>
                    <tr style={{ zIndex: "999999999999" }}>
                      <th>S.N</th>
                      <th colSpan={2}> Title</th>
                      <th colSpan={2}> Quantity</th>
                    </tr>
                  </thead>
                  <tbody className="tbody">
                    {filterItem

                      ?.sort((a, b) =>
                        a.item_title?.localeCompare(b.item_title)
                      )
                      ?.map((item, i, array) => {
                        return (
                          <tr key={Math.random()} style={{ height: "30px" }}>
                            <td
                              className="flex"
                              style={{
                                justifyContent: "space-between",
                              }}
                            >
                              {i + 1}
                            </td>

                            <td colSpan={2}>{item.item_title || ""}</td>
                            <td colSpan={2}>{item.pcs || ""}</td>
                          </tr>
                        );
                      })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <div
            style={{
              width: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <button className="fieldEditButton">
              Estimated Price: {estimated_price || ""}
            </button>
            <button className="fieldEditButton" onClick={() => onSave()}>
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
