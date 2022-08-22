import React, { useState, useEffect } from "react";
import Header from "../../components/Header";
import Sidebar from "../../components/Sidebar";
import { ChevronUpIcon, ChevronDownIcon } from "@heroicons/react/solid";
import axios from "axios";
import VoucherDetails from "../../components/VoucherDetails";

const StockTransferVouchers = () => {
  const [itemsData, setItemsData] = useState([]);
  const [filterItemsData, setFilterItemsData] = useState([]);
  const [filterToWarehouse, setFilterToWarehouse] = useState();
  const [filterFromWarehouse, setFilterFromWarehouse] = useState();
  const [warehouse, setWarehouse] = useState([]);
  const [popupForm, setPopupForm] = useState(false);
  const [popupOrder, setPopupOrder] = useState(null);
  const [users, setUsers] = useState([]);
  const [completed, setCompleted] = useState(0);

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
  const GetWarehouseList = async () => {
    const response = await axios({
      method: "get",
      url: "/warehouse/GetWarehouseList",

      headers: {
        "Content-Type": "application/json",
      },
    });
    if (response.data.success) setWarehouse(response.data.result);
  };
  const getItemsData = async () => {
    const response = await axios({
      method: "get",
      url: "/vouchers/GetPendingVoucharsList/" + completed,

      headers: {
        "Content-Type": "application/json",
      },
    });
    if (response.data.success)
      setItemsData(
        response.data.result.map((b) => ({
          ...b,

          created_by_user:
            +b.created_by === 240522
              ? "Admin"
              : users.find((a) => a.created_by === b.user_uuid)?.user_title ||
                "-",
          from_warehouse_title:
            +b.from_warehouse === 0
              ? "None"
              : warehouse.find((a) => a.warehouse_uuid === b.from_warehouse)
                  ?.warehouse_title || "-",
          to_warehouse_title:
            +b.to_warehouse === 0
              ? "None"
              : warehouse.find((a) => a.warehouse_uuid === b.to_warehouse)
                  ?.warehouse_title || "-",
        }))
      );
    else setItemsData([]);
  };
  useEffect(() => {
    getItemsData();
  }, [popupForm, warehouse, users, completed]);
  useEffect(() => {
    setFilterItemsData(
      itemsData
        .filter(
          (a) =>
            !filterFromWarehouse ||
            a.from_warehouse_title
              .toLocaleLowerCase()
              .includes(filterFromWarehouse.toLocaleLowerCase())
        )
        .filter(
          (a) =>
            !filterToWarehouse ||
            a.to_warehouse_title
              .toLocaleLowerCase()
              .includes(filterToWarehouse.toLocaleLowerCase())
        )
    );
  }, [filterFromWarehouse, filterToWarehouse, itemsData]);

  useEffect(() => {
    GetWarehouseList();
    getUsers();
  }, []);
  return (
    <>
      <Sidebar />
      <Header />
      <div className="item-sales-container orders-report-container">
        <div id="heading">
          <h2>Stock Tranfer Vouchers</h2>
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
              type="text"
              onChange={(e) => setFilterFromWarehouse(e.target.value)}
              value={filterFromWarehouse}
              placeholder="Search From Warehouse..."
              className="searchInput"
            />
            <input
              type="text"
              onChange={(e) => setFilterToWarehouse(e.target.value)}
              value={filterToWarehouse}
              placeholder="Search To Warehouse..."
              className="searchInput"
            />
            <select
              type="text"
              onChange={(e) => {
                setCompleted(e.target.value);
                console.log(e.target.value);
              }}
              value={completed}
              placeholder="Search User..."
              className="searchInput"
            >
              <option value={0}>Pending</option>
              <option value={1}>Delivered</option>
            </select>

            <div>Total Vouchers: {filterItemsData.length}</div>
          </div>
        </div>
        <div className="table-container-user item-sales-container">
          <Table
            itemsDetails={filterItemsData}
            setPopupForm={setPopupForm}
            completed={completed}
            setPopupOrder={setPopupOrder}
          />
        </div>
      </div>
      {popupForm ? (
        <NewUserForm
          onSave={() => setPopupForm(false)}
          setItemsData={setItemsData}
          popupInfo={popupForm}
          users={users}
        />
      ) : (
        ""
      )}
      {popupOrder ? (
        <VoucherDetails
          onSave={() => {
            setPopupOrder(null);
            getItemsData();
          }}
          order={popupOrder}
          orderStatus="edit"
        />
      ) : (
        ""
      )}
    </>
  );
};

