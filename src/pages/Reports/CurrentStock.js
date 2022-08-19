import axios from "axios";
import React, { useState, useEffect } from "react";
import Sidebar from "../../components/Sidebar";
import Headers from "../../components/Header";
const CurrentStock = () => {
  const [itemsData, setItemsData] = useState([]);
  const [filterTitle, setFilterTitle] = useState("");
  const [itemEditPopup, setItemEditPopup] = useState("");
  const [item, setItem] = useState("");

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
              onChange={(e) => setFilterTitle(e.target.value)}
              value={filterTitle}
              placeholder="Search Item Title..."
              className="searchInput"
            />

            <div>
              Total Items:{" "}
              {
                itemsData.filter(
                  (a) =>
                    !filterTitle ||
                    a.item_title
                      .toLocaleLowerCase()
                      .includes(filterTitle.toLocaleLowerCase())
                ).length
              }
            </div>
          </div>
        </div>
        <div className="table-container-user item-sales-container">
          <Table
            itemsDetails={itemsData.filter(
              (a) =>
                !filterTitle ||
                a.item_title
                  .toLocaleLowerCase()
                  .includes(filterTitle.toLocaleLowerCase())
            )}
            setItemData={setItem}
            setItemEditPopup={setItemEditPopup}
            warehouseData={warehouseData}
          />
        </div>
      </div>
      {itemEditPopup ? (
        <QuantityChanged
          popupInfo={itemEditPopup}
          item={item}
          onSave={() => {
            setItemEditPopup("");
          }}
          update={getItemsData}
        />
      ) : (
        ""
      )}
    </>
  );
};

export default CurrentStock;

function Table({ itemsDetails, warehouseData, setItemEditPopup, setItemData }) {
  const CovertedQty = (qty, conversion) => {
    let b = Math.floor(qty / +conversion);

    let p = Math.floor(qty % +conversion);
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
            <th colSpan={2}>{a.warehouse_title}</th>
          ))}
          <th>Total</th>
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
              {warehouseData.map((a) => {
                let data = item?.stock?.find(
                  (b) => b.warehouse_uuid === a.warehouse_uuid
                );
                return (
                  <>
                    <td
                      style={{
                        textAlign: "left",
                        cursor: "pointer",
                      }}
                      onClick={(e) => {
                        e.stopPropagation();
                        setItemEditPopup({ type: "qty", ...a });
                        setItemData(item);
                      }}
                    >
                      {CovertedQty(data?.qty || 0, item.conversion)}
                    </td>
                    <td
                      style={{
                        textAlign: "right",
                        cursor: "pointer",
                      }}
                      onClick={(e) => {
                        e.stopPropagation();
                        setItemEditPopup({ type: "min_level", ...a });
                        setItemData(item);
                      }}
                    >
                      ({data?.min_level || 0})
                    </td>
                  </>
                );
              })}
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
            </tr>
          ))}
      </tbody>
    </table>
  );
}
function QuantityChanged({ onSave, popupInfo, item, update }) {
  const [data, setdata] = useState({});

  useEffect(() => {
    let warehouseData = item.stock?.find(
      (a) => a.warehouse_uuid === popupInfo.warehouse_uuid
    );

    if (warehouseData)
      setdata({
        ...warehouseData,
        b: Math.floor(+warehouseData.qty / +item.conversion),
        p: Math.floor(+warehouseData.qty % +item.conversion),
      });
    else
      setdata({
        warehouse_uuid: popupInfo.warehouse_uuid,
        b: 0,
        p: 0,
        min_level: 0,
      });
  }, [item.conversion, item.stock, popupInfo.warehouse_uuid]);
  console.log(data);
  const submitHandler = async (e) => {
    e.preventDefault();
    let qty = +(+data.b * +item.conversion) + +data.p;
    let stock = item.stock;
    stock = stock?.filter((a) => a.warehouse_uuid === popupInfo.warehouse_uuid)
      ?.length
      ? stock.map((a) =>
          a.warehouse_uuid === popupInfo.warehouse_uuid ? { ...data, qty } : a
        )
      : stock?.length
      ? +popupInfo.warehouse_uuid === 0
        ? stock || []
        : [
            ...stock,
            {
              ...data,
              qty,
            },
          ]
      : [
          {
            ...data,
            qty,
          },
        ];
    console.log(stock);
    const response = await axios({
      method: "put",
      url: "/items/putItem",
      data: [{ item_uuid: item.item_uuid, stock }],
      headers: {
        "Content-Type": "application/json",
      },
    });
    if (response.data.result[0].success) {
      onSave();
      update();
    }
  };

  return (
    <div className="overlay">
      <div
        className="modal"
        style={{ height: "fit-content", width: "max-content" }}
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
            <form className="form" onSubmit={submitHandler}>
              <div className="formGroup">
                {popupInfo.type === "qty" ? (
                  <div
                    className="row"
                    style={{ flexDirection: "row", alignItems: "flex-start" }}
                  >
                    <label
                      className="selectLabel flex"
                      style={{ width: "100px" }}
                    >
                      Box
                      <input
                        type="number"
                        name="route_title"
                        className="numberInput"
                        value={data.b}
                        style={{ width: "100px" }}
                        onChange={(e) =>
                          setdata({
                            ...data,
                            b: e.target.value,
                          })
                        }
                        maxLength={42}
                        onWheel={(e) => e.preventDefault()}
                      />
                      {popupInfo.conversion || 0}
                    </label>
                    <label
                      className="selectLabel flex"
                      style={{ width: "100px" }}
                    >
                      Pcs
                      <input
                        type="number"
                        name="route_title"
                        className="numberInput"
                        value={data.p}
                        style={{ width: "100px" }}
                        onChange={(e) =>
                          setdata({
                            ...data,
                            p: e.target.value,
                          })
                        }
                        maxLength={42}
                        onWheel={(e) => e.preventDefault()}
                        autoFocus={true}
                      />
                    </label>
                  </div>
                ) : (
                  <div
                    className="row"
                    style={{ flexDirection: "row", alignItems: "flex-start" }}
                  >
                    <label
                      className="selectLabel flex"
                      style={{ width: "100px" }}
                    >
                      Min Level
                      <input
                        type="number"
                        name="route_title"
                        className="numberInput"
                        value={data?.min_level}
                        style={{ width: "100px" }}
                        onChange={(e) =>
                          setdata({
                            ...data,
                            min_level: e.target.value,
                          })
                        }
                        maxLength={42}
                        onWheel={(e) => e.preventDefault()}
                      />
                    </label>
                  </div>
                )}
              </div>

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
