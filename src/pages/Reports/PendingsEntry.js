import axios from "axios";
import React, { useState, useEffect } from "react";
import Header from "../../components/Header";
import { OrderDetails } from "../../components/OrderDetails";
import Sidebar from "../../components/Sidebar";
import * as XLSX from "xlsx";
import * as FileSaver from "file-saver";
const fileExtension = ".xlsx";
const fileType =
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8";

const PendingsEntry = () => {
  const [orders, setOrders] = useState([]);
  const [itemsData, setItemsData] = useState([]);
  const [warningCodes, setWarningCodes] = useState(false);
  const [popupOrder, setPopupOrder] = useState(false);

  const [counters, setCounters] = useState([]);
  const [selectedOrders, setSelectedOrders] = useState([]);

  const getOrders = async () => {
    const response = await axios({
      method: "get",
      url: "/orders/getPendingEntry",

      headers: {
        "Content-Type": "application/json",
      },
    });
    console.log("users", response);
    if (response.data.success)
      setOrders(
        response.data.result.map((a) => ({
          ...a,
          ...counters.find((b) => b.counter_uuid === a.counter_uuid),
          status: a.status,
        }))
      );
  };
  const getCounter = async () => {
    const response = await axios({
      method: "get",
      url: "/counters/GetCounterList",

      headers: {
        "Content-Type": "application/json",
      },
    });
    if (response.data.success) setCounters(response.data.result);
  };
  const getItemsData = async () => {
    const response = await axios({
      method: "get",
      url: "/items/GetItemList",

      headers: {
        "Content-Type": "application/json",
      },
    });
    if (response.data.success) setItemsData(response.data.result);
  };
  useEffect(() => {
    getItemsData();
    getCounter();
  }, []);
  useEffect(() => {
    getOrders();
  }, [counters]);
  const putOrder = async (order_uuid) => {
    const response = await axios({
      method: "put",
      url: "/orders/putCompleteOrder",
      data: { entry: 1, order_uuid },
      headers: {
        "Content-Type": "application/json",
      },
    });
    if (response.data.success) {
      return;
    }
  };
  const downloadHandler = async () => {
    let sheetData = [];
    // console.log(sheetData)
    for (let order of selectedOrders?.sort(
      (a, b) => +a.invoice_number - +b.invoice_number
    )) {
      for (let item of order.item_details.filter(
        (a) => a.status !== 3 && (a.b || a.p || a.free)
      )) {
        let date = new Date(+order.status[0]?.time);
        let itemData = itemsData.find((a) => a.item_uuid === item.item_uuid);
        sheetData.push({
          "Party Code": order.counter_code || "",
          "Invoice Number": "N" + order.invoice_number,
          "Invoice Date": "dd/mm/yy"
            .replace("mm", ("00" + (date?.getMonth() + 1).toString()).slice(-2))
            .replace("yy", ("0000" + date?.getFullYear().toString()).slice(-4))
            .replace("dd", ("00" + date?.getDate().toString()).slice(-2)),
          "Item Code": itemData.item_code || "",
          Box: item.b || 0,
          Pcs: item.p || 0,
          Free: item.free || 0,
          "Item Price":
            +(item.price || itemData?.item_price || 0) *
            +(itemData?.conversion || 1),
          "Cash Credit":
            order.modes.filter(
              (a) =>
                a.amt && a.mode_uuid !== "c67b54ba-d2b6-11ec-9d64-0242ac120002"
            ).length || order.unpaid
              ? "Credit"
              : "Cash",
          "Discount 1": item.charges_discount?.length
            ? item.charges_discount[0]?.value
            : 0,
          "Discount 2": item.charges_discount?.length
            ? item.charges_discount[1]?.value
            : 0,
          Replacement: -order.replacement || 0,
        });
      }
    }

    const ws = XLSX.utils.json_to_sheet(sheetData);
    const wb = { Sheets: { data: ws }, SheetNames: ["data"] };
    const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    const data = new Blob([excelBuffer], { type: fileType });
    FileSaver.saveAs(data, "Book" + fileExtension);
    // setSelectedOrders([]);
  };
  return (
    <>
      <Sidebar />
      <Header />
      <div className="item-sales-container orders-report-container">
        <div id="heading" className="flex">
          <h2 style={{ width: "70%" }}>Pending Entry</h2>
          <button
            type="button"
            className="submit flex"
            style={{
              margin: "0",
              padding: "1px 10px",
              fontSize: "15px",
              height: "30px",
              
            }}
            onClick={() =>
              setSelectedOrders((prev) =>
                prev.length === orders.length ? [] : orders
              )
            }
          >
            <input
              type="checkbox"
              checked={orders.length === selectedOrders.length}
              style={{marginRight:"5px"}}
            />
            Select All
          </button>
        </div>

        <div className="table-container-user item-sales-container">
          <Table
            itemsDetails={orders}
            setPopupOrder={setPopupOrder}
            putOrder={putOrder}
            selectedOrders={selectedOrders}
            setSelectedOrders={setSelectedOrders}
            getOrders={getOrders}
          />
        </div>
        {selectedOrders.length ? (
          <div className="flex" style={{ justifyContent: "start" }}>
            <button
              className="item-sales-search"
              onClick={async (e) => {
                e.stopPropagation();
                for (let order of selectedOrders)
                  await putOrder(order.order_uuid);
                setSelectedOrders([]);
                getOrders();
              }}
              style={{ margin: "20px" }}
            >
              All Done
            </button>
            <button
              className="item-sales-search"
              onClick={(e) => {
                e.stopPropagation();
                let countersCodes = selectedOrders
                  .filter((a) => !a.counter_code)
                  .filter(
                    (value, index, self) =>
                      index ===
                      self.findIndex(
                        (t) => t.counter_uuid === value.counter_uuid
                      )
                  );
                let itemCodes = [].concat
                  .apply(
                    [],
                    selectedOrders.map((a) => a.item_details)
                  )
                  .filter(
                    (value, index, self) =>
                      index ===
                      self.findIndex((t) => t.item_uuid === value.item_uuid)
                  )

                  .map((a) =>
                    itemsData.find((b) => b.item_uuid === a.item_uuid)
                  )
                  .filter((a) => !a.item_code);

                if (countersCodes.length || itemCodes.length) {
                  setWarningCodes({ countersCodes, itemCodes });
                } else downloadHandler();
              }}
              style={{ margin: "20px" }}
            >
              Excel
            </button>
          </div>
        ) : (
          ""
        )}
      </div>
      {popupOrder ? (
        <OrderDetails
          onSave={() => {
            setPopupOrder(null);
            getOrders();
          }}
          order={popupOrder}
          orderStatus="edit"
        />
      ) : (
        ""
      )}
      {warningCodes ? (
        <div className="overlay">
          <div
            className="modal"
            style={{ height: "70vh", width: "fit-content" }}
          >
            <div
              className="content"
              style={{
                height: "fit-content",
                padding: "20px",
                width: "fit-content",
              }}
            >
              <div style={{ overflowY: "scroll" }}>
                <form className="form" onSubmit={downloadHandler}>
                  <div className="row">
                    <h1> Code missing</h1>
                  </div>

                  <div className="formGroup">
                    {warningCodes.countersCodes.length ? (
                      <div
                        className="row"
                        style={{
                          flexDirection: "column",
                          alignItems: "flex-start",
                        }}
                      >
                        <h2>Counters:</h2>
                        {warningCodes.countersCodes.map((a) => (
                          <div>{a.counter_title}</div>
                        ))}
                      </div>
                    ) : (
                      ""
                    )}
                    {warningCodes.itemCodes.length ? (
                      <div
                        className="row"
                        style={{
                          flexDirection: "column",
                          alignItems: "flex-start",
                        }}
                      >
                        <h2>item:</h2>
                        {warningCodes.itemCodes.map((a) => (
                          <div>{a.item_title}</div>
                        ))}
                      </div>
                    ) : (
                      ""
                    )}
                  </div>

                  <button type="submit" className="submit">
                    Okay
                  </button>
                </form>
              </div>
              <button
                onClick={() => setWarningCodes(false)}
                className="closeButton"
              >
                x
              </button>
            </div>
          </div>
        </div>
      ) : (
        ""
      )}
    </>
  );
};

