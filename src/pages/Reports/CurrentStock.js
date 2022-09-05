import axios from "axios";
import React, { useState, useEffect, useMemo } from "react";
import Sidebar from "../../components/Sidebar";
import Headers from "../../components/Header";
import * as XLSX from "xlsx";
import * as FileSaver from "file-saver";
import Select from "react-select";
const CurrentStock = () => {
  const [itemsData, setItemsData] = useState([]);
  const [filterTitle, setFilterTitle] = useState("");
  const [filteritem, setFilterItems] = useState([]);
  const [itemEditPopup, setItemEditPopup] = useState("");
  const [item, setItem] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [filterCompany, setFilterCompany] = useState("");
  const [itemCategories, setItemCategories] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [warehouseData, setWarehouseData] = useState([]);
  const fileExtension = ".xlsx";
  const fileType =
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8";
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
  const getItemCategories = async () => {
    const response = await axios({
      method: "get",
      url: "/itemCategories/GetItemCategoryList",

      headers: {
        "Content-Type": "application/json",
      },
    });
    if (response.data.success) setItemCategories(response.data.result);
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
  useEffect(() => {
    getCompanies();
    getItemCategories();
  }, []);
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
  let sheetData = useMemo(() => {
    let data = [];
    for (let item of filteritem?.sort(
      (a, b) => +a.sort_order - +b.sort_order
    )) {
      let obj = { "Item Name": item.item_title };
      for (let a of warehouseData) {
        obj = {
          ...obj,
          [a.warehouse_title || ""]:
            CovertedQty(data?.qty || 0, item.conversion) +
            `(${data?.min_level || 0})`,
        };
      }
      data.push(obj);
    }
    return data;
  }, [filteritem, warehouseData]);
  console.log(sheetData);
  const downloadHandler = async () => {
    const ws = XLSX.utils.json_to_sheet(sheetData);
    const wb = { Sheets: { data: ws }, SheetNames: ["data"] };
    const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    const data = new Blob([excelBuffer], { type: fileType });
    FileSaver.saveAs(data, "Stocks" + fileExtension);
  };
  useEffect(
    () =>
      setFilterItems(
        itemsData
          .filter((a) => a.item_title)
          .filter(
            (a) =>
              !filterTitle ||
              a.item_title
                .toLocaleLowerCase()
                .includes(filterTitle.toLocaleLowerCase())
          )
          .filter((a) => !filterCompany || a.company_uuid === filterCompany)
          .filter((a) => !filterCategory || a.category_uuid === filterCategory)||[]
          
      ),
    [itemsData, filterTitle, filterCategory, filterCompany]
  );
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
            <div className="inputGroup">
              <label htmlFor="Warehouse">Item</label>
              <div className="inputGroup" style={{ width: "200px" }}>
            <input
              type="text"
              onChange={(e) => setFilterTitle(e.target.value)}
              value={filterTitle}
              placeholder="Search Item Title..."
              className="searchInput"
            />
                
              </div>
            </div>
            <div className="inputGroup">
              <label htmlFor="Warehouse">Companies</label>
              <div className="inputGroup" style={{ width: "200px" }}>
                <Select
                  options={[
                    { value: "", label: "All" },
                    ...companies.map((a) => ({
                      value: a.company_uuid,
                      label: a.company_title,
                    })),
                  ]}
                  onChange={(doc) => setFilterCompany(doc.value)}
                  value={
                    filterCompany
                      ? {
                          value: filterCompany,
                          label: companies?.find(
                            (j) => j.company_uuid === filterCompany
                          )?.company_title,
                        }
                      : { value: "", label: "All" }
                  }
                  // autoFocus={!order?.from_warehouse}
                  openMenuOnFocus={true}
                  menuPosition="fixed"
                  menuPlacement="auto"
                  placeholder="Select"
                />
              </div>
            </div>
            <div className="inputGroup">
              <label htmlFor="Warehouse">Categories</label>
              <div className="inputGroup" style={{ width: "200px" }}>
                <Select
                  options={[
                    { value: "", label: "All" },
                    ...itemCategories.map((a) => ({
                      value: a.category_uuid,
                      label: a.category_title,
                    })),
                  ]}
                  onChange={(doc) => setFilterCategory(doc.value)}
                  value={
                    filterCategory
                      ? {
                          value: filterCategory,
                          label: itemCategories?.find(
                            (j) => j.category_uuid === filterCategory
                          )?.category_title,
                        }
                      : { value: "", label: "All" }
                  }
                  // autoFocus={!order?.from_warehouse}
                  openMenuOnFocus={true}
                  menuPosition="fixed"
                  menuPlacement="auto"
                  placeholder="Select"
                />
              </div>
            </div>
            <div>Total Items: {filteritem.length}</div>
            <button className="item-sales-search" onClick={downloadHandler}>
              Excel
            </button>
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

const CovertedQty = (qty, conversion) => {
  let b = qty / +conversion;

  b = Math.sign(b) * Math.floor(Math.sign(b) * b);

  let p = Math.floor(qty % +conversion);

  return b + ":" + p;
};
function Table({ itemsDetails, warehouseData, setItemEditPopup, setItemData }) {
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
  const [warning, setWarning] = useState();
  useEffect(() => {
    if (!item.status) setWarning(true);
  }, [item.status]);
  useEffect(() => {
    let warehouseData = item.stock?.find(
      (a) => a.warehouse_uuid === popupInfo.warehouse_uuid
    );

    if (warehouseData) {
      let b = Math.floor(+warehouseData.qty / +item.conversion);
      b = Math.sign(b) * Math.floor(Math.sign(b) * b);

      setdata({
        ...warehouseData,
        b,
        p: Math.floor(+warehouseData.qty % +item.conversion),
      });
    } else
      setdata({
        warehouse_uuid: popupInfo.warehouse_uuid,
        b: 0,
        p: 0,
        min_level: 0,
      });
  }, [item.conversion, item.stock, popupInfo.warehouse_uuid]);

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
          {warning ? (
            <div style={{ overflowY: "scroll" }}>
              <form className="form" onSubmit={() => setWarning(false)}>
                <div className="formGroup">
                  <h2>Item Status is Off</h2>
                </div>

                <button type="submit" className="submit">
                  Okay
                </button>
              </form>
            </div>
          ) : (
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
          )}
          <button onClick={onSave} className="closeButton">
            x
          </button>
        </div>
      </div>
    </div>
  );
}
