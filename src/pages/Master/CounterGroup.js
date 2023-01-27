import React, { useState, useEffect, useMemo } from "react";
import Header from "../../components/Header";
import Sidebar from "../../components/Sidebar";

import SetupModal from "../../components/setupModel/SetupModel";
import { ChevronUpIcon, ChevronDownIcon } from "@heroicons/react/solid";
import axios from "axios";
import { DeleteOutline } from "@mui/icons-material";
const CounterGroup = () => {
  const [counterGroup, setCounterGroup] = useState([]);
  const [deletePopup, setDeletePopup] = useState(false);
  const [filterCounterGroupTitle, setFilterCounterGroupTitle] = useState("");
  const [popupForm, setPopupForm] = useState(false);
  const [addItems, setAddItems] = useState(false);
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

  useEffect(() => {
    getCounterGroup();
  }, [popupForm]);

  return (
    <>
      <Sidebar />
      <Header />
      <div className="item-sales-container orders-report-container">
        <div id="heading">
          <h2>Counter Group</h2>
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
              onChange={(e) => setFilterCounterGroupTitle(e.target.value)}
              value={filterCounterGroupTitle}
              placeholder="Search Counter Title..."
              className="searchInput"
            />

            <div>
              Total Items:{" "}
              {
                counterGroup
                  .filter((a) => a.counter_group_title)
                  .filter(
                    (a) =>
                      !filterCounterGroupTitle ||
                      a.counter_group_title
                        .toLocaleLowerCase()
                        .includes(filterCounterGroupTitle.toLocaleLowerCase())
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
            itemsDetails={counterGroup
              .filter((a) => a.counter_group_title)
              .filter(
                (a) =>
                  !filterCounterGroupTitle ||
                  a.counter_group_title
                    .toLocaleLowerCase()
                    .includes(filterCounterGroupTitle.toLocaleLowerCase())
              )}
            setPopupForm={setPopupForm}
            setAddItems={setAddItems}
            setDeletePopup={setDeletePopup}
          />
        </div>
      </div>
      {popupForm ? (
        <NewUserForm
          onSave={() => setPopupForm(false)}
          popupInfo={popupForm}
          setRoutesData={setCounterGroup}
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
      {deletePopup ? (
        <DeleteCounterPopup
          onSave={() => setDeletePopup(false)}
          getCounterGroup={getCounterGroup}
          popupInfo={deletePopup}
        />
      ) : (
        ""
      )}
    </>
  );
};

export default CounterGroup;
function Table({ itemsDetails, setPopupForm, setAddItems,setDeletePopup }) {
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
              <span>Counter Group Title</span>
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
          <th colSpan={2}></th>
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
              <td
                colSpan={1}
                onClick={(e) => {
                  e.stopPropagation();

                  setDeletePopup(item);
                }}
              >
                <DeleteOutline />
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
  useEffect(() => {
    if (popupInfo?.type === "edit") setdata(popupInfo.data);
  }, [popupInfo.data, popupInfo?.type]);

  const submitHandler = async (e) => {
    e.preventDefault();
    if (!data.counter_group_title) {
      setErrorMassage("Please insert Group Title");
      return;
    }
    if (popupInfo?.type === "edit") {
      const response = await axios({
        method: "put",
        url: "/counterGroup/putCounterGroup",
        data,
        headers: {
          "Content-Type": "application/json",
        },
      });
      if (response.data.success) {
        setRoutesData((prev) =>
          prev.map((i) => (i.user_uuid === data.user_uuid ? data : i))
        );
        onSave();
      }
    } else {
      const response = await axios({
        method: "post",
        url: "/counterGroup/postCounterGroup",
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
          <div style={{ overflowY: "scroll" }}>
            <form className="form" onSubmit={submitHandler}>
              <div className="row">
                <h1>
                  {popupInfo.type === "edit" ? "Edit" : "Add"} Counter Group
                </h1>
              </div>

              <div className="formGroup">
                <div className="row">
                  <label className="selectLabel">
                    Counter Group Title
                    <input
                      type="text"
                      name="route_title"
                      className="numberInput"
                      value={data?.counter_group_title}
                      onChange={(e) =>
                        setdata({
                          ...data,
                          counter_group_title: e.target.value,
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
  const [filterRoute, setFilterRoute] = useState("");
  const [Counters, setCounters] = useState([]);
  const [Routes, setRoutes] = useState([]);

  const [itemGroupings, setItemGroupings] = useState([]);
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
  const getRoutesData = async () => {
    const response = await axios({
      method: "get",
      url: "/routes/GetRouteList",

      headers: {
        "Content-Type": "application/json",
      },
    });
    if (response.data.success) setRoutes(response.data.result);
  };
  useEffect(() => {
    getCounter();
    getRoutesData();
  }, []);
  useEffect(() => {
    if (Counters?.length)
      setItemGroupings(
        Counters.filter(
          (a) =>
            a.counter_group_uuid.filter(
              (b) => b === ItemGroup.counter_group_uuid
            ).length
        )
      );
  }, [Counters, ItemGroup.counter_group_uuid]);
  const searchedItems = useMemo(
    () =>
      Counters.map((a) => ({
        ...a,
        route_title:
          Routes?.find((b) => b?.route_uuid === a?.route_uuid)?.route_title ||
          "",
      }))?.filter(
        (item) =>
          item?.counter_title
            ?.toLowerCase()
            ?.includes(pattern?.toLowerCase()) &&
          item?.route_title?.toLowerCase()?.includes(filterRoute?.toLowerCase())
      ),
    [pattern, Counters, Routes, filterRoute]
  );
  const includesArray = useMemo(
    () =>
      searchedItems?.map((item) => {
        itemGroupings[itemGroupingIndex]?.items?.includes(item.counter_uuid);
      }),
    [searchedItems]
  );

  const handleItemIncludeToggle = (counter_uuid, type) => {
    let data = Counters.find((a) => a.counter_uuid === counter_uuid);
    if (type === "remove") {
      data = toggleRemoveItem(itemGroupings, data);
    } else {
      data = toggleAddItem(itemGroupings, data);
    }
    console.log(data, ItemGroup.counter_group_uuid);

    setItemGroupings(data);
  };
  const toggleRemoveItem = (arr, item) =>
    arr.map((a) =>
      a?.counter_uuid === item.counter_uuid
        ? {
            ...a,
            counter_group_uuid: a.counter_group_uuid.filter((b) => {
              console.log("----", b, ItemGroup.counter_group_uuid);
              return b !== ItemGroup.counter_group_uuid;
            }),
          }
        : a
    );
  const toggleAddItem = (arr, item) =>
    arr?.filter((i) => i?.counter_uuid === item?.counter_uuid)?.length
      ? [
          ...arr?.filter((i) => i !== item).map((a) => ({ ...a, one: true })),
          arr
            ?.filter((i) => i.counter_uuid === item.counter_uuid)
            .map((a) => ({
              ...a,
              one: true,
              counter_group_uuid: item?.counter_group_uuid?.length
                ? [...item.counter_group_uuid, ItemGroup.counter_group_uuid]
                : [ItemGroup.counter_group_uuid],
            }))[0],
        ]
      : arr?.length
      ? [
          ...arr.map((a) => ({ ...a, two: true })),
          {
            ...item,
            two: true,
            counter_group_uuid: item?.counter_group_uuid?.length
              ? [...item.counter_group_uuid, ItemGroup.counter_group_uuid]
              : [ItemGroup.counter_group_uuid],
          },
        ]
      : [
          {
            ...item,
            three: true,
            counter_group_uuid: item.counter_group_uuid?.length
              ? [...item.counter_group_uuid, ItemGroup.counter_group_uuid]
              : [ItemGroup.counter_group_uuid],
          },
        ];
  const submitHandler = async () => {
    const response = await axios({
      method: "put",
      url: "/counters/putCounter",
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
      <h1>Counters</h1>

      <div className="flex" style={{ justifyContent: "space-between" }}>
        <input
          type="text"
          onChange={(e) => setPattern(e.target.value)}
          value={pattern}
          placeholder="Search Category..."
          className="searchInput"
        />{" "}
        <input
          type="text"
          onChange={(e) => setFilterRoute(e.target.value)}
          value={filterRoute}
          placeholder="Search Routes..."
          className="searchInput"
        />
      </div>
      <ItemsTable
        items={searchedItems}
        onItemIncludeToggle={handleItemIncludeToggle}
        includesArray={itemGroupings}
        itemGroup={ItemGroup}
        route={Routes}
        pattern={pattern}
        filterRoute={filterRoute}
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
  route,
  pattern,
  filterRoute,
}) {
  const [filterItemData, setFilterItemData] = useState([]);
  const [includesItem, setIncludesItems] = useState([]);
  const [firstTime, setFirstTime] = useState(true);
  useEffect(() => {
    if (firstTime)
      setFilterItemData(
        items?.sort((a, b) => {
          let aLength = includesArray?.filter(
            (c) =>
              c?.counter_uuid === a?.counter_uuid &&
              c.counter_group_uuid.filter(
                (d) => d === itemGroup.counter_group_uuid
              ).length
          )?.length;

          let bLength = includesArray?.filter(
            (c) =>
              c?.counter_uuid === b?.counter_uuid &&
              c.counter_group_uuid.filter(
                (d) => d === itemGroup.counter_group_uuid
              ).length
          )?.length;
          console.log(
            includesArray?.filter(
              (c) =>
                c?.counter_uuid === a?.counter_uuid &&
                c.counter_group_uuid.filter(
                  (d) => d === itemGroup.counter_group_uuid
                ).length
            )?.length,
            a
          );
          if (aLength && bLength) {
            return a.counter_title.localeCompare(b.counter_title);
          } else if (aLength) {
            return -1;
          } else if (bLength) {
            return 1;
          } else {
            return a.counter_title.localeCompare(b.counter_title);
          }
        })
      );
    setTimeout(() => {
      if(items.length)
      setFirstTime(false);
    }, 1000);
  }, [
    items,
    pattern,
    filterRoute,
    includesArray,
    itemGroup.counter_group_uuid,
    firstTime,
  ]);
  useEffect(() => {
    setIncludesItems(includesArray);
  }, [includesArray]);
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
            <th className="description" style={{ width: "25%" }}>
              Counter
            </th>
            <th className="description" style={{ width: "25%" }}>
              Route
            </th>

            <th style={{ width: "25%" }}>Action</th>
          </tr>
        </thead>

        <tbody>
          {filterItemData
            ?.filter((a) => a.counter_uuid)

            .map((item, index) => {
              return (
                <tr key={item.counter_uuid}>
                  <td>{item.counter_title}</td>
                  <td>{item?.route_title}</td>
                  <td>
                    <button
                      type="button"
                      className="noBgActionButton"
                      style={{
                        backgroundColor: includesItem?.filter(
                          (a) =>
                            a?.counter_uuid === item?.counter_uuid &&
                            a.counter_group_uuid.filter(
                              (a) => a === itemGroup.counter_group_uuid
                            ).length
                        )?.length
                          ? "red"
                          : "var(--mainColor)",
                        width: "150px",
                        fontSize: "large",
                      }}
                      onClick={(event) =>
                        onItemIncludeToggle(
                          item.counter_uuid,
                          includesItem?.filter(
                            (a) =>
                              a?.counter_uuid === item?.counter_uuid &&
                              a.counter_group_uuid.filter(
                                (a) => a === itemGroup.counter_group_uuid
                              ).length
                          )?.length
                            ? "remove"
                            : "add"
                        )
                      }
                    >
                      {includesItem?.filter(
                        (a) =>
                          a?.counter_uuid === item?.counter_uuid &&
                          a.counter_group_uuid.filter(
                            (a) => a === itemGroup.counter_group_uuid
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
function DeleteCounterPopup({ onSave, popupInfo, getCounterGroup }) {
  const [errMassage, setErrorMassage] = useState("");
  const [loading, setLoading] = useState(false);

  const submitHandler = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await axios({
        method: "delete",
        url: "/counterGroup/deleteCounterGroup",
        data: { counter_group_uuid: popupInfo.counter_group_uuid },
        headers: {
          "Content-Type": "application/json",
        },
      });
      if (response.data.success) {
        getCounterGroup();
        onSave();
      }
    } catch (err) {
      console.log(err);
      // setErrorMassage("Order already exist");
    }
    setLoading(false);
  };

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
                <h1>Delete Counter Group</h1>
              </div>
              <div className="row">
                <h1>{popupInfo.counter_group_title}</h1>
              </div>

              <i style={{ color: "red" }}>
                {errMassage === "" ? "" : "Error: " + errMassage}
              </i>
              <div className="flex" style={{ justifyContent: "space-between" }}>
                {loading ? (
                  <button
                    className="submit"
                    id="loading-screen"
                    style={{ background: "red", width: "120px" }}
                  >
                    <svg viewBox="0 0 100 100">
                      <path
                        d="M10 50A40 40 0 0 0 90 50A40 44.8 0 0 1 10 50"
                        fill="#ffffff"
                        stroke="none"
                      >
                        <animateTransform
                          attributeName="transform"
                          type="rotate"
                          dur="1s"
                          repeatCount="indefinite"
                          keyTimes="0;1"
                          values="0 50 51;360 50 51"
                        ></animateTransform>
                      </path>
                    </svg>
                  </button>
                ) : (
                  <button
                    type="submit"
                    className="submit"
                    style={{ background: "red" }}
                  >
                    Confirm
                  </button>
                )}
                <button type="button" className="submit" onClick={onSave}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
