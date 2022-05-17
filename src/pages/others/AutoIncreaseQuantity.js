import React, { useState, useEffect, useMemo } from "react";
import Header from "../../components/Header";
import Sidebar from "../../components/Sidebar";
import "./style.css";
import {
  ChevronUpIcon,
  ChevronDownIcon,
  MenuAlt2Icon,
} from "@heroicons/react/solid";
import { v4 as uuid } from "uuid";
import axios from "axios";
const DEFAULT = {
  base_qty: "",
  add_qty: "",
  value: "p",
};
const AutoIncreaseQuantity = () => {
  const [popupForm, setPopupForm] = useState(false);
  return (
    <>
      <Sidebar />
      <Header />
      <div className="item-sales-container orders-report-container">
        <div id="heading">
          <h2 style={{ width: "100%" }}>Auto Increase Quantity </h2>
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
            <button
              className="item-sales-search"
              onClick={() => setPopupForm(true)}
            >
              Add
            </button>
          </div>
        </div>
        <div className="table-container-user item-sales-container">
          <Table
          // itemsDetails={filterCounterGroup}
          // setPopupForm={setPopupForm}
          // setAddItems={setAddItems}
          />
        </div>
      </div>
      {popupForm ? (
        <NewUserForm onSave={() => setPopupForm(false)} popupInfo={popupForm} />
      ) : (
        ""
      )}
    </>
  );
};

export default AutoIncreaseQuantity;
function Table({ itemsDetails = [], setPopupForm, setAddItems }) {
  const [items, setItems] = useState("counter_group_title");
  const [order, setOrder] = useState("asc");
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
              <span></span>
              <div className="sort-buttons-container">
                <button
                  onClick={() => {
                    setItems("counter_group_title");
                    setOrder("asc");
                  }}
                >
                  <ChevronUpIcon className="sort-up sort-button" />
                </button>
                <button
                  onClick={() => {
                    setItems("counter_group_title");
                    setOrder("desc");
                  }}
                >
                  <ChevronDownIcon className="sort-down sort-button" />
                </button>
              </div>
            </div>
          </th>
          <th></th>
        </tr>
      </thead>
      <tbody className="tbody">
        {itemsDetails
          .filter((a) => a.counter_group_title)
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
              onClick={() => setPopupForm({ type: "edit", data: item })}
            >
              <td>{i + 1}</td>
              <td colSpan={2}>{item.counter_group_title}</td>
              <td>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setAddItems(item);
                  }}
                  className="fieldEditButton"
                >
                  Action
                </button>
              </td>
            </tr>
          ))}
      </tbody>
    </table>
  );
}

