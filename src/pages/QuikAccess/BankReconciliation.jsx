import React, { useState, useEffect, useMemo, useContext } from "react";
import axios from "axios";
import { ChevronUpIcon, ChevronDownIcon } from "@heroicons/react/solid";
import { Check, ExitToApp, UploadFile } from "@mui/icons-material";
import Select from "react-select";
import { v4 as uuid } from "uuid";
import Header from "../../components/Header";
import Sidebar from "../../components/Sidebar";
import context from "../../context/context";
import * as XLSX from "xlsx";
import { FaCross } from "react-icons/fa";

const BankReconciliation = () => {
  const [ledgerData, setLedgerData] = useState([]);
  const [ledgerGroup, setLedgerGroup] = useState([]);

  const [popupForm, setPopupForm] = useState(false);
  const [filterTitle, setFilterTitle] = useState("");

  const { setNotification } = useContext(context);

  const getLedgerData = async (controller = new AbortController()) => {
    const response = await axios({
      method: "get",
      url: "/ledger/getBankLedger",
      signal: controller.signal,
      headers: {
        "Content-Type": "application/json",
      },
    });
    if (response.data.success) setLedgerData(response.data.result);
  };
  const getLedgerGroup = async (controller = new AbortController()) => {
    const response = await axios({
      method: "get",
      url: "/ledgerGroup/getLedgerGroup",
      signal: controller.signal,
      headers: {
        "Content-Type": "application/json",
      },
    });
    if (response.data.success) setLedgerGroup(response.data.result);
  };

  useEffect(() => {
    const controller = new AbortController();
    getLedgerData(controller);
    getLedgerGroup(controller);
    return () => {
      controller.abort();
    };
  }, [popupForm]);
  const filterLedgerData = useMemo(
    () =>
      ledgerData
        .map((a) => ({
          ...a,
          ledger_group_title: ledgerGroup.find(
            (b) => b.ledger_group_uuid === a.ledger_group_uuid
          )?.ledger_group_title,
        }))
        .filter(
          (a) =>
            a.ledger_title &&
            (!filterTitle ||
              a.ledger_title
                .toLocaleLowerCase()
                .includes(filterTitle.toLocaleLowerCase()))
        ),
    [filterTitle, ledgerData, ledgerGroup]
  );

  useEffect(() => {
    const controller = new AbortController();

    return () => {
      controller.abort(controller);
    };
  }, []);

  return (
    <>
      <Sidebar />
      <Header />
      <div className="item-sales-container orders-report-container">
        <div id="heading" style={{ position: "relative" }}>
          <h2>Ledger</h2>
          <span
            style={{
              position: "absolute",
              right: "30px",
              top: "50%",
              translate: "0 -50%",
            }}
          >
            Total Ledger: {filterLedgerData.length}
          </span>
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
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <input
                type="text"
                onChange={(e) => setFilterTitle(e.target.value)}
                value={filterTitle}
                placeholder="Search Ledger Title..."
                className="searchInput"
              />
            </div>
          </div>
        </div>
        <div className="table-container-user item-sales-container">
          <Table itemsDetails={filterLedgerData} setPopupForm={setPopupForm} />
        </div>
      </div>

      {popupForm ? (
        <ImportStatements
          onSave={() => {
            setPopupForm(false);
            getLedgerData();
          }}
          setLedgerData={setLedgerData}
          popupInfo={popupForm}
          setNotification={setNotification}
        />
      ) : (
        ""
      )}
    </>
  );
};

