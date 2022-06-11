import React from "react";

const OrderPrint = ({ counter, order, date, user, itemData, item_details }) => {
    return (
      <>
        <table style={{ borderBottom: "1px solid black", width: "100%" }}>
          <tr>
            <td
              colSpan={2}
              style={{ textAlign: "center", fontSize: "small", width: "100%" }}
            >
              <b>GST INVOICE</b>
            </td>
          </tr>
          <tr>
            <td style={{ width: "50%" }}>
              <table>
                <tr>
                  <td
                    style={{
                      fontSize: "larger",
                      fontWeight: "bold",
                    }}
                  >
                    Bharat Traders
                  </td>
                </tr>
                <tr>
                  <td style={{ fontSize: "x-small" }}>
                    Ganesh Nagar, Near Sharda Convent School,
                    <br /> Ganesh Nagar, Gondia - 441601
                  </td>
                </tr>
                <tr>
                  <td style={{ fontSize: "x-small" }}>Phone: 9422551074</td>
                </tr>
                <tr>
                  <td style={{ fontSize: "x-small" }}>
                    Email: bharattradersgondia96@gmail.com
                  </td>
                </tr>
                <tr>
                  <td style={{ fontSize: "x-small" }}>GSTIN: 27ABIPR1186M1Z2</td>
                </tr>
              </table>
            </td>
            <td>
              <table>
                <tr>
                  <td style={{ fontSize: "x-small" }}>
                    M/S {counter?.counter_title || ""}
                  </td>
                </tr>
                <tr>
                  <td style={{ fontSize: "x-small" }}>
                    {counter?.address || ""}
                  </td>
                </tr>
  
                <tr>
                  <td style={{ fontSize: "x-small" }}>
                    {counter?.mobile.map((a, i) => (i === 0 ? a : ", " + a)) ||
                      ""}
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
        <table style={{ borderBottom: "1px solid black", width: "100%" }}>
          <tr>
            <td style={{ fontSize: "x-small" }}>
              Invoice: {order.invoice_number}
            </td>
            <td style={{ fontSize: "x-small" }}>
              Date:{" "}
              {"dd/mm/yy"
                .replace(
                  "mm",
                  ("00" + (date?.getMonth() + 1).toString()).slice(-2)
                )
                .replace(
                  "yy",
                  ("0000" + date?.getFullYear().toString()).slice(-4)
                )
                .replace("dd", ("00" + date?.getDate().toString()).slice(-2))}
            </td>
            <td style={{ fontSize: "x-small" }}>S.M: {user}</td>
            <td style={{ fontSize: "x-small" }}>Memo: Cash</td>
          </tr>
        </table>
        <div style={{ height: "50%", borderBottom: "1px solid black" }}>
          <table
            style={{
              width: "100%",
            }}
          >
            <tr
              style={{
                backgroundColor: "#EDEDED",
              }}
            >
              <th style={{ fontSize: "x-small" }}>S.</th>
              <th style={{ fontSize: "x-small" }} colSpan={3}>
                Product
              </th>
              <th style={{ fontSize: "x-small" }} colSpan={2}>
                MRP
              </th>
              <th style={{ fontSize: "x-small" }} colSpan={2}>
                Qty
              </th>
              <th style={{ fontSize: "x-small" }} colSpan={2}>
                Free
              </th>
              <th style={{ fontSize: "x-small" }} colSpan={2}>
                Tax (%)
              </th>
              <th style={{ fontSize: "x-small" }} colSpan={2}>
                Unit Price
              </th>
              <th style={{ fontSize: "x-small" }} colSpan={2}>
                Dsc A (%)
              </th>
              <th style={{ fontSize: "x-small" }} colSpan={2}>
                Dsc B (%)
              </th>
              <th style={{ fontSize: "x-small" }} colSpan={2}>
                Dsc Amt
              </th>
              <th style={{ fontSize: "x-small" }} colSpan={2}>
                Tex Amt
              </th>
              <th style={{ fontSize: "x-small" }} colSpan={2}>
                Net Unit Price
              </th>
              <th style={{ fontSize: "x-small" }} colSpan={2}>
                Amount
              </th>
            </tr>
  
            {item_details.map((item, i) => {
              const itemInfo = itemData.find(
                (a) => a.item_uuid === item.item_uuid
              );
              let itemQty =
                (+item.q || 0) * (+itemInfo?.conversion || 1) + (+item.p || 0);
              let unit_price = (+item.item_total || 0) / (+itemQty || 1);
              let tex_amt =
                (+unit_price || 0) -
                ((+unit_price || 0) * 100) / (100 + (+item.gst_percentage || 0));
              let dsc_amt = (+unit_price || 0) - +item.price;
              return (
                <tr style={{ borderBottom: "1px solid #000" }}>
                  <td style={{ fontSize: "x-small" }}>{i + 1}</td>
                  <td style={{ fontSize: "x-small" }} colSpan={3}>
                    {itemInfo?.item_title || ""}
                  </td>
                  <td
                    style={{
                      fontSize: "x-small",
                      textAlign: "center",
                    }}
                    colSpan={2}
                  >
                    {itemInfo?.mrp || ""}
                  </td>
                  <td
                    style={{
                      fontSize: "x-small",
                      textAlign: "center",
                    }}
                    colSpan={2}
                  >
                    {(item.b || 0) + ":" + ("00" + item?.p.toString()).slice(-2)}
                  </td>
                  <td
                    style={{
                      fontSize: "x-small",
                      textAlign: "center",
                    }}
                    colSpan={2}
                  >
                    {item?.free || 0}
                  </td>
                  <td
                    style={{
                      fontSize: "x-small",
                      textAlign: "center",
                    }}
                    colSpan={2}
                  >
                    {item?.gst_percentage || 0}
                  </td>
                  <td
                    style={{
                      fontSize: "x-small",
                      textAlign: "center",
                    }}
                    colSpan={2}
                  >
                    {item?.price || 0}
                  </td>
                  <td
                    style={{
                      fontSize: "x-small",
                      textAlign: "center",
                    }}
                    colSpan={2}
                  >
                    {item.charges_discount.length
                      ? item.charges_discount[0].value || 0
                      : 0}
                  </td>
                  <td
                    style={{
                      fontSize: "x-small",
                      textAlign: "center",
                    }}
                    colSpan={2}
                  >
                    {item.charges_discount.length > 1
                      ? item.charges_discount[1].value || 0
                      : 0}
                  </td>
                  <td
                    style={{
                      fontSize: "x-small",
                      textAlign: "center",
                    }}
                    colSpan={2}
                  >
                    {(dsc_amt || 0).toFixed(2)}
                  </td>
                  <td
                    style={{
                      fontSize: "x-small",
                      textAlign: "center",
                    }}
                    colSpan={2}
                  >
                    {(tex_amt || 0).toFixed(2)}
                  </td>
                  <td
                    style={{
                      fontSize: "x-small",
                      textAlign: "center",
                    }}
                    colSpan={2}
                  >
                    {(unit_price || 0).toFixed(2)}
                  </td>
                  <td
                    style={{
                      fontSize: "x-small",
                      textAlign: "center",
                    }}
                    colSpan={2}
                  >
                    {item?.item_total || 0}
                  </td>
                </tr>
              );
            })}
          </table>
        </div>
      </>
    );
  };

export default OrderPrint;