function NewUserForm({ onSave }) {
  const [objData, setObgData] = useState({
    type: "auto-increase-qty",
    auto_title:"",
    items: [],
    item_groups: [],
    counters: [],
    counter_groups: [],
    qty_details: [{ ...DEFAULT, uuid: uuid() }],
  });
  const [ui, setUi] = useState(1);
  const [items, setItems] = useState([]);
  const [company, setCompany] = useState([]);
  const [Category, setCategory] = useState([]);
  const [counterGroup, setCounterGroup] = useState([]);
  const [itemGroupings, setItemGroupings] = useState([]);
  const [filterCounterGroupTitle, setFilterCounterGroupTitle] = useState("");
  const [itemGroups, setItemsGroup] = useState([]);
  const [filterTitle, setFilterTitle] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [filterCompany, setFilterCompany] = useState("");
  const [itemGroupTitle, setItemGroupTitle] = useState("");
  const [routesData, setRoutesData] = useState([]);
  const [counter, setCounter] = useState([]);
  const [filterCounterTitle, setFilterCounterTitle] = useState("");
  const [filterRoute, setFilterRoute] = useState("");
  const getRoutesData = async () => {
    const response = await axios({
      method: "get",
      url: "/routes/GetRouteList",

      headers: {
        "Content-Type": "application/json",
      },
    });
    if (response.data.success) setRoutesData(response.data.result);
  };

  const getCounter = async () => {
    const response = await axios({
      method: "get",
      url: "/counters/GetCounterList",

      headers: {
        "Content-Type": "application/json",
      },
    });
    if (response.data.success)
      setCounter(
        response.data.result.map((b) => ({
          ...b,
          route_title:
            routesData.find((a) => a.route_uuid === b.route_uuid)
              ?.route_title || "-",
        }))
      );
  };

  useEffect(() => {
    getCounter();
  }, [routesData]);
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

  const getItemGroup = async () => {
    const response = await axios({
      method: "get",
      url: "/itemGroup/GetItemGroupList",

      headers: {
        "Content-Type": "application/json",
      },
    });
    if (response.data.success) setItemsGroup(response.data.result);
  };
  const getItemCategories = async () => {
    const response = await axios({
      method: "get",
      url: "/itemCategories/GetItemCategoryList",

      headers: {
        "Content-Type": "application/json",
      },
    });
    if (response.data.success) setCategory(response.data.result);
  };
  const getItemsData = async () => {
    const response = await axios({
      method: "get",
      url: "/items/GetItemList",

      headers: {
        "Content-Type": "application/json",
      },
    });
    if (response.data.success)
      setItems(
        response.data.result.map((b) => ({
          ...b,
          company_title: company.find(
            (a) => a?.company_uuid === b?.company_uuid
          )?.company_title,
          category_title: Category.find(
            (a) => a?.company_uuid === b?.company_uuid
          )?.category_title,
        }))
      );
  };
  const getCompanies = async () => {
    const response = await axios({
      method: "get",
      url: "/companies/getCompanies",

      headers: {
        "Content-Type": "application/json",
      },
    });
    if (response.data.success) setCompany(response.data.result);
  };
  useEffect(() => {
    getItemsData();
  }, [company, Category]);
  useEffect(() => {
    getItemGroup();
    getCompanies();
    getCounterGroup();
    getItemCategories();
    getRoutesData();
  }, []);
  const submitHandler = async (e) => {
    e.preventDefault();
    console.log(objData)
    const response = await axios({
        method: "post",
        url: "/autoBill/CreateAutoQty",
        data:objData,
        headers: {
          "Content-Type": "application/json",
        },
      });
      console.log(response)
      if (response.data.success) {
     
        onSave();
      }
  };

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
            padding: "20px",
            width: "fit-content",
          }}
        >
          {+ui === 1 ? (
            <div style={{ overflowY: "scroll", height: "40vh" }}>
              <table
                className="user-table"
                style={{
                  width: "50vw",

                  overflow: "scroll",
                }}
              >
                <tbody>
                  <tr><td colSpan={2} style={{width:"50vw",
                display:"flex",
                alignItems:"center",
                justifyContent:"center",
               }}> 
                    <b>Auto Title : </b>
                  <input
                          className="searchInput"
                          style={{
                            border: "none",
                            borderBottom: "2px solid black",
                            borderRadius: "0px",
                            
                          }}
                          placeholder="Title"
                          value={objData.auto_title}
                          onChange={(e) =>
                            setObgData((prev) => ({
                              ...prev,
                              auto_title:e.target.value
                            }))
                          }
                        />
                    </td></tr>
                  {objData.qty_details?.map((item, i) => (
                    <tr key={Math.random()} style={{ height: "30px" }}>
                      <td colSpan={4} style={{ textAlign: "center" }}>
                        If quantity of base item is
                        <input
                          className="searchInput"
                          style={{
                            border: "none",
                            borderBottom: "2px solid black",
                            borderRadius: "0px",
                            width: "50px",
                          }}
                          value={item.base_qty}
                          onChange={(e) =>
                            setObgData((prev) => ({
                              ...prev,
                              qty_details: prev.qty_details.map((i) =>
                                i.uuid === item.uuid
                                  ? { ...i, base_qty: e.target.value }
                                  : i
                              ),
                            }))
                          }
                        />
                        ,make it input
                        <input
                          className="searchInput"
                          style={{
                            border: "none",
                            borderBottom: "2px solid black",
                            borderRadius: "0px",
                            width: "80px",
                          }}
                          value={item.add_qty}
                          onChange={(e) =>
                            setObgData((prev) => ({
                              ...prev,
                              qty_details: prev.qty_details.map((i) =>
                                i.uuid === item.uuid
                                  ? { ...i, add_qty: e.target.value }
                                  : i
                              ),
                            }))
                          }
                        />
                      </td>

                      <td>
                        <select
                          value={item.unit}
                          className="select"
                          style={{
                            border: "none",
                            borderBottom: "2px solid black",
                            borderRadius: "0px",
                            width: "80px",
                          }}
                          onChange={(e) =>
                            setObgData((prev) => ({
                              ...prev,
                              qty_details: prev.qty_details.map((i) =>
                                i.uuid === item.uuid
                                  ? { ...i, unit: e.target.value }
                                  : i
                              ),
                            }))
                          }
                        >
                          <option value="p">Pcs</option>
                          <option value="b">Box</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <button
                className="item-sales-search"
                onClick={(e) =>
                  setObgData((prev) => ({
                    ...prev,
                    qty_details: [...prev.qty_details, DEFAULT],
                  }))
                }
              >
                Add
              </button>
            </div>
          ) : +ui === 2 ? (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <div
                style={{
                  overflowY: "scroll",
                  height: "45vh",
                }}
              >
                <input
                  type="text"
                  onChange={(e) => setItemGroupTitle(e.target.value)}
                  value={itemGroupTitle}
                  placeholder="Search Item Group Title..."
                  className="searchInput"
                />

                <table className="table">
                  <thead>
                    <tr>
                      <th className="description" style={{ width: "50%" }}>
                        Item Group
                      </th>
                      <th style={{ width: "25%" }}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {itemGroups
                      ?.filter((a) => a.item_group_title)
                      .filter(
                        (a) =>
                          !itemGroupTitle ||
                          a.item_group_title
                            .toLocaleLowerCase()
                            .includes(itemGroupTitle.toLocaleLowerCase())
                      )
                      .map((item, index) => {
                        return (
                          <tr key={item.item_uuid}>
                            <td>{item.item_group_title}</td>

                            <td>
                              <button
                                type="button"
                                className="noBgActionButton"
                                style={{
                                  backgroundColor: objData.item_groups?.filter(
                                    (a) => a === item?.item_group_uuid
                                  )?.length
                                    ? "red"
                                    : "var(--mainColor)",
                                  width: "150px",
                                  fontSize: "large",
                                }}
                                onClick={(event) =>
                                  setObgData((prev) => ({
                                    ...objData,
                                    item_groups: prev.item_groups.filter(
                                      (a) => a === item.item_group_uuid
                                    ).length
                                      ? prev.item_groups.filter(
                                          (a) => a !== item.item_group_uuid
                                        )
                                      : prev.item_groups.length
                                      ? [
                                          ...prev.item_groups,
                                          item.item_group_uuid,
                                        ]
                                      : [item.item_group_uuid],
                                  }))
                                }
                              >
                                {objData.item_groups.filter(
                                  (a) => a === item.item_group_uuid
                                ).length
                                  ? "Remove"
                                  : "Add"}
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                  </tbody>
                </table>
              </div>
              <div
                style={{
                  overflowY: "scroll",
                  height: "45vh",
                }}
              >
                <input
                  type="text"
                  onChange={(e) => setFilterTitle(e.target.value)}
                  value={filterTitle}
                  placeholder="Search Item Title..."
                  className="searchInput"
                />
                <input
                  type="text"
                  onChange={(e) => setFilterCompany(e.target.value)}
                  value={filterCompany}
                  placeholder="Search Company Title..."
                  className="searchInput"
                />
                <input
                  type="text"
                  onChange={(e) => setFilterCategory(e.target.value)}
                  value={filterCategory}
                  placeholder="Search Category Title..."
                  className="searchInput"
                />

                <table className="table">
                  <thead>
                    <tr>
                      <th className="description" style={{ width: "25%" }}>
                        Item
                      </th>
                      <th className="description" style={{ width: "25%" }}>
                        Company
                      </th>
                      <th className="description" style={{ width: "25%" }}>
                        Category
                      </th>

                      <th style={{ width: "25%" }}>Action</th>
                    </tr>
                  </thead>

                  <tbody>
                    {items
                      ?.filter((a) => a.item_uuid)
                      .filter(
                        (a) =>
                          !filterTitle ||
                          a.item_title
                            .toLocaleLowerCase()
                            .includes(filterTitle.toLocaleLowerCase())
                      )
                      .filter(
                        (a) =>
                          !filterCompany ||
                          a?.company_title
                            .toLocaleLowerCase()
                            .includes(filterCompany.toLocaleLowerCase())
                      )
                      .filter(
                        (a) =>
                          !filterCategory ||
                          a?.category_title
                            .toLocaleLowerCase()
                            .includes(filterCategory.toLocaleLowerCase())
                      )
                      .map((item, index) => {
                        return (
                          <tr key={item.item_uuid}>
                            <td>{item.item_title}</td>
                            <td>{item.company_title}</td>
                            <td>{item.category_title}</td>

                            <td>
                              <button
                                type="button"
                                className="noBgActionButton"
                                style={{
                                  backgroundColor: objData.items.filter(
                                    (a) => a === item.item_uuid
                                  )?.length
                                    ? "red"
                                    : "var(--mainColor)",
                                  width: "150px",
                                  fontSize: "large",
                                }}
                                onClick={(event) =>
                                  setObgData((prev) => ({
                                    ...objData,
                                    items: prev.items.filter(
                                      (a) => a === item.item_uuid
                                    ).length
                                      ? prev.items.filter(
                                          (a) => a !== item.item_uuid
                                        )
                                      : prev.items.length
                                      ? [...prev.items, item.item_uuid]
                                      : [item.item_uuid],
                                  }))
                                }
                              >
                                {objData.items.filter(
                                  (a) => a === item.item_uuid
                                )?.length
                                  ? "Remove"
                                  : "Add"}
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <div
                style={{
                  overflowY: "scroll",
                  height: "45vh",
                }}
              >
                <input
                  type="text"
                  onChange={(e) => setFilterCounterGroupTitle(e.target.value)}
                  value={filterCounterGroupTitle}
                  placeholder="Search Item Group Title..."
                  className="searchInput"
                />

                <table className="table">
                  <thead>
                    <tr>
                      <th className="description" style={{ width: "50%" }}>
                        Counter Group
                      </th>
                      <th style={{ width: "25%" }}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {counterGroup
                      ?.filter((a) => a.counter_group_title)
                      .filter(
                        (a) =>
                          !filterCounterGroupTitle ||
                          a.counter_group_title
                            .toLocaleLowerCase()
                            .includes(
                              filterCounterGroupTitle.toLocaleLowerCase()
                            )
                      )
                      .map((item, index) => {
                        return (
                          <tr key={item.item_uuid}>
                            <td>{item.counter_group_title}</td>

                            <td>
                              <button
                                type="button"
                                className="noBgActionButton"
                                style={{
                                  backgroundColor: objData.counter_groups.filter(
                                    (a) => a === item.counter_group_uuid
                                  )?.length
                                    ? "red"
                                    : "var(--mainColor)",
                                  width: "150px",
                                  fontSize: "large",
                                }}
                                onClick={(event) =>
                                  setObgData((prev) => ({
                                    ...objData,
                                    counter_groups: prev.counter_groups.filter(
                                      (a) => a === item.counter_group_uuid
                                    ).length
                                      ? prev.counter_groups.filter(
                                          (a) => a !== item.counter_group_uuid
                                        )
                                      : prev.counter_groups.length
                                      ? [
                                          ...prev.counter_groups,
                                          item.counter_group_uuid,
                                        ]
                                      : [item.counter_group_uuid],
                                  }))
                                }
                              >
                                {objData.counter_groups.filter(
                                  (a) => a === item.counter_group_uuid
                                )?.length
                                  ? "Remove"
                                  : "Add"}
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                  </tbody>
                </table>
              </div>
              <div
                style={{
                  overflowY: "scroll",
                  height: "45vh",
                }}
              >
                <input
                  type="text"
                  onChange={(e) => setFilterCounterTitle(e.target.value)}
                  value={filterCounterTitle}
                  placeholder="Search Counter Title..."
                  className="searchInput"
                />
                <input
                  type="text"
                  onChange={(e) => setFilterRoute(e.target.value)}
                  value={filterRoute}
                  placeholder="Search Route Title..."
                  className="searchInput"
                />

                <table className="table">
                  <thead>
                    <tr>
                      <th className="description" style={{ width: "25%" }}>
                        Counter
                      </th>
                      <th className="description" style={{ width: "25%" }}>
                        Route
                      </th>

                      <th style={{ width: "25%" }}>Action</th>
                    </tr>
                  </thead>
                  {console.log(counter)}
                  <tbody>
                    {counter
                      ?.filter((a) => a.counter_uuid)
                      .filter(
                        (a) =>
                          !filterCounterTitle ||
                          a.counter_title
                            ?.toLocaleLowerCase()
                            .includes(filterCounterTitle.toLocaleLowerCase())
                      )
                      .filter(
                        (a) =>
                          !filterRoute ||
                          a?.route_title
                            ?.toLocaleLowerCase()
                            .includes(filterRoute.toLocaleLowerCase())
                      )

                      .map((item, index) => {
                        return (
                          <tr key={item.counter_uuid}>
                            <td>{item.counter_title}</td>
                            <td>{item.route_title}</td>

                            <td>
                              <button
                                type="button"
                                className="noBgActionButton"
                                style={{
                                  backgroundColor: objData.counters.filter(
                                    (a) => a === item.counter_uuid
                                  )?.length
                                    ? "red"
                                    : "var(--mainColor)",
                                  width: "150px",
                                  fontSize: "large",
                                }}
                                onClick={(event) =>
                                  setObgData((prev) => ({
                                    ...objData,
                                    counters: prev.counters.filter(
                                      (a) => a === item.counter_uuid
                                    ).length
                                      ? prev.counters.filter(
                                          (a) => a !== item.counter_uuid
                                        )
                                      : prev.counters.length
                                      ? [...prev.counters, item.counter_uuid]
                                      : [item.counter_uuid],
                                  }))
                                }
                              >
                                {objData.counters.filter(
                                  (a) => a === item.counter_uuid
                                )?.length
                                  ? "Remove"
                                  : "Add"}
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
          {+ui === 1 ? (
            <div
              style={{
                width: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <button
                className="fieldEditButton"
                onClick={() => setUi((prev) => prev + 1)}
              >
                Next
              </button>
            </div>
          ) : +ui === 2 ? (
            <div
              style={{
                width: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <button
                className="fieldEditButton"
                onClick={() => setUi((prev) => prev - 1)}
              >
                Back
              </button>
              <button
                className="fieldEditButton"
                onClick={() => setUi((prev) => prev + 1)}
              >
                Next
              </button>
            </div>
          ) : (
            <div
              style={{
                width: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <button
                className="fieldEditButton"
                onClick={() => setUi((prev) => prev - 1)}
              >
                Back
              </button>
              <button className="fieldEditButton" onClick={submitHandler}>
                Save
              </button>
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