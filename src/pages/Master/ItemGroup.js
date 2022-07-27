import React, { useState, useEffect, useMemo } from "react";
import Header from "../../components/Header";
import Sidebar from "../../components/Sidebar";
import SetupModal from "../../components/setupModel/SetupModel";
import { ChevronUpIcon, ChevronDownIcon } from "@heroicons/react/solid";
import axios from "axios";
const ItemGroup = () => {
  const [itemGroup, setItemGroup] = useState([]);
  const [itemGroupTitle, setItemGroupTitle] = useState("");
  const [popupForm, setPopupForm] = useState(false);
  const [addItems, setAddItems] = useState(false);
  const getCounterGroup = async () => {
    const response = await axios({
      method: "get",
      url: "/itemGroup/GetItemGroupList",

      headers: {
        "Content-Type": "application/json",
      },
    });
    if (response.data.success) setItemGroup(response.data.result);
  };

  useEffect(() => {
    getCounterGroup();
  }, [popupForm]);

  return (
    <>
      <Sidebar />
      <Header />
      <div className="item-sales-container orders-report-container">
        <div id="heading">
          <h2>Item Group</h2>
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
              onChange={(e) => setItemGroupTitle(e.target.value)}
              value={itemGroupTitle}
              placeholder="Search Item Group Title..."
              className="searchInput"
            />

            <div>
              Total Items:{" "}
              {
                itemGroup
                  .filter((a) => a.item_group_title)
                  .filter(
                    (a) =>
                      !itemGroupTitle ||
                      a.item_group_title
                        ?.toLocaleLowerCase()
                        ?.includes(itemGroupTitle.toLocaleLowerCase())
                  ).length
              }
            </div>
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
            itemsDetails={itemGroup
              .filter((a) => a.item_group_title)
              .filter(
                (a) =>
                  !itemGroupTitle ||
                  a.item_group_title
                    ?.toLocaleLowerCase()
                    ?.includes(itemGroupTitle.toLocaleLowerCase())
              )}
            setPopupForm={setPopupForm}
            setAddItems={setAddItems}
          />
        </div>
      </div>
      {popupForm ? (
        <NewUserForm
          onSave={() => setPopupForm(false)}
          popupInfo={popupForm}
          setRoutesData={setItemGroup}
        />
      ) : (
        ""
      )}
      {addItems ? (
        <SetupModal onClose={() => setAddItems(false)}>
          <ItemsForm
            ItemGroup={addItems}
            // itemGroupings={itemGroupings}
            // setItemGroupings={setItemGroupings}
            // itemGroupingIndex={itemsModalIndex}
            setItemsModalIndex={setAddItems}
          />
        </SetupModal>
      ) : (
        ""
      )}
    </>
  );
};

