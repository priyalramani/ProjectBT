import axios from "axios";
import React, { useMemo } from "react";

const CheckAccountingBalance = ({ onSave, itemsData }) => {
  const items = useMemo(() => itemsData, [itemsData]);
  const fixAll = async () => {
    const response = await axios({
      method: "put",
      url: "/ledger/fixeBalance",
      data: itemsData,
      headers: {
        "Content-Type": "application/json",
      },
    });
    console.log({ response });
    if (response.data.success) {
      onSave();
    }
  };
  return (
    <div className="overlay" style={{ zIndex: 99999999999 }}>
      <div
        className="modal"
        style={{
          height: "fit-content",
          width: "max-content",
          minWidth: "250px",
        }}
      >
        <div className="row">
          <h1>Accounting Balance</h1>
          <button
            type="button"
            onClick={fixAll}
            className="submit"
            style={{ width: "300px", marginRight: "100px" }}
          >
            Fix All
          </button>
        </div>

        <div
          className="content"
          style={{
            height: "fit-content",
            padding: "20px",
            width: "fit-content",
          }}
        >
          <div style={{ overflowY: "scroll", width: "100%" }}>
            {items.length ? (
              <div
                className="flex"
                style={{ flexDirection: "column", width: "100%" }}
              >
                <table
                  className="user-table"
                  style={{
                    width: "100%",
                    height: "fit-content",
                  }}
                >
                  <thead>
                    <tr>
                      <th colSpan={3}>
                        <div className="t-head-element">Title</div>
                      </th>
                      <th colSpan={2}>
                        <div className="t-head-element">Opening Balance</div>
                      </th>
                      <th colSpan={2}>
                        <div className="t-head-element">Closing Balance</div>
                      </th>
                      <th colSpan={2}>
                        <div className="t-head-element">
                          Accounting Voucher Balance
                        </div>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="tbody">
                    {items?.map((item, i) => (
                      <tr
                        key={
                          item?.ledger_uuid ||
                          item.counter_uuid ||
                          Math.random()
                        }
                        style={{
                          height: "30px",
                        }}
                      >
                        <td colSpan={3}>{item.title}</td>
                        <td colSpan={2}>{item.opening_balance}</td>
                        <td colSpan={2}>{item.closing_balance}</td>
                        <td colSpan={2}>{item.amount}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div
                className="flex"
                style={{ flexDirection: "column", width: "100%" }}
              >
                <i>No Data</i>
              </div>
            )}
          </div>
          <button onClick={onSave} className="closeButton">
            x
          </button>
        </div>
      </div>
    </div>
  );
};

export default CheckAccountingBalance;