export default BankReconciliation;
function Table({ itemsDetails, setPopupForm }) {
  const [items, setItems] = useState("sort_order");
  const [order, setOrder] = useState("");
  return (
    <>
      <div
        style={{ maxWidth: "100vw", height: "fit-content", overflowX: "auto" }}
      >
        <table className="user-table" style={{ tableLayout: "auto" }}>
          <thead>
            <tr>
              <th>S.N</th>

              <th>
                <div className="t-head-element">
                  <span>Ledger Title</span>
                  <div className="sort-buttons-container">
                    <button
                      onClick={() => {
                        setItems("ledger_title");
                        setOrder("asc");
                      }}
                    >
                      <ChevronUpIcon className="sort-up sort-button" />
                    </button>
                    <button
                      onClick={() => {
                        setItems("ledger_title");
                        setOrder("desc");
                      }}
                    >
                      <ChevronDownIcon className="sort-down sort-button" />
                    </button>
                  </div>
                </div>
              </th>
              <th>
                <div className="t-head-element">
                  <span>Ledger Group Title</span>
                  <div className="sort-buttons-container">
                    <button
                      onClick={() => {
                        setItems("ledger_group_title");
                        setOrder("asc");
                      }}
                    >
                      <ChevronUpIcon className="sort-up sort-button" />
                    </button>
                    <button
                      onClick={() => {
                        setItems("ledger_group_title");
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
              ?.map((item, i) => (
                <tr
                  key={Math.random()}
                  style={{ height: "30px" }}
                  onClick={(e) => {
                    e.stopPropagation();
                    setPopupForm(item);
                  }}
                >
                  <td>{i + 1}</td>

                  <td>{item.ledger_title}</td>
                  <td>{item.ledger_group_title}</td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

function ImportStatements({ onSave, popupInfo, setNotification }) {
  const [errMassage, setErrorMassage] = useState("");
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(null);
  const [extraItems, setExtraItems] = useState([]);
  const [ledgerData, setLedgerData] = useState([]);
  const [changeTransition, setChangeTransition] = useState(null);
  const [counter, setCounter] = useState([]);
  const getCounter = async (controller = new AbortController()) => {
    const response = await axios({
      method: "post",
      url: "/counters/GetCounterList",
      signal: controller.signal,
      data: { counters: [] },
      headers: {
        "Content-Type": "application/json",
      },
    });
    if (response.data.success) setCounter(response.data.result);
  };
  const getLedgerData = async (controller = new AbortController()) => {
    const response = await axios({
      method: "get",
      url: "/ledger/getLedger",
      signal: controller.signal,
      headers: {
        "Content-Type": "application/json",
      },
    });
    if (response.data.success) setLedgerData(response.data.result);
  };
  useEffect(() => {
    const controller = new AbortController();
    getLedgerData(controller);
    getCounter(controller);
    return () => {
      controller.abort();
    };
  }, []);
  const counterList = useMemo(
    () =>
      [...counter, ...ledgerData].map((a) => ({
        label: a.counter_title || a.ledger_title,
        value: a.counter_uuid || a.ledger_uuid,
        closing_balance: a.closing_balance,
      })),
    [counter, ledgerData]
  );
  const createImportedVouchers = async (e) => {
    e.preventDefault();
    let dataArray = data.data
      .filter(
        (item) =>
          !item.unMatch ||
          extraItems.find((a) => a.reference_no === item.reference_no)
      )
      .map((a) => ({
        ...a,
        counter_uuid: a.counter_uuid || a.ledger_uuid,
        ...(extraItems.find((b) => b.reference_no === a.reference_no) || {}),
      }));
    console.log(dataArray);
    let array = [];
    let time = new Date();
    for (let item of dataArray) {
      array.push({
        voucher_uuid: uuid(),
        type:
          item.ledger_group_uuid === "9c2a6c85-c0f0-4acf-957e-dcea223f3d00" ||
          item.counter_uuid
            ? "RCPT"
            : item.ledger_group_uuid === "004fd020-853c-4575-bebe-b29faefae3c9"
            ? "PAYMENT"
            : item.ledger_group_uuid ===
                "8550248f-41e9-4f5f-aea0-927b12a7146c" ||
              item.ledger_group_uuid === "0c0c8cbd-1a2a-4adc-9b65-d5c807f275c7"
            ? "CNTR"
            : "",
        created_by: localStorage.getItem("user_uuid"),
        created_at: time.getTime(),
        amt: item.paid_amount || item.received_amount,
        details: [
          {
            ledger_uuid: popupInfo.ledger_uuid,
            amount: item.paid_amount || -item.received_amount,
          },
          {
            ledger_uuid: item.counter_uuid,
            amount: -item.paid_amount || +item.received_amount,
          },
        ],
        voucher_date: item.date,
      });
    }

    const response = await axios({
      method: "post",
      url: "/vouchers/postAccountVouchers",
      data: array,
      headers: {
        "Content-Type": "application/json",
      },
    });
    if (response.data.success) {
      setNotification({
        message: "Voucher Imported Successfully",
        success: true,
      });
      setTimeout(() => {
        setNotification(null);
      }, 5000);
      onSave();
    } else {
      setNotification({
        message: "Voucher Not imported",
        success: false,
      });
    }
    setTimeout(() => {
      setNotification(null);
    }, 5000);
  };

  const submitHandler = async (data) => {
    setLoading(true);
    const response = await axios({
      method: "post",
      url: "/ledger/getExcelDetailsData",
      headers: {
        "Content-Type": "application/json",
      },
      data: {
        array: data,
        ledger_uuid: popupInfo.ledger_uuid,
      },
    });
    if (response.data.success) {
      setData(response.data.result);

      setLoading(false);
    } else {
      setErrorMassage(response.data.message);
    }
  };
  const handleFileChange = (event) => {
    const file = event.target.files[0];
    const reader = new FileReader();

    reader.onload = (e) => {
      const data = e.target.result;
      const workbook = XLSX.read(data, { type: "binary" });
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      const excelData = XLSX.utils.sheet_to_json(sheet, { header: 1 });
      submitHandler(excelData);
    };

    reader.readAsBinaryString(file);
  };
  const filterOption = (data, value) => {
    let label = data.data.label;
    if (label.toLowerCase().includes(value.toLowerCase())) return true;
    return false;
  };
  const updateTransitionTags = async (e) => {
    e.preventDefault();
    let isCounter = counterList.find(
      (a) => a.value === changeTransition.counter_uuid
    );
    const response = await axios({
      method: "post",
      url: "/ledger/updateTransactionTags",
      headers: {
        "Content-Type": "application/json",
      },
      data: {
        ...(isCounter
          ? { counter_uuid: changeTransition.counter_uuid }
          : { ledger_uuid: changeTransition.counter_uuid }),
        transaction_tags: changeTransition.tags
          .filter((a) => a.checked)
          .map((a) => a.tag),
      },
    });
    if (response.data.success) {
      setNotification({
        message: "Transition Tags Updated Successfully",
        success: true,
      });

      setChangeTransition(null);
    } else {
      setNotification({
        message: "Transition Tags Not Updated",
        success: false,
      });
    }
  };
  const counterOptions = (option) => (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
      }}
    >
      <span>{option.label}</span>
      <span>{option.closing_balance}</span>
    </div>
  );
  return (
    <div className="overlay">
      {changeTransition ? (
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
              <form
                className="form"
                onSubmit={updateTransitionTags}
                style={{
                  justifyContent: "start",
                }}
              >
                <div className="row">
                  <h1>
                    Transition Tags for{" "}
                    {counterList.find?.(
                      (a) => a.value === changeTransition.counter_uuid
                    )?.label || ""}
                  </h1>
                </div>
                <table className="user-table" style={{ tableLayout: "auto" }}>
                  <thead>
                    <tr>
                      <th>Sr.</th>
                      <th>Tag</th>

                      <th></th>
                    </tr>
                  </thead>
                  <tbody className="tbody">
                    {changeTransition.tags?.map((item, i) => (
                      <tr
                        key={Math.random()}
                        style={{
                          height: "30px",
                        }}
                      >
                        <td>{item.sr}</td>
                        <td>{item.tag}</td>

                        <td>
                          <input
                            type="checkbox"
                            checked={item.checked}
                            onChange={(e) => {
                              setChangeTransition((prev) => ({
                                ...prev,
                                tags: prev.tags.map((a, j) =>
                                  j === i
                                    ? { ...a, checked: e.target.checked }
                                    : a
                                ),
                              }));
                            }}
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                <i style={{ color: "red" }}>
                  {errMassage === "" ? "" : "Error: " + errMassage}
                </i>
                <div
                  className="flex"
                  style={{ justifyContent: "space-between", minWidth: "300px" }}
                >
                  <button
                    className="submit"
                    style={{ background: "red" }}
                    onClick={() => {
                      setChangeTransition(null);
                    }}
                  >
                    Cancel
                  </button>

                  <button className="submit">Update</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      ) : (
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
              <form
                className="form"
                onSubmit={submitHandler}
                style={{
                  height: data ? "90vh" : "20vh",
                  justifyContent: "start",
                }}
              >
                {data ? (
                  <>
                    <div className="row" style={{ width: "90vw" }}>
                      <h5>Total Recodes:{data?.total_recode || 0}</h5>
                      <h5>Matched Recodes:{data?.matched_recode || 0}</h5>
                      <h5>Unmatched Recodes:{data?.unmatched_recode || 0}</h5>
                      <h5>Total Amount Paid:{data?.total_paid_amount || 0}</h5>
                      <h5>
                        Total Amount Received:{data?.total_received_amount || 0}
                      </h5>
                    </div>
                    <table
                      className="user-table"
                      style={{ tableLayout: "auto" }}
                    >
                      <thead>
                        <tr>
                          <th>Sr.</th>
                          <th>Reference No.</th>
                          <th>Counter Matches</th>
                          <th>Route</th>
                          <th>Paid Amt</th>
                          <th>Received Amt</th>
                          <th></th>
                        </tr>
                      </thead>
                      <tbody className="tbody">
                        {data?.data?.map((item, i) => (
                          <tr
                            key={Math.random()}
                            style={{
                              height: "30px",
                              color:
                                !item.unMatch ||
                                extraItems.find(
                                  (a) => a.reference_no === item.reference_no
                                )
                                  ? "green"
                                  : "red",
                            }}
                          >
                            <td>{item.sr}</td>
                            <td>{item.reference_no || "Un Matched"}</td>
                            {item.counter_uuid ? (
                              <td>{item.counter_title}</td>
                            ) : (
                              <Select
                                options={counterList}
                                getOptionLabel={counterOptions}
                                filterOption={filterOption}
                                onChange={(doc) => {
                                  setChangeTransition({
                                    counter_uuid: doc.value,
                                    tags: item.transaction_tags?.map((a) => ({
                                      checked: false,
                                      tag: a,
                                    })),
                                  });
                                  setExtraItems((prev) =>
                                    prev.find((a) => a.sr === item.sr)
                                      ? prev.map((a) =>
                                          a.sr === item.sr
                                            ? {
                                                counter_uuid: doc.value,
                                              }
                                            : a
                                        )
                                      : [
                                          ...prev,
                                          { ...item, counter_uuid: doc.value },
                                        ]
                                  );
                                }}
                                value={
                                  extraItems.find((a) => a.sr === item.sr)
                                    ? counterList.find(
                                        (a) =>
                                          a.value ===
                                          extraItems.find(
                                            (b) => b.sr === item.sr
                                          ).counter_uuid
                                      )
                                    : {
                                        label: "Select Counter",
                                        value: "",
                                      }
                                }
                                openMenuOnFocus={true}
                                menuPosition="fixed"
                                menuPlacement="auto"
                                placeholder="Select"
                              />
                            )}

                            <td>{item.route_title}</td>
                            <td>{item.paid_amount || ""}</td>
                            <td>{item.received_amount || ""}</td>
                            {item.unMatch && item.reference_no ? (
                              extraItems.find(
                                (a) => a.reference_no === item.reference_no
                              ) ? (
                                <td
                                  style={{
                                    cursor: "pointer",
                                    color: "red",
                                    fontSize: "20px",
                                    fontWeight: "bolder",
                                    width: "50px",
                                    height: "50px",
                                  }}
                                  onClick={() => {
                                    setExtraItems((prev) =>
                                      prev.filter(
                                        (a) =>
                                          a.reference_no !== item.reference_no
                                      )
                                    );
                                  }}
                                >
                                  X
                                </td>
                              ) : (
                                <td
                                  style={{
                                    cursor: "pointer",
                                    color: "green",
                                    width: "50px",
                                    height: "50px",
                                  }}
                                  onClick={() => {
                                    setExtraItems((prev) => [...prev, item]);
                                  }}
                                >
                                  <Check />
                                </td>
                              )
                            ) : (
                              <td
                                style={{
                                  cursor: "pointer",
                                  color: "red",
                                  fontSize: "20px",
                                  fontWeight: "bolder",
                                  width: "50px",
                                  height: "50px",
                                }}
                              ></td>
                            )}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </>
                ) : (
                  ""
                )}
                {data ? (
                  ""
                ) : (
                  <div className="row">
                    <h1>Import File</h1>
                  </div>
                )}
                <i style={{ color: "red" }}>
                  {errMassage === "" ? "" : "Error: " + errMassage}
                </i>
                <div
                  className="flex"
                  style={{ justifyContent: "space-between", minWidth: "300px" }}
                >
                  <button
                    className="submit"
                    style={{ background: "red" }}
                    onClick={() => {
                      onSave();
                    }}
                  >
                    Cancel{data ? " Import" : ""}
                  </button>
                  {loading ? (
                    <button
                      className="submit"
                      id="loading-screen"
                      style={{ width: "120px" }}
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
                  ) : data ? (
                    <button className="submit" onClick={createImportedVouchers}>
                      Import Matched
                    </button>
                  ) : (
                    <label
                      htmlFor="file"
                      type="button"
                      className="submit"
                      style={{
                        background: "green",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <UploadFile className="icon" />
                      Upload
                      <input
                        type="file"
                        accept=".xls, .xlsx"
                        id="file"
                        onChange={handleFileChange}
                        style={{ display: "none" }}
                      />
                    </label>
                  )}
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