export default StockTransferVouchers;
function Table({ itemsDetails, setPopupForm, completed, setPopupOrder }) {
  const [items, setItems] = useState("sort_order");
  const [order, setOrder] = useState("");

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
  return (
    <table
      className="user-table"
      style={{ maxWidth: "100vw", height: "fit-content", overflowX: "scroll" }}
    >
      <thead>
        <tr>
          <th>S.N</th>

          <th colSpan={3}>
            <div className="t-head-element">
              <span>Created by</span>
              <div className="sort-buttons-container">
                <button
                  onClick={() => {
                    setItems("created_by_user");
                    setOrder("asc");
                  }}
                >
                  <ChevronUpIcon className="sort-up sort-button" />
                </button>
                <button
                  onClick={() => {
                    setItems("created_by_user");
                    setOrder("desc");
                  }}
                >
                  <ChevronDownIcon className="sort-down sort-button" />
                </button>
              </div>
            </div>
          </th>
          <th colSpan={3}>
            <div className="t-head-element">
              <span>Created At</span>
              <div className="sort-buttons-container">
                <button
                  onClick={() => {
                    setItems("created_at");
                    setOrder("asc");
                  }}
                >
                  <ChevronUpIcon className="sort-up sort-button" />
                </button>
                <button
                  onClick={() => {
                    setItems("created_at");
                    setOrder("desc");
                  }}
                >
                  <ChevronDownIcon className="sort-down sort-button" />
                </button>
              </div>
            </div>
          </th>
          <th colSpan={3}>
            <div className="t-head-element">
              <span>From Warehouse</span>
              <div className="sort-buttons-container">
                <button
                  onClick={() => {
                    setItems("from_warehouse_title");
                    setOrder("asc");
                  }}
                >
                  <ChevronUpIcon className="sort-up sort-button" />
                </button>
                <button
                  onClick={() => {
                    setItems("from_warehouse_title");
                    setOrder("desc");
                  }}
                >
                  <ChevronDownIcon className="sort-down sort-button" />
                </button>
              </div>
            </div>
          </th>
          <th colSpan={3}>
            <div className="t-head-element">
              <span>To Warehouse</span>
              <div className="sort-buttons-container">
                <button
                  onClick={() => {
                    setItems("to_warehouse_title");
                    setOrder("asc");
                  }}
                >
                  <ChevronUpIcon className="sort-up sort-button" />
                </button>
                <button
                  onClick={() => {
                    setItems("to_warehouse_title");
                    setOrder("desc");
                  }}
                >
                  <ChevronDownIcon className="sort-down sort-button" />
                </button>
              </div>
            </div>
          </th>

          {+completed ? "" : <th colSpan={2}></th>}
        </tr>
      </thead>
      <tbody className="tbody">
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
              onClick={(e) => {
                e.stopPropagation();
                if (+item.delivered) return;

                setPopupOrder(item);
              }}
            >
              <td>{i + 1}</td>

              <td colSpan={3}>{item.created_by_user}</td>
              <td colSpan={3}>
                {new Date(+item.created_at).toDateString()} -{" "}
                {formatAMPM(new Date(+item.created_at))}
              </td>
              <td colSpan={3}>{item.from_warehouse_title || ""}</td>
              <td colSpan={3}>{item.to_warehouse_title || ""}</td>

              {+completed ? (
                ""
              ) : (
                <td colSpan={2}>
                  <button
                    className="item-sales-search"
                    onClick={(e) => {
                      e.stopPropagation();

                      setPopupForm({ type: "comfirm", data: item });
                    }}
                  >
                    Confirm Delivery
                  </button>
                </td>
              )}
            </tr>
          ))}
      </tbody>
    </table>
  );
}
function NewUserForm({ onSave, popupInfo }) {
  const [data, setdata] = useState({});

  useEffect(() => {
    setdata(popupInfo.data);
  }, [popupInfo.data]);

  const submitHandler = async (e) => {
    e.preventDefault();

    const response = await axios({
      method: "put",
      url: "/vouchers/ConfirmVoucher",
      data,
      headers: {
        "Content-Type": "application/json",
      },
    });
    if (response.data.success) {
      onSave();
    }
  };

  console.log(data);
  return (
    <div className="overlay">
      <div className="modal" style={{ width: "fit-content" }}>
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
                <h1>Confirm Dilivered</h1>
              </div>

              <button type="submit" className="submit">
                Confirm
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
