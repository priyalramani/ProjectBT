import axios from "axios";
import React, { useEffect, useState } from "react";
import Header from "../../components/Header";
import Sidebar from "../../components/Sidebar";
const ItemDetails = () => {
  const [counterGroup, setCounterGroup] = useState([]);
  const [itemGroupFilter, setItemGroupFilter] = useState("");
  const [itemGroup, setItemGroup] = useState([]);
  const [searchData, setSearchData] = useState({
    startDate: "",
    endDate: "",
    company_uuid: "",
  });
  const [companies, setCompanies] = useState([]);
  const [items, setItems] = useState([]);
  const getItemGroup = async () => {
    const response = await axios({
      method: "get",
      url: "/itemGroup/GetItemGroupList",

      headers: {
        "Content-Type": "application/json",
      },
    });
    if (response.data.success) setItemGroup(response.data.result);
  };
  const getCounterGroup = async () => {
    const response = await axios({
      method: "get",
      url: "/counterGroup/GetCounterGroupList",

      headers: {
        "Content-Type": "application/json",
      },
    });
    if (response.data.success) setCounterGroup(response.data.result);
  };

  const getCompanies = async () => {
    const response = await axios({
      method: "get",
      url: "/companies/getCompanies",

      headers: {
        "Content-Type": "application/json",
      },
    });
    if (response.data.success) setCompanies(response.data.result);
  };
  const getActivityData = async () => {
    let startDate = new Date(searchData.startDate + " 00:00:00 AM");
    startDate = startDate.getTime();
    let endDate = new Date(searchData.endDate + " 00:00:00 AM");
    endDate = endDate.getTime();
    const response = await axios({
      method: "post",
      url: "/orders/getOrderItemReport",
      data: { company_uuid: searchData.company_uuid, startDate, endDate },
      headers: {
        "Content-Type": "application/json",
      },
    });
    console.log("activity", response);
    if (response.data.success) setItems(response.data.result);
  };
  useEffect(() => {
    let time = new Date();
    let curTime = "yy-mm-dd"
      .replace("mm", ("00" + (time?.getMonth() + 1).toString()).slice(-2))
      .replace("yy", ("0000" + time?.getFullYear().toString()).slice(-4))
      .replace("dd", ("00" + time?.getDate().toString()).slice(-2));
    setSearchData((prev) => ({
      ...prev,
      startDate: curTime,
      endDate: curTime,
    }));
    getCompanies();
    getCounterGroup();
    getItemGroup();
  }, []);

  return (
    <>
      <Sidebar />
      <Header />
      <div className="item-sales-container orders-report-container">
        <div id="heading">
          <h2>Item Report </h2>
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
            <div className="inputGroup">
              <label htmlFor="Warehouse">Start</label>
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
              />
            </div>
            <div className="inputGroup">
              <label htmlFor="Warehouse">End</label>
              <input
                type="date"
                onChange={(e) =>
                  setSearchData((prev) => ({
                    ...prev,
                    endDate: e.target.value,
                  }))
                }
                value={searchData.endDate}
                placeholder="Search Route Title..."
                className="searchInput"
              />
            </div>
            <div className="inputGroup">
              <label htmlFor="Warehouse">Company</label>
              <select
                
                onChange={(e) =>
                  setSearchData((prev) => ({
                    ...prev,
                    company_uuid: e.target.value,
                  }))
                }
                value={searchData.company_uuid}
              >
                <option value="">All</option>
                {companies.map((a) => (
                  <option value={a.company_uuid}>{a.company_title}</option>
                ))}
              </select>
            </div>
            <div className="inputGroup">
              <label htmlFor="Warehouse">Counter Group</label>
              <select
               
                onChange={(e) =>
                  setSearchData((prev) => ({
                    ...prev,
                    counter_group_uuid: e.target.value,
                  }))
                }
                value={searchData.counter_group_uuid}
              >
                <option value="">All</option>
                {counterGroup.filter(a=>a.counter_group_uuid).map((a) => (
                  <option value={a.counter_group_uuid}>
                    {a.counter_group_title}
                  </option>
                ))}
              </select>
            </div>
            <div className="inputGroup">
              <label htmlFor="Warehouse">Item Group</label>
              <select
                
                onChange={(e) => setItemGroupFilter((prev) => e.target.value)}
                value={itemGroupFilter}
              >
                <option value="">All</option>
                {itemGroup.filter(a=>a.item_group_uuid).map((a) => (
                  <option value={a.item_group_uuid}>
                    {a.item_group_title}
                  </option>
                ))}
              </select>
            </div>
            <button
              className="item-sales-search"
              onClick={() => getActivityData()}
            >
              Search
            </button>
          </div>
        </div>
        <div className="table-container-user item-sales-container">
          <Table itemsDetails={items.filter(a=>!itemGroupFilter||a?.item_group_uuid?.filter(b=>b===itemGroupFilter)?.length)} />
        </div>
      </div>
    </>
  );
};

export default ItemDetails;
function Table({ itemsDetails }) {
  return (
    <table
      className="user-table"
      style={{ maxWidth: "100vw", height: "fit-content", overflowX: "scroll" }}
    >
      <thead>
        <tr>
          <th>S.N</th>
          <th colSpan={3}>Item Name</th>
          <th colSpan={2}>Sales</th>
          <th colSpan={2}>Amt</th>
          <th colSpan={2}>Delivery Return</th>
          <th colSpan={2}> %</th>
          <th colSpan={2}>Amt</th>
          <th colSpan={2}>Processing Canceled</th>
          <th colSpan={2}> %</th>
          <th colSpan={2}> Amt</th>
          <th colSpan={2}>Auto Add</th>
          <th colSpan={2}> %</th>
          <th colSpan={2}> Amt</th>
        </tr>
      </thead>
      <tbody className="tbody">
        {itemsDetails
          ?.sort((a, b) => a.item_title.localeCompare(b.item_title))
          ?.map((item, i, array) => (
            <tr key={item.item_uuid} style={{ height: "30px" }}>
              <td>{i + 1}</td>
              <td colSpan={3}>{item.item_title}</td>
              <td colSpan={2}>{item.sales || ""}</td>
              <td colSpan={2}>{item.sales_amt || ""}</td>
              <td colSpan={2}>{item.deliver_return || ""}</td>
              <td colSpan={2}>{item.deliver_return_percentage || 0}</td>
              <td colSpan={2}>{item.deliver_return_amt || 0}</td>
              <td colSpan={2}>{item.processing_canceled || ""}</td>
              <td colSpan={2}>{item.processing_canceled_percentage || 0}</td>
              <td colSpan={2}>{item.processing_canceled_amt || 0}</td>
              <td colSpan={2}>{item.auto_added || ""}</td>
              <td colSpan={2}>{item.auto_added_percentage || 0}</td>
              <td colSpan={2}>{item.auto_added_amt || 0}</td>
            </tr>
          ))}
      </tbody>
    </table>
  );
}