function Table({
  itemsDetails,
  setPopupOrder,
  putOrder,
  selectedOrders,
  setSelectedOrders,
  getOrders,
}) {
  return (
    <table
      className="user-table"
      style={{ maxWidth: "100vw", height: "fit-content", overflowX: "scroll" }}
    >
      <thead>
        <tr>
          <th>S.N</th>
          <th colSpan={2}>Counter</th>
          <th colSpan={2}>Invoice Number</th>
          <th colSpan={2}>Amount</th>
          <th colSpan={2}>Cash</th>
          <th colSpan={2}>Cheque</th>
          <th colSpan={2}>UPI</th>
          <th colSpan={2}>Unpaid</th>
          <th colSpan={2}>Action</th>
        </tr>
      </thead>
      <tbody className="tbody">
        {itemsDetails
          ?.sort((a, b) => +a.invoice_number - +b.invoice_number)
          ?.map((item, i, array) => (
            <tr
              key={Math.random()}
              style={{ height: "30px" }}
              onClick={(e) => {
                e.stopPropagation();
                setPopupOrder(item);
              }}
            >
              <td
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedOrders((prev) =>
                    prev.filter((a) => a.order_uuid === item.order_uuid).length
                      ? prev.filter((a) => a.order_uuid !== item.order_uuid)
                      : [...(prev || []), item]
                  );
                }}
                className="flex"
                style={{ justifyContent: "space-between" }}
              >
                <input
                  type="checkbox"
                  checked={selectedOrders.find(
                    (a) => a.order_uuid === item.order_uuid
                  )}
                  style={{transform:"scale(1.3)"}}
                />
                {i + 1}
              </td>

              <td colSpan={2}>{item.counter_title || ""}</td>
              <td colSpan={2}>{item.invoice_number || ""}</td>
              <td colSpan={2}>{item.order_grandtotal || ""}</td>
              <td colSpan={2}>
                {item.modes.find(
                  (a) => a.mode_uuid === "c67b54ba-d2b6-11ec-9d64-0242ac120002"
                )?.amt || 0}
              </td>
              <td colSpan={2}>
                {item.modes.find(
                  (a) => a.mode_uuid === "c67b5794-d2b6-11ec-9d64-0242ac120002"
                )?.amt || 0}
              </td>
              <td colSpan={2}>
                {item.modes.find(
                  (a) => a.mode_uuid === "c67b5988-d2b6-11ec-9d64-0242ac120002"
                )?.amt || 0}
              </td>
              <td colSpan={2}>{item.unpaid || 0}</td>
              <td colSpan={2}>
                <button
                  className="item-sales-search"
                  onClick={async (e) => {
                    e.stopPropagation();
                    await putOrder(item.order_uuid);
                    getOrders();
                  }}
                >
                  Done
                </button>
              </td>
            </tr>
          ))}
      </tbody>
    </table>
  );
}

export default PendingsEntry;
