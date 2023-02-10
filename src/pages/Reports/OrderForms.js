import React, { useState, useEffect, useMemo } from "react";
import Header from "../../components/Header";
import Sidebar from "../../components/Sidebar";
import { ChevronUpIcon, ChevronDownIcon } from "@heroicons/react/solid";
import { DeleteOutline } from "@mui/icons-material";
import axios from "axios";
const OrderForms = () => {
  const [itemsData, setItemsData] = useState([]);

  const [companies, setCompanies] = useState([]);
  const [popupForm, setPopupForm] = useState(false);
  const [counterPopup, setCounterPopup] = useState(false);
  const [deletePopup, setDeletePopup] = useState(false);
  const [filterTitle, setFilterTitle] = useState("");

  const getItemsData = async (controller = new AbortController()) => {
    const response = await axios({
      method: "get",
      url: "/orderForm/GetFormList",
      signal: controller.signal,
      headers: {
        "Content-Type": "application/json",
      },
    });
    if (response.data.success) setItemsData(response.data.result);
  };
  useEffect(() => {
    const controller = new AbortController();
    getItemsData(controller);
    return () => {
      controller.abort();
    };
  }, [popupForm]);
  const filterItemsData = useMemo(
    () =>
      itemsData.filter(
        (a) =>
          !filterTitle ||
          (a.form_title || "")
            .toLocaleLowerCase()
            .includes(filterTitle.toLocaleLowerCase())
      ) || [],
    [filterTitle, itemsData]
  );

  const getCompanies = async (controller = new AbortController()) => {
    const response = await axios({
      method: "get",
      url: "/companies/getCompanies",
      signal: controller.signal,
      headers: {
        "Content-Type": "application/json",
      },
    });
    if (response.data.success) setCompanies(response.data.result);
  };
  useEffect(() => {
    const controller = new AbortController();
    getCompanies(controller);

    return () => {
      controller.abort(controller);
    };
  }, []);
  return (
    <>
      <Sidebar />
      <Header />
      <div className="item-sales-container orders-report-container">
        <div id="heading">
          <h2>Order Forms</h2>
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
              placeholder="Search Form Title..."
              className="searchInput"
            />

            <div>Total Form: {filterItemsData.length}</div>

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
            itemsDetails={filterItemsData}
            companies={companies}
            setPopupForm={setPopupForm}
            setDeletePopup={setDeletePopup}
            setCounterPopup={setCounterPopup}
          />
        </div>
      </div>
      {popupForm ? (
        <NewUserForm
          onSave={() => setPopupForm(false)}
          setItemsData={setItemsData}
          companies={companies}
          popupInfo={popupForm}
          items={itemsData}
        />
      ) : (
        ""
      )}
      {counterPopup ? (
        <CounterTable
          onSave={() => setCounterPopup(false)}
          form_uuid={counterPopup}
        />
      ) : (
        ""
      )}
      {deletePopup ? (
        <DeleteItemPopup
          onSave={() => setDeletePopup(false)}
          setItemsData={setItemsData}
          popupInfo={deletePopup}
        />
      ) : (
        ""
      )}
    </>
  );
};

export default OrderForms;
function Table({
  itemsDetails,
  setPopupForm,
  setDeletePopup,
  setCounterPopup,
}) {
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

          <th colSpan={3}>
            <div className="t-head-element">
              <span>Form Title</span>
              <div className="sort-buttons-container">
                <button
                  onClick={() => {
                    setItems("form_title");
                    setOrder("asc");
                  }}
                >
                  <ChevronUpIcon className="sort-up sort-button" />
                </button>
                <button
                  onClick={() => {
                    setItems("form_title");
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
          .map((a) => ({ ...a, item_discount: +a.item_discount || 0 }))
          .sort((a, b) =>
            order === "asc"
              ? typeof a[items] === "string"
                ? a[items]?.localeCompare(b[items])
                : a[items] - b[items]
              : typeof a[items] === "string"
              ? b[items]?.localeCompare(a[items])
              : b[items] - a[items]
          )
          ?.map((item, i) => (
            <tr
              key={Math.random()}
              style={{ height: "30px" }}
              onClick={() => setPopupForm({ type: "edit", data: item })}
            >
              <td>{i + 1}</td>

              <td colSpan={3}>{item.form_title}</td>

              <td
                colSpan={1}
                onClick={(e) => {
                  e.stopPropagation();

                  setDeletePopup(item);
                }}
              >
                <DeleteOutline />
              </td>
              <td>
                <button
                  className="item-sales-search"
                  onClick={(e) => {
                    e.stopPropagation();
                    setCounterPopup(item.form_uuid);
                  }}
                >
                  Counters
                </button>
              </td>
            </tr>
          ))}
      </tbody>
    </table>
  );
}
function NewUserForm({
  onSave,
  popupInfo,
  setItemsData,
  companies,

  items,
}) {
  const [data, setdata] = useState({});

  const [errMassage, setErrorMassage] = useState("");
  console.log(data);
  useEffect(() => {
    if (popupInfo?.type === "edit") setdata(popupInfo.data);
  }, [popupInfo.data, popupInfo?.type]);

  const submitHandler = async (e) => {
    e.preventDefault();

    if (!data.form_title) {
      setErrorMassage("Please insert Item Title");
      return;
    }

    if (popupInfo?.type === "edit") {
      const response = await axios({
        method: "put",
        url: "/orderForm/putForm",
        data: [data],
        headers: {
          "Content-Type": "application/json",
        },
      });
      if (response.data.result[0].success) {
        setItemsData((prev) =>
          prev.map((i) => (i.user_uuid === data.user_uuid ? data : i))
        );
        onSave();
      }
    } else {
      if (
        data?.item_code &&
        items.find((a) => a.item_code === data.item_code)
      ) {
        setErrorMassage("Please insert Different Item Code");
        return;
      }
      const response = await axios({
        method: "post",
        url: "/orderForm/postForm",
        data,
        headers: {
          "Content-Type": "application/json",
        },
      });
      if (response.data.success) {
        setItemsData((prev) => [...prev, data]);
        onSave();
      }
    }
  };
  const onItemIncludeToggle = (company_uuid, action) => {
      console.log(company_uuid,action)
    if (action === "add") {
      setdata((prev) => ({
        ...prev,
        company_uuid: [...(prev.company_uuid || []), company_uuid],
      }));
    } else {
      setdata((prev) => ({
        ...prev,
        company_uuid: (prev.company_uuid || []).filter(
          (a) => a !== company_uuid
        ),
      }));
    }
  };
  return (
    <div className="overlay" style={{ zIndex: 9999999 }}>
      <div
        className="modal"
        style={{
          height: "max-content",
          width: "fit-content",
          maxHeight: "90vh",
        }}
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
                <h1>{popupInfo.type === "edit" ? "Edit" : "Add"} Form</h1>
              </div>

              <div className="formGroup">
                <div className="row">
                  <label className="selectLabel">
                    Form Title
                    <input
                      type="text"
                      name="route_title"
                      className="numberInput"
                      value={data?.form_title}
                      onChange={(e) =>
                        setdata({
                          ...data,
                          form_title: e.target.value,
                        })
                      }
                      maxLength={60}
                    />
                  </label>
                </div>

                <div className="row">
                  <ItemsTable
                    items={companies}
                    includesArray={data.company_uuid}
                    onItemIncludeToggle={onItemIncludeToggle}
                  />
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
function DeleteItemPopup({ onSave, popupInfo, setItemsData }) {
  const [errMassage, setErrorMassage] = useState("");
  const [loading, setLoading] = useState(false);

  const submitHandler = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await axios({
        method: "delete",
        url: "/orderForm/deleteForm",
        data: { form_uuid: popupInfo.form_uuid },
        headers: {
          "Content-Type": "application/json",
        },
      });
      if (response.data.success) {
        setItemsData((prev) =>
          prev.filter((i) => i.form_uuid !== popupInfo.form_uuid)
        );
        onSave();
      }
    } catch (err) {
      console.log(err);
      setErrorMassage("Order already exist");
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
                <h1>Delete Items</h1>
              </div>
              <div className="row">
                <h1>{popupInfo.form_title}</h1>
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

function ItemsTable({ items, includesArray, onItemIncludeToggle }) {
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
              Company
            </th>

            <th style={{ width: "25%" }}>Action</th>
          </tr>
        </thead>

        <tbody>
          {items
            ?.filter((a) => a.company_uuid)
            .map((item, index) => {
              return (
                <tr key={item.company_uuid}>
                  <td>{index + 1}</td>

                  <td>{item?.company_title}</td>

                  <td>
                    <button
                      type="button"
                      className="noBgActionButton"
                      style={{
                        backgroundColor: includesArray?.filter(
                          (a) => a === item?.company_uuid
                        )?.length
                          ? "red"
                          : "var(--mainColor)",
                        width: "150px",
                        fontSize: "large",
                      }}
                      onClick={(event) =>
                        onItemIncludeToggle(
                          item.company_uuid,
                          includesArray?.filter((a) => a === item?.company_uuid)
                            ?.length
                            ? "remove"
                            : "add"
                        )
                      }
                    >
                      {includesArray?.filter((a) => a === item?.company_uuid)
                        ?.length
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
function CounterTable({ form_uuid, onSave }) {
  const [counter, setCounter] = useState([]);
  const [filterCounterTitle, setFilterCounterTitle] = useState("");
  const getCounter = async (controller = new AbortController()) => {
    const response = await axios({
      method: "post",
      url: "/counters/GetCounterData",
      signal: controller.signal,
      data: ["counter_uuid", "counter_title", "form_uuid"],
      headers: {
        "Content-Type": "application/json",
      },
    });
    if (response.data.success) {
      setCounter(
        response.data.result.sort((a, b) =>
          (a.form_uuid === b.form_uuid) === form_uuid
            ? 0
            : a.form_uuid === form_uuid
            ? -1
            : 1
        )
      );
    }
  };
  useEffect(() => {
    let controller = new AbortController();
    getCounter(controller);
    return () => {
      controller.abort();
    };
  }, []);
  const submitHandler = async () => {
    const response = await axios({
      method: "put",
      url: "/counters/putCounter",
      data: counter.filter((a) => a.edit),
      headers: {
        "Content-Type": "application/json",
      },
    });
    if (response.data.success) {
      onSave();
    }
  };
  const filterCounter = useMemo(
    () =>
      counter?.filter(
        (a) =>
          a.counter_uuid &&
          (!filterCounterTitle ||
            a.counter_title
              ?.toLocaleLowerCase()
              ?.includes(filterCounterTitle?.toLocaleLowerCase()))
      ),
    [counter, filterCounterTitle]
  );
  return (
    <div className="overlay" style={{ zIndex: 9999999 }}>
      <div
        className="modal"
        style={{
          height: "max-content",
          width: "fit-content",
          maxHeight: "90vh",
        }}
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
                <h1>Counters</h1>
              </div>
              <div className="formGroup">
                <input
                  type="text"
                  onChange={(e) => setFilterCounterTitle(e.target.value)}
                  value={filterCounterTitle}
                  placeholder="Search Counter Title..."
                  className="searchInput"
                />
                <div className="row">
                  <div
                    style={{
                      overflowY: "scroll",
                      height: "45vh",
                      minWidth: "600px",
                    }}
                  >
                    <table className="table">
                      <thead>
                        <tr>
                          <th className="description" style={{ width: "10%" }}>
                            S.r
                          </th>

                          <th className="description" style={{ width: "25%" }}>
                            Counter
                          </th>

                          <th style={{ width: "25%" }}>Action</th>
                        </tr>
                      </thead>

                      <tbody>
                        {filterCounter.map((item, index) => {
                          return (
                            <tr key={item.counter_uuid}>
                              <td>{index + 1}</td>

                              <td>{item?.counter_title}</td>

                              <td>
                                <button
                                  type="button"
                                  className="noBgActionButton"
                                  style={{
                                    backgroundColor:
                                      item.form_uuid === form_uuid
                                        ? "red"
                                        : "var(--mainColor)",
                                    width: "150px",
                                    fontSize: "large",
                                  }}
                                  onClick={(event) =>
                                    setCounter((prev) =>
                                      prev.map((a) =>
                                        a.counter_uuid === item.counter_uuid
                                          ? {
                                              ...a,
                                              form_uuid:
                                                a.form_uuid === form_uuid
                                                  ? ""
                                                  : form_uuid,
                                              edit: true,
                                            }
                                          : a
                                      )
                                    )
                                  }
                                >
                                  {item.form_uuid === form_uuid
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
