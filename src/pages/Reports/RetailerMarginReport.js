import axios from "axios";
import React, { useState, useEffect, useMemo } from "react";
import Sidebar from "../../components/Sidebar";
import Headers from "../../components/Header";
import * as XLSX from "xlsx";
import * as FileSaver from "file-saver";

import { ChevronUpIcon, ChevronDownIcon } from "@heroicons/react/solid";

import MenuItem from "@mui/material/MenuItem";
import Selected from "@mui/material/Select";
import ListItemText from "@mui/material/ListItemText";
import Checkbox from "@mui/material/Checkbox";
import { Category } from "@mui/icons-material";
const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;
const MenuProps = {
  PaperProps: {
    style: {
      maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
      width: 250,
    },
  },
};
const names = [
  "Oliver Hansen",
  "Van Henry",
  "April Tucker",
  "Ralph Hubbard",
  "Omar Alexander",
  "Carlos Abbott",
  "Miriam Wagner",
  "Bradley Wilkerson",
  "Virginia Andrews",
  "Kelly Snyder",
];
const RetailerMarginReport = () => {
  const [itemsData, setItemsData] = useState([]);
  const [filterTitle, setFilterTitle] = useState("");
  const [filteritem, setFilterItems] = useState([]);
  const [itemEditPopup, setItemEditPopup] = useState("");
  const [item, setItem] = useState("");
  const [filterCategory, setFilterCategory] = useState([]);
  const [filterCompany, setFilterCompany] = useState([]);
  const [itemCategories, setItemCategories] = useState([]);
  const [companies, setCompanies] = useState([]);

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

  useEffect(() => {
    getItemsData();
  }, []);
  useEffect(() => {
    setFilterCompany(companies);
  }, [companies]);
  useEffect(() => {
    setFilterCategory(
      itemCategories?.filter((a) =>
        filterCompany?.find((b) => a.company_uuid === b.company_uuid)
      ) || []
    );
  }, [filterCompany, itemCategories]);
  let sheetData = useMemo(() => {
    let data = [];
    for (let item of filteritem?.sort(
      (a, b) => +a.sort_order - +b.sort_order
    )) {
      let obj = { "Item Name": item.item_title };

      data.push(obj);
    }
    return data;
  }, [filteritem]);

  const downloadHandler = async () => {
    const ws = XLSX.utils.json_to_sheet(sheetData);
    const wb = { Sheets: { data: ws }, SheetNames: ["data"] };
    const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    const data = new Blob([excelBuffer], { type: fileType });
    FileSaver.saveAs(data, "Stocks" + fileExtension);
  };
  useEffect(() => {
    setFilterItems(
      itemsData
        ?.filter((a) => a.item_title)
        ?.filter(
          (a) =>
            !filterTitle ||
            a.item_title
              .toLocaleLowerCase()
              .includes(filterTitle.toLocaleLowerCase())
        )
        ?.filter((a) =>
          filterCategory.find((b) => b.category_uuid === a.category_uuid)
        )
        .map((a) => {
          let categoryData = itemCategories.find(
            (b) => b.category_uuid === a.category_uuid
          );
          let companyData = companies.find(
            (b) => b.company_uuid === categoryData.company_uuid
          );
          return {
            ...a,
            company_title: companyData.company_title,
            category_title: categoryData.category_title,
            margin: (a.mrp && a.item_price
              ? (a.mrp / a.item_price - 1) * 100
              : 0
            ).toFixed(2),
          };
        })
    );
  }, [
    itemsData,
    filterTitle,
    filterCategory,
    filterCompany,
    itemCategories,
    companies,
  ]);
  const handleCompanyOptionsChange = (event) => {
    const {
      target: { value },
    } = event;

    let duplicateRemoved = [];

    value.forEach((item) => {
      if (
        duplicateRemoved.findIndex(
          (o) => o.company_uuid === item.company_uuid
        ) >= 0
      ) {
        duplicateRemoved = duplicateRemoved.filter(
          (x) => x.company_uuid === item.company_uuid
        );
      } else {
        duplicateRemoved.push(item);
      }
    });

    setFilterCompany(duplicateRemoved);
  };
  const handleCategoryOptionsChange = (event) => {
    const {
      target: { value },
    } = event;

    let duplicateRemoved = [];

    value.forEach((item) => {
      if (
        duplicateRemoved.findIndex(
          (o) => o.category_uuid === item.category_uuid
        ) >= 0
      ) {
        duplicateRemoved = duplicateRemoved.filter(
          (x) => x.category_uuid === item.category_uuid
        );
      } else {
        duplicateRemoved.push(item);
      }
    });

    setFilterCategory(duplicateRemoved);
  };
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
                <Selected
                  labelId="demo-multiple-checkbox-label"
                  id="demo-multiple-checkbox"
                  multiple
                  value={filterCompany}
                  onChange={handleCompanyOptionsChange}
                  // input={<OutlinedInput label="Warehouses" />}
                  renderValue={(selected) =>
                    selected.length === companies?.length
                      ? "All"
                      : !selected.length
                      ? "None"
                      : selected?.map((x) => x?.company_title)?.join(", ")
                  }
                  MenuProps={MenuProps}
                >
                  {companies?.map((variant) => (
                    <MenuItem key={variant.company_uuid} value={variant}>
                      <Checkbox
                        checked={
                          filterCompany.findIndex(
                            (item) => item.company_uuid === variant.company_uuid
                          ) >= 0
                        }
                      />
                      <ListItemText
                        placeholder="variant.name"
                        primary={variant.company_title}
                      />
                    </MenuItem>
                  ))}
                </Selected>
              </div>
            </div>
            <div className="inputGroup">
              <label htmlFor="Warehouse">Category</label>
              <div className="inputGroup" style={{ width: "200px" }}>
                <Selected
                  labelId="demo-multiple-checkbox-label"
                  id="demo-multiple-checkbox"
                  multiple
                  value={filterCategory}
                  onChange={handleCategoryOptionsChange}
                  // input={<OutlinedInput label="Warehouses" />}
                  renderValue={(selected) =>
                    selected?.length ===
                    itemCategories.filter((a) =>
                      filterCompany?.find(
                        (b) => a.company_uuid === b.company_uuid
                      )
                    )?.length
                      ? "All"
                      : !selected.length
                      ? "None"
                      : selected?.map((x) => x?.category_title).join(", ")
                  }
                  MenuProps={MenuProps}
                >
                  {itemCategories
                    .filter((a) =>
                      filterCompany?.find(
                        (b) => a.company_uuid === b.company_uuid
                      )
                    )
                    ?.map((variant) => (
                      <MenuItem key={variant.category_uuid} value={variant}>
                        <Checkbox
                          checked={
                            filterCategory?.findIndex(
                              (item) =>
                                item?.category_uuid === variant?.category_uuid
                            ) >= 0
                          }
                        />
                        <ListItemText
                          placeholder="variant.name"
                          primary={variant.category_title}
                        />
                      </MenuItem>
                    ))}
                </Selected>
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
            itemsDetails={filteritem}
            setItemData={setItem}
            setItemEditPopup={setItemEditPopup}
          />
        </div>
      </div>
      {itemEditPopup ? (
        <QuantityChanged
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

export default RetailerMarginReport;

const CovertedQty = (qty, conversion) => {
  let b = qty / +conversion;

  b = Math.sign(b) * Math.floor(Math.sign(b) * b);

  let p = Math.floor(qty % +conversion);

  return b + ":" + p;
};
function Table({ itemsDetails, setItemEditPopup, setItemData }) {
  const [items, setItems] = useState("sort_order");
  const [order, setOrder] = useState("");
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
              <span>Company</span>
              <div className="sort-buttons-container">
                <button
                  onClick={() => {
                    setItems("company_title");
                    setOrder("asc");
                  }}
                >
                  <ChevronUpIcon className="sort-up sort-button" />
                </button>
                <button
                  onClick={() => {
                    setItems("company_title");
                    setOrder("desc");
                  }}
                >
                  <ChevronDownIcon className="sort-down sort-button" />
                </button>
              </div>
            </div>
          </th>
          <th colSpan={2}>
            <div className="t-head-element">
              <span>Category</span>
              <div className="sort-buttons-container">
                <button
                  onClick={() => {
                    setItems("category_title");
                    setOrder("asc");
                  }}
                >
                  <ChevronUpIcon className="sort-up sort-button" />
                </button>
                <button
                  onClick={() => {
                    setItems("category_title");
                    setOrder("desc");
                  }}
                >
                  <ChevronDownIcon className="sort-down sort-button" />
                </button>
              </div>
            </div>
          </th>
          <th colSpan={2}>
            <div className="t-head-element">
              <span>Item Name</span>
              <div className="sort-buttons-container">
                <button
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
                </button>
              </div>
            </div>
          </th>
          <th colSpan={2}>
            <div className="t-head-element">
              <span>MRP</span>
              <div className="sort-buttons-container">
                <button
                  onClick={() => {
                    setItems("mrp");
                    setOrder("asc");
                  }}
                >
                  <ChevronUpIcon className="sort-up sort-button" />
                </button>
                <button
                  onClick={() => {
                    setItems("mrp");
                    setOrder("desc");
                  }}
                >
                  <ChevronDownIcon className="sort-down sort-button" />
                </button>
              </div>
            </div>
          </th>
          <th colSpan={2}>
            <div className="t-head-element">
              <span>Price</span>
              <div className="sort-buttons-container">
                <button
                  onClick={() => {
                    setItems("item_price");
                    setOrder("asc");
                  }}
                >
                  <ChevronUpIcon className="sort-up sort-button" />
                </button>
                <button
                  onClick={() => {
                    setItems("item_price");
                    setOrder("desc");
                  }}
                >
                  <ChevronDownIcon className="sort-down sort-button" />
                </button>
              </div>
            </div>
          </th>
          <th colSpan={2}>
            <div className="t-head-element">
              <span>Margin</span>
              <div className="sort-buttons-container">
                <button
                  onClick={() => {
                    setItems("margin");
                    setOrder("asc");
                  }}
                >
                  <ChevronUpIcon className="sort-up sort-button" />
                </button>
                <button
                  onClick={() => {
                    setItems("margin");
                    setOrder("desc");
                  }}
                >
                  <ChevronDownIcon className="sort-down sort-button" />
                </button>
              </div>
            </div>
          </th>
          <th colSpan={2}>
            <div className="t-head-element">
              <span>Discount</span>
              <div className="sort-buttons-container">
                <button
                  onClick={() => {
                    setItems("item_discount");
                    setOrder("asc");
                  }}
                >
                  <ChevronUpIcon className="sort-up sort-button" />
                </button>
                <button
                  onClick={() => {
                    setItems("item_discount");
                    setOrder("desc");
                  }}
                >
                  <ChevronDownIcon className="sort-down sort-button" />
                </button>
              </div>
            </div>
          </th>
        </tr>
      </thead>
      <tbody className="tbody">
        {itemsDetails
          .sort((a, b) =>
            order === "asc"
              ? typeof a[items] === "string"
                ? a[items]?.localeCompare(b[items])
                : a[items] - b[items]
              : typeof a[items] === "string"
              ? b[items]?.localeCompare(a[items])
              : b[items] - a[items]
          )
          ?.map((item, i, array) => (
            <tr
              key={Math.random()}
              style={{ height: "30px" }}
              onClick={(e) => {
                e.stopPropagation();
                setItemEditPopup({ type: "item_price" });
                setItemData(item);
              }}
            >
              <td className="flex" style={{ justifyContent: "space-between" }}>
                {i + 1}
              </td>

              <td colSpan={2}>{item.company_title || ""}</td>
              <td colSpan={2}>{item.category_title || ""}</td>
              <td colSpan={2}>{item.item_title || ""}</td>
              <td colSpan={2}>{item.mrp || 0}</td>
              <td colSpan={2}>{item.item_price || 0}</td>
              <td colSpan={2}>{item.margin || 0}</td>
              <td colSpan={2}>{item.item_discount || 0}</td>
            </tr>
          ))}
      </tbody>
    </table>
  );
}
function QuantityChanged({ onSave, item, update }) {
  const [data, setdata] = useState({});

  useEffect(() => {
    setdata(item);
  }, [item]);

  const submitHandler = async (e) => {
    e.preventDefault();

    const response = await axios({
      method: "put",
      url: "/items/putItem",
      data: [{ item_uuid: item.item_uuid, item_price: data.item_price }],
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
                <div
                  className="row"
                  style={{ flexDirection: "row", alignItems: "flex-start" }}
                >
                  <label className="selectLabel">
                    Item Price
                    <input
                      type="number"
                      onWheel={(e) => e.target.blur()}
                      name="route_title"
                      className="numberInput"
                      step="0.001"
                      value={data?.item_price}
                      onChange={(e) =>
                        setdata({
                          ...data,
                          item_price: e.target.value,
                          margin: (data.mrp / e.target.value - 1) * 100,
                        })
                      }
                      maxLength={5}
                    />
                  </label>
                  <label className="selectLabel">
                    Item Margin
                    <input
                      type="number"
                      onWheel={(e) => e.target.blur()}
                      name="route_title"
                      className="numberInput"
                      step="0.001"
                      value={data?.margin}
                      onChange={(e) => {
                        let item_price = data?.mrp * (e.target.value / 100 + 1);

                        setdata({
                          ...data,
                          margin: e.target.value,
                          item_price,
                        });
                      }}
                      maxLength={5}
                    />
                  </label>{" "}
                </div>
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