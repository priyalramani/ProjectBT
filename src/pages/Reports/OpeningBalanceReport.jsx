import axios from "axios";
import React, { useContext, useEffect, useMemo, useState } from "react";
import Header from "../../components/Header";
import { OrderDetails } from "../../components/OrderDetails";
import Sidebar from "../../components/Sidebar";
import { useNavigate } from "react-router-dom";
import {
  getFormateDate,
  getMidnightTimestamp,
} from "../../utils/helperFunctions";
import context from "../../context/context";

const OpeningBalanceReport = () => {
  const [date, setDate] = useState();
  const [popupOrder, setPopupOrder] = useState(null);
  const [popupRecipt, setPopupRecipt] = useState(null);
  const [filterItemTitle, setFilterItemTitle] = useState("");
  const [items, setItems] = useState([]);
  const { loading, setLoading } = useContext(context);

  const navigate = useNavigate();

  const getCompleteOrders = async () => {
    if (loading) return;
    setLoading(true);

    const response = await axios({
      method: "post",
      url: "/ledger/getOpeningBalanceReport",
      data: { date },
      headers: {
        "Content-Type": "application/json",
      },
    });
    console.log("activity", response);
    if (response.data.success) {
      setItems(response.data.result);
    }
    setLoading(false);
  };

  useEffect(() => {
    let controller = new AbortController();
    let time = new Date();

    setDate(getMidnightTimestamp(time));

    return () => {
      controller.abort();
    };
  }, []);
  const filterItems = useMemo(
    () =>
      items.filter(
        (a) =>
          !filterItemTitle ||
          a.title
            ?.toLocaleLowerCase()
            ?.includes(filterItemTitle?.toLocaleLowerCase())
      ),
    [filterItemTitle, items]
  );

  return (
    <>
      <Sidebar />
      <Header />
      <div className="item-sales-container orders-report-container">
        <div id="heading">
          <h2>Opening Balance Report</h2>
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
            <label htmlFor="date">
              Select Date
              <input
                type="date"
                onChange={(e) =>
                  setDate(getMidnightTimestamp(new Date(e.target.value)))
                }
                value={getFormateDate(new Date(+date))}
                placeholder="Search Counter Title..."
                className="searchInput"
                pattern="\d{4}-\d{2}-\d{2}"
              />
            </label>
            {items.length ? (
              <label className="selectLabel">
                Ledger Title
                <input
                  type="text"
                  name="route_title"
                  className="numberInput"
                  value={filterItemTitle}
                  onChange={(e) => setFilterItemTitle(e.target.value)}
                  maxLength={42}
                />
              </label>
            ) : (
              ""
            )}
            <button className="theme-btn" onClick={() => getCompleteOrders()}>
              Search
            </button>
          </div>
        </div>
        <div className="table-container-user item-sales-container">
          <Table
            itemsDetails={filterItems}
            setPopupOrder={setPopupOrder}
            setPopupRecipt={setPopupRecipt}
            navigate={navigate}
          />
        </div>
      </div>
      {popupOrder ? (
        <OrderDetails
          onSave={() => {
            setPopupOrder(null);
            getCompleteOrders();
          }}
          order_uuid={popupOrder.order_uuid}
          orderStatus="edit"
        />
      ) : (
        ""
      )}
      {popupRecipt ? (
        <DiliveryPopup
          onSave={() => {
            setPopupRecipt(null);
            getCompleteOrders();
          }}
          order={popupRecipt}
          date={date}
          loading={loading}
          setLoading={setLoading}
          getCompleteOrders={getCompleteOrders}
        />
      ) : (
        ""
      )}
    </>
  );
};

export default OpeningBalanceReport;

function Table({ itemsDetails, setPopupRecipt }) {
  return (
    <table
      className="user-table"
      style={{ maxWidth: "100vw", height: "fit-content", overflowX: "scroll" }}
    >
      <thead>
        <tr>
          <th>S.N</th>
          <th colSpan={3}>Ledger</th>

          <th colSpan={1}>Balance</th>
        </tr>
      </thead>
      <tbody className="tbody">
        {itemsDetails
          ?.sort((a, b) => a.order_date - b.order_date)
          ?.map((item, i, array) => (
            <tr
              key={Math.random()}
              style={{ height: "30px" }}
              onClick={() => {
                setPopupRecipt(item);
              }}
            >
              <td>{i + 1}</td>
              <td colSpan={3}>{item.title || ""}</td>

              <td colSpan={1}>{item.opening_balance || "0"}</td>
            </tr>
          ))}
      </tbody>
    </table>
  );
}
function DiliveryPopup({
  onSave,

  order,

  date,
  loading,
  setLoading,
  getCompleteOrders,
}) {
  const [error, setError] = useState("");

  const [openingBalance, setOpeningBalance] = useState(0);

  useEffect(() => {
    setOpeningBalance(order?.opening_balance || 0);
  }, [order?.opening_balance]);

  const submitHandler = async () => {
    if (loading) {
      return;
    }
    setLoading(true);
    //update updateOpeningBalance
    const response = await axios({
      method: "put",
      url: "/ledger/updateOpeningBalance",
      data: {
        ...order,
        date,
        amount: openingBalance,
      },
      headers: {
        "Content-Type": "application/json",
      },
    });
    if (response.data.success) {
      getCompleteOrders();
      onSave();
    } else {
      setError(response.data.message);
    }

    setLoading(false);
  };

  return (
    <>
      <div className="overlay" style={{ zIndex: 9999999999 }}>
        <div
          className="modal"
          style={{ height: "fit-content", width: "max-content" }}
        >
          <div className="flex" style={{ justifyContent: "space-between" }}>
            <h3>Opening Balance</h3>
            <h3>{order.title}</h3>
          </div>
          <div
            className="content"
            style={{
              height: "fit-content",
              padding: "10px",
              width: "fit-content",
            }}
          >
            <div style={{ overflowY: "scroll" }}>
              <form className="form">
                <div className="formGroup">
                  <div
                    className="row"
                    style={{ flexDirection: "row", alignItems: "center" }}
                  >
                    <div style={{ width: "50px" }}>Opening Balance</div>
                    <label
                      className="selectLabel flex"
                      style={{ width: "80px" }}
                    >
                      <input
                        type="number"
                        name="route_title"
                        className="numberInput"
                        value={openingBalance}
                        style={{ width: "80px" }}
                        onChange={(e) => setOpeningBalance(e.target.value)}
                        maxLength={42}
                        onWheel={(e) => e.preventDefault()}
                      />
                      {/* {popupInfo.conversion || 0} */}
                    </label>
                  </div>
                  <i style={{ color: "red" }}>{error}</i>
                </div>

                <div
                  className="flex"
                  style={{ justifyContent: "space-between" }}
                >
                  <button
                    type="button"
                    style={{ backgroundColor: "red" }}
                    className="submit"
                    onClick={onSave}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    className="submit"
                    onClick={submitHandler}
                  >
                    Save
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