export default ItemGroup;
function Table({ itemsDetails, setPopupForm, setAddItems }) {
  const [items, setItems] = useState("item_group_title");
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
              <span>Item Group Title</span>
              <div className="sort-buttons-container">
                <button
                  onClick={() => {
                    setItems("item_group_title");
                    setOrder("asc");
                  }}
                >
                  <ChevronUpIcon className="sort-up sort-button" />
                </button>
                <button
                  onClick={() => {
                    setItems("item_group_title");
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
          .filter((a) => a.item_group_title)
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
                setPopupForm({ type: "edit", data: item });
              }}
            >
              <td>{i + 1}</td>
              <td colSpan={2}>{item.item_group_title}</td>
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
function NewUserForm({ onSave, popupInfo, setRoutesData }) {
  const [data, setdata] = useState({});
  const [errMassage, setErrorMassage] = useState("");
  useEffect(
    popupInfo.type === "edit"
      ? () => {
          setdata(popupInfo.data);
        }
      : () => {},
    []
  );
  const submitHandler = async (e) => {
    e.preventDefault();
    if (!data.item_group_title) {
      setErrorMassage("Please insert Group Title");
      return;
    }
    if (popupInfo?.type === "edit") {
      const response = await axios({
        method: "put",
        url: "/itemGroup/putItemGroup",
        data,
        headers: {
          "Content-Type": "application/json",
        },
      });
      if (response.data.success) {
        setRoutesData((prev) =>
          prev?.map((i) => (i.user_uuid === data.user_uuid ? data : i))
        );
        onSave();
      }
    } else {
      const response = await axios({
        method: "post",
        url: "/itemGroup/postItemGroup",
        data,
        headers: {
          "Content-Type": "application/json",
        },
      });
      if (response.data.success) {
        setRoutesData((prev) => [...prev, data]);
        onSave();
      }
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
              <div className="row">
                <h1>{popupInfo.type === "edit" ? "Edit" : "Add"} Item Group</h1>
              </div>

              <div className="formGroup">
                <div className="row">
                  <label className="selectLabel">
                    Item Group Title
                    <input
                      type="text"
                      name="route_title"
                      className="numberInput"
                      value={data?.item_group_title}
                      onChange={(e) =>
                        setdata({
                          ...data,
                          item_group_title: e.target.value,
                        })
                      }
                      maxLength={42}
                    />
                  </label>
                </div>
              </div>
              <i style={{ color: "red" }}>
                {errMassage === "" ? "" : "Error: " + errMassage}
              </i>

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

function ItemsForm({ ItemGroup, itemGroupingIndex, setItemsModalIndex }) {
  const [pattern, setPattern] = useState("");
  const [items, setItems] = useState([]);
  const [company, setCompany] = useState([]);
  const [Category, setCategory] = useState([]);
  const [itemGroupings, setItemGroupings] = useState([]);
  const [filterCategory, setFilterCategory] = useState("");
  const [filterCompany, setFilterCompany] = useState("");
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
    if (response.data.success) setItems(response.data.result);
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
    getItemCategories();
    getCompanies();
  }, []);
  useEffect(
    items?.length
      ? () =>
          setItemGroupings(
            items.filter(
              (a) =>
                a.item_group_uuid.filter((b) => b === ItemGroup.item_group_uuid)
                  .length
            )
          )
      : () => {},
    [items]
  );
  const searchedItems = useMemo(
    () =>
      items
        ?.map((b) => ({
          ...b,
          company_title:
            company.find((a) => a.company_uuid === b.company_uuid)
              ?.company_title || "-",
          category_title:
            Category.find((a) => a.category_uuid === b.category_uuid)
              ?.category_title || "-",
        }))
        .filter(
          (item) =>
            item.item_title.toLowerCase().includes(pattern.toLowerCase()) &&
            item.category_title
              .toLowerCase()
              .includes(filterCategory.toLowerCase()) &&
            item.company_title
              .toLowerCase()
              .includes(filterCompany.toLowerCase())
        ),
    [pattern, items, filterCategory, filterCompany, company, Category]
  );

  const handleItemIncludeToggle = (item_uuid, type) => {
    let data = items.find((a) => a.item_uuid === item_uuid);
    if (type === "remove") {
      data = toggleRemoveItem(itemGroupings, data);
    } else {
      data = toggleAddItem(itemGroupings, data);
    }
    console.log(data, ItemGroup.item_group_uuid);

    setItemGroupings(data);
  };
  const toggleRemoveItem = (arr, item) =>
    arr.map((a) =>
      a?.item_uuid === item.item_uuid
        ? {
            ...a,
            item_group_uuid: a.item_group_uuid.filter((b) => {
              console.log("----", b, ItemGroup.item_group_uuid);
              return b !== ItemGroup.item_group_uuid;
            }),
          }
        : a
    );
  const toggleAddItem = (arr, item) =>
    arr?.filter((i) => i?.item_uuid === item?.item_uuid)?.length
      ? [
          ...arr?.filter((i) => i !== item).map((a) => ({ ...a, one: true })),
          arr
            ?.filter((i) => i.item_uuid === item.item_uuid)
            .map((a) => ({
              ...a,
              one: true,
              item_group_uuid: item?.item_group_uuid?.length
                ? [...item.item_group_uuid, ItemGroup.item_group_uuid]
                : [ItemGroup.item_group_uuid],
            }))[0],
        ]
      : arr?.length
      ? [
          ...arr.map((a) => ({ ...a, two: true })),
          {
            ...item,
            two: true,
            item_group_uuid: item?.item_group_uuid?.length
              ? [...item.item_group_uuid, ItemGroup.item_group_uuid]
              : [ItemGroup.item_group_uuid],
          },
        ]
      : [
          {
            ...item,
            three: true,
            item_group_uuid: item.item_group_uuid?.length
              ? [...item.item_group_uuid, ItemGroup.item_group_uuid]
              : [ItemGroup.item_group_uuid],
          },
        ];
  const submitHandler = async () => {
    const response = await axios({
      method: "put",
      url: "/items/putItem",
      data: itemGroupings,
      headers: {
        "Content-Type": "application/json",
      },
    });
    if (response.data.success) {
      setItemsModalIndex(null);
    }
  };
  return (
    <div
      className="noSpaceForm"
      style={{
        padding: "0px 12px",
        height: "fit-content",
      }}
    >
      <h1>Items</h1>
      <div className="flex" style={{ justifyContent: "space-between" }}>
        <input
          type="text"
          onChange={(e) => setPattern(e.target.value)}
          value={pattern}
          placeholder="Search Item..."
          className="searchInput"
        />{" "}
        <input
          type="text"
          onChange={(e) => setFilterCompany(e.target.value)}
          value={filterCompany}
          placeholder="Search Company..."
          className="searchInput"
        />{" "}
        <input
          type="text"
          onChange={(e) => setFilterCategory(e.target.value)}
          value={filterCategory}
          placeholder="Search Category..."
          className="searchInput"
        />
      </div>

      <ItemsTable
        items={searchedItems}
        onItemIncludeToggle={handleItemIncludeToggle}
        includesArray={itemGroupings}
        itemGroup={ItemGroup}
        company={company}
        Category={Category}
        filterCategory={filterCategory}
        filterCompany={filterCompany}
      />
      <div>
        <button
          type="button"
          className="fieldEditButton"
          onClick={submitHandler}
        >
          Done
        </button>
      </div>
    </div>
  );
}
function ItemsTable({
  items,
  itemGroup,
  includesArray,
  onItemIncludeToggle,
  filterCategory,
  filterCompany,
  company,
  Category,
}) {
  const [filterItemData, setFilterItemData] = useState([]);
  useEffect(() => {
    setFilterItemData(
      items.sort((a, b) => {
        let aLength = includesArray?.filter(
          (c) =>
            c?.item_uuid === a?.item_uuid &&
            c.item_group_uuid.filter((d) => d === itemGroup.item_group_uuid)
              .length
        )?.length;

        let bLength = includesArray?.filter(
          (c) =>
            c?.item_uuid === b?.item_uuid &&
            c.item_group_uuid.filter((d) => d === itemGroup.item_group_uuid)
              .length
        )?.length;
        console.log(includesArray?.filter(
          (c) =>
            c?.item_uuid === b?.item_uuid &&
            c.item_group_uuid.filter((d) => d === itemGroup.item_group_uuid)
              .length
        )?.length,a
)
        if (aLength && bLength) {
          return a.item_title.localeCompare(b.item_title);
        } else if (aLength) {
          return -1;
        } else if (bLength) {
          return 1;
        } else {
          return a.item_title.localeCompare(b.item_title);
        }
      })
    );
  }, [items, filterCategory, filterCompany, company, Category, includesArray, itemGroup.item_group_uuid, itemGroup.counter_group_uuid]);
  return (
    <div
      style={{
        overflowY: "scroll",
        height: "45vh",
      }}
    >
      <table className="table">
        <thead>
          <tr>
            <th className="description" style={{ width: "10%" }}>
              S.r
            </th>
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
          {filterItemData
            ?.filter((a) => a.item_uuid)
            .map((item, index) => {
              return (
                <tr key={item.item_uuid}>
                  <td>{index + 1}</td>
                  <td>{item.item_title}</td>
                  <td>{item?.company_title}</td>
                  <td>{item?.category_title}</td>

                  <td>
                    <button
                      type="button"
                      className="noBgActionButton"
                      style={{
                        backgroundColor: includesArray?.filter(
                          (a) =>
                            a?.item_uuid === item?.item_uuid &&
                            a.item_group_uuid.filter(
                              (a) => a === itemGroup.item_group_uuid
                            ).length
                        )?.length
                          ? "red"
                          : "var(--mainColor)",
                        width: "150px",
                        fontSize: "large",
                      }}
                      onClick={(event) =>
                        onItemIncludeToggle(
                          item.item_uuid,
                          includesArray?.filter(
                            (a) =>
                              a?.item_uuid === item?.item_uuid &&
                              a.item_group_uuid.filter(
                                (a) => a === itemGroup.item_group_uuid
                              ).length
                          )?.length
                            ? "remove"
                            : "add"
                        )
                      }
                    >
                      {includesArray?.filter(
                        (a) =>
                          a?.item_uuid === item?.item_uuid &&
                          a.item_group_uuid.filter(
                            (a) => a === itemGroup.item_group_uuid
                          ).length
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
  );
}
