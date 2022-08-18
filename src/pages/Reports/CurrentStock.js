import axios from "axios";
import React, { useState, useEffect } from "react";
import Sidebar from "../../components/Sidebar";
import Headers from "../../components/Header";
const CurrentStock = () => {
  const [itemsData, setItemsData] = useState([]);

  const [warehouseData, setWarehouseData] = useState([]);

  const getItemsData = async () => {
    const response = await axios({
      method: "get",
      url: "/items/GetItemList",

      headers: {
        "Content-Type": "application/json",
      },
    });
    console.log("users", response);
    if (response.data.success)
      setItemsData(response.data.result.filter((a) => a.item_title));
  };

  const GetWarehouseList = async () => {
    const response = await axios({
      method: "get",
      url: "/warehouse/GetWarehouseList",

      headers: {
        "Content-Type": "application/json",
      },
    });
    if (response.data.success)
      setWarehouseData(response.data.result.filter((a) => a.warehouse_title));
  };

  useEffect(() => {
    getItemsData();
    GetWarehouseList();
  }, []);

  return (
    <>
      <Sidebar />
      <Headers />
      <div className="item-sales-container orders-report-container">
        <div id="heading" className="flex">
          <h2 style={{ width: "70%" }}>Current Stock</h2>
        </div>

        <div className="table-container-user item-sales-container">
          <Table itemsDetails={itemsData} warehouseData={warehouseData} />
        </div>
      </div>
    </>
  );
};

export default CurrentStock;

function Table({ itemsDetails, warehouseData }) {
  const CovertedQty = (qty, conversion) => {
    let b = (qty / +conversion).toFixed(0);

    let p = (qty % +conversion).toFixed(0);
    return b + ":" + p;
  };
  return (
    <table
      className="user-table"
      style={{ maxWidth: "100vw", height: "fit-content", overflowX: "scroll" }}
    >
      <thead>
        <tr>
          <th>S.N</th>
          <th colSpan={2}>Item Name</th>
          {warehouseData.map((a) => (
            <th>{a.warehouse_title}</th>
          ))}
          <th>Total</th>
          <th>Unit</th>
        </tr>
      </thead>
      <tbody className="tbody">
        {itemsDetails
          ?.sort((a, b) => +a.sort_order - +b.sort_order)
          ?.map((item, i, array) => (
            <tr key={Math.random()} style={{ height: "30px" }}>
              <td className="flex" style={{ justifyContent: "space-between" }}>
                {i + 1}
              </td>

              <td colSpan={2}>{item.item_title || ""}</td>
              {warehouseData.map((a) => (
                <td>
                  {CovertedQty(
                    item?.stock?.find(
                      (b) => b.warehouse_uuid === a.warehouse_uuid
                    )?.qty || 0,
                    item.conversion
                  )}
                </td>
              ))}
              <td>
                {CovertedQty(
                  item?.stock?.length > 1
                    ? item?.stock
                        .map((a) => +a.qty || 0)
                        .reduce((a, b) => a + b)
                    : item?.stock?.length
                    ? item.stock[0]?.qty
                    : 0,
                  item.conversion
                )}
              </td>
              <td>-</td>
            </tr>
          ))}
      </tbody>
    </table>
  );
}
