import React from "react";

const OrderPrint = ({
  counter = [],
  order = { item_details: [] },
  date = "",
  user = {},
  itemData = [],
  item_details = [],
  footer = false,
}) => {
  let total_desc_amt =
    order?.item_details?.map((item) => {
      const itemInfo = itemData?.find((a) => a.item_uuid === item.item_uuid);
      let itemQty =
        (+item.b || 0) * (+itemInfo?.conversion || 1) + (+item.p || 0);
      let unit_price = (+item?.item_total || 0) / (+itemQty || 1);
      let tex_amt =
        (+unit_price || 0) -
          ((+unit_price || 0) * 100) / (100 + (+item.gst_percentage || 0)) || 0;
      let dsc_amt =
        (+(item?.price || item.price) - (+unit_price || 0)) * itemQty || 0;
      return { dsc_amt, tex_amt };
    }) || [];
  return (
    <>
      <table
        style={{
          width: "170mm",
          height: "128mm",
          border: "1px solid black",
          pageBreakAfter: "always",
          display: "block",
        }}
      >
        <tr>
          <td
            colSpan={28}
            style={{ textAlign: "center", fontSize: "small", width: "100%" }}
          >
            <b>GST INVOICE</b>
          </td>
        </tr>
        <tr>
          <td style={{ width: "50%" }} colSpan={14}>
            <table>
              <tr>
                <td
                  style={{
                    fontSize: "larger",
                    fontWeight: "bold",
                    lineHeight: 0.5,
                  }}
                >
                  Bharat Traders
                </td>
              </tr>
              <tr>
                <td style={{ fontSize: "x-small" }}>
                  Ganesh Nagar, Near Sharda Convent School,
                  <br /> Ganesh Nagar, Gondia - 441401
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
          <td colSpan={14}>
            <table>
              <tr>
                <td style={{ fontSize: "x-small" }}>
                  M/S {counter?.counter_title || ""}
                </td>
              </tr>
              {counter?.address ? (
                <tr>
                  <td style={{ fontSize: "x-small" }}>
                    {counter?.address || ""}
                  </td>
                </tr>
              ) : (
                ""
              )}

              {counter?.mobile?.length ? (
                <tr>
                  <td style={{ fontSize: "x-small" }}>
                    {counter?.mobile?.map((a, i) => (i === 0 ? a : ", " + a)) ||
                      ""}
                  </td>
                </tr>
              ) : (
                ""
              )}
              {counter?.food_license ? (
                <tr>
                  <td style={{ fontSize: "x-small" }}>
                    Food License: {counter?.food_license}
                  </td>
                </tr>
              ) : (
                ""
              )}
              {counter?.gst ? (
                <tr>
                  <td style={{ fontSize: "x-small" }}>GSTIN: {counter?.gst}</td>
                </tr>
              ) : (
                ""
              )}
            </table>
          </td>
        </tr>
        <tr>
          <th colSpan={28}>
            <hr
              style={{
                height: "3px",
                backgroundColor: "#000",
                width: "100%",
              }}
            />
          </th>
        </tr>
        <tr>
          <td style={{ fontSize: "x-small" }} colSpan={7}>
            Invoice: N{order?.invoice_number}
          </td>
          <td style={{ fontSize: "x-small" }} colSpan={7}>
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
          <td style={{ fontSize: "x-small" }} colSpan={7}>
            S.M: {user}
          </td>
          <td style={{ fontSize: "x-small" }} colSpan={7}>
            Memo: Cash
          </td>
        </tr>
        <tr>
          <th colSpan={28}>
            <hr
              style={{
                height: "3px",
                backgroundColor: "#000",
                width: "100%",
              }}
            />
          </th>
        </tr>
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
            Pack
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
            Tax Amt
          </th>
          <th style={{ fontSize: "x-small" }} colSpan={2}>
            Net Unit Price
          </th>
          <th style={{ fontSize: "x-small" }} colSpan={2}>
            Amount
          </th>
        </tr>
        <tr>
          <th colSpan={28}>
            <hr
              style={{
                height: "3px",
                backgroundColor: "#000",
                width: "100%",
              }}
            />
          </th>
        </tr>
        {item_details?.map((item, i) => {
          const itemInfo = itemData.find((a) => a.item_uuid === item.item_uuid);
          let itemQty =
            (+item.b || 0) * (+itemInfo?.conversion || 1) + (+item.p || 0);
          let unit_price = (+item.item_total || 0) / (+itemQty || 1);
          // console.log(item)
          let tex_amt =
            (+unit_price || 0) -
            ((+unit_price || 0) * 100) / (100 + (+item.gst_percentage || 0));
          let dsc_amt = (+item.price - (+unit_price || 0)) * itemQty;
          return (
            <tr
              style={{ borderBottom: "1px solid #000" }}
              className="order_item"
            >
              <td style={{ fontSize: "x-small" }}>{item?.sr || i + 1}.</td>
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
                {itemInfo?.conversion || ""}
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
                {(item.b || 0) + ":" + (item?.p || 0)}
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
                {item?.price || unit_price || 0}
              </td>
              <td
                style={{
                  fontSize: "x-small",
                  textAlign: "center",
                }}
                colSpan={2}
              >
                {item?.charges_discount?.length
                  ? item?.charges_discount[0]?.value || 0
                  : 0}
              </td>
              <td
                style={{
                  fontSize: "x-small",
                  textAlign: "center",
                }}
                colSpan={2}
              >
                {item?.charges_discount?.length > 1
                  ? item.charges_discount[1]?.value || 0
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
        <tr style={{ height: (12 - item_details?.length) * 10 + "px" }}>
          <td colspan="28"></td>
        </tr>

        {footer ? (
          <>
            <tr>
              <th colSpan={28}>
                <hr
                  style={{
                    height: "3px",
                    backgroundColor: "#000",
                    width: "100%",
                  }}
                />
              </th>
            </tr>
            <tr style={{ borderBottom: "1px solid #000" }}>
              <td style={{ fontSize: "x-small" }}></td>
              <th style={{ fontSize: "x-small" }} colSpan={3}>
                Total
              </th>
              <td
                style={{
                  fontSize: "x-small",
                  textAlign: "center",
                }}
                colSpan={2}
              ></td>
              <td
                style={{
                  fontSize: "x-small",
                  textAlign: "center",
                }}
                colSpan={2}
              ></td>
              <th
                style={{
                  fontSize: "x-small",
                  textAlign: "center",
                }}
                colSpan={2}
              >
                {order?.item_details?.length > 1
                  ? order?.item_details
                      ?.map((a) => +a.b || 0)
                      .reduce((a, b) => a + b)
                  : order?.item_details[0]?.b || 0}
                :
                {order?.item_details?.length > 1
                  ? order?.item_details
                      ?.map((a) => +a.p || 0)
                      .reduce((a, b) => a + b)
                  : order?.item_details[0]?.p || 0}
              </th>
              <th
                style={{
                  fontSize: "x-small",
                  textAlign: "center",
                }}
                colSpan={2}
              >
                {order?.item_details?.length > 1
                  ? order?.item_details
                      ?.map((a) => +a.free || 0)
                      .reduce((a, b) => a + b)
                  : order?.item_details[0]?.free || 0}
              </th>
              <td
                style={{
                  fontSize: "x-small",
                  textAlign: "center",
                }}
                colSpan={2}
              ></td>
              <td
                style={{
                  fontSize: "x-small",
                  textAlign: "center",
                }}
                colSpan={2}
              ></td>
              <td
                style={{
                  fontSize: "x-small",
                  textAlign: "center",
                }}
                colSpan={2}
              ></td>
              <td
                style={{
                  fontSize: "x-small",
                  textAlign: "center",
                }}
                colSpan={2}
              ></td>
              <th
                style={{
                  fontSize: "x-small",
                  textAlign: "center",
                }}
                colSpan={2}
              >
                {(total_desc_amt?.length > 1
                  ? total_desc_amt
                      ?.map((a) => a.dsc_amt)
                      .reduce((a, b) => a + b)
                  : total_desc_amt[0]?.dsc_amt || 0
                ).toFixed(2)}
              </th>
              <th
                style={{
                  fontSize: "x-small",
                  textAlign: "center",
                }}
                colSpan={2}
              >
                {(total_desc_amt?.length > 1
                  ? total_desc_amt
                      ?.map((a) => a.tex_amt)
                      .reduce((a, b) => a + b)
                  : total_desc_amt[0]?.tex_amt || 0
                ).toFixed(2)}
              </th>
              <td
                style={{
                  fontSize: "x-small",
                  textAlign: "center",
                }}
                colSpan={2}
              ></td>
              <th
                style={{
                  fontSize: "x-small",
                  textAlign: "center",
                }}
                colSpan={2}
              >
                {(
                  Number((order?.item_details?.length > 1
                    ? order?.item_details
                        ?.map((a) => +a.item_total || 0)
                        .reduce((a, b) => a + b)
                    : order?.item_details[0]?.item_total) || 0)
                ).toFixed(2)}
              </th>
            </tr>
          </>
        ) : (
          ""
        )}
        <tr>
          <th colSpan={28}>
            <hr
              style={{
                height: "3px",
                backgroundColor: "#000",
                width: "100%",
              }}
            />
          </th>
        </tr>

        {footer ? (
          <>
            <tr>
              <td colSpan={14}>
                <table
                  style={{ borderRight: "1px solid black", width: "100%" }}
                >
                  <tr>
                    <td style={{ fontSize: "x-small" }}>
                      <b> Bank:</b> Punjab National Bank, Gondia
                    </td>
                  </tr>
                  <tr>
                    <td style={{ fontSize: "x-small" }}>
                      <b>Ac. No:</b> 0182008700014607
                    </td>
                  </tr>
                  <tr>
                    <td style={{ fontSize: "x-small" }}>
                      <b>IFSC:</b> PUNB0018200
                    </td>
                  </tr>

                  <tr>
                    <td
                      style={{
                        textAlign: "center",
                        fontSize: "small",
                        width: "100%",
                      }}
                    >
                      <b>Or</b>
                    </td>
                  </tr>

                  <tr>
                    <td style={{ fontSize: "x-small" }}>
                      <b>Gpay / PhonePe:</b> 9422551074
                    </td>
                  </tr>
                  <tr>
                    <td style={{ fontSize: "x-small" }}>
                      <b>UPI / VPA:</b> 9422551074@upi / 9422551074@ybl
                    </td>
                  </tr>
                </table>
              </td>
              <td colSpan={14}>
                <table style={{ width: "100%" }}>
                  <tr>
                    <td style={{ fontSize: "x-small", textAlign: "right" }}>
                      0
                    </td>
                  </tr>
                  <tr>
                    <td style={{ fontSize: "x-small", textAlign: "right" }}>
                      0
                    </td>
                  </tr>
                  <tr>
                    <td style={{ fontSize: "x-small", textAlign: "right" }}>
                      0
                    </td>
                  </tr>

                  <tr>
                    <th
                      style={{
                        fontSize: "x-large",
                        fontWeight: "bolder",
                        textAlign: "right",
                      }}
                    >
                      Order Total: {order?.order_grandtotal || 0}
                    </th>
                  </tr>
                </table>
              </td>
            </tr>
            <tr>
              <th colSpan={28}>
                <hr
                  style={{
                    height: "3px",
                    backgroundColor: "#000",
                    width: "100%",
                  }}
                />
              </th>
            </tr>
          </>
        ) : (
          <tr>
            <td
              colSpan={28}
              style={{
                fontSize: "xx-large",
                fontWeight: "bolder",
                textAlign: "center",
              }}
            >
              Continue...
            </td>
          </tr>
        )}
      </table>
    </>
  );
};

export default OrderPrint;
