import { AiOutlineSearch } from "react-icons/ai";
import { IoArrowBackOutline } from "react-icons/io5";
import { useState, useEffect } from "react";
import { openDB } from "idb";
import { useNavigate, useParams } from "react-router-dom";
import { AutoAdd, Billing } from "../functions";
import { Link as ScrollLink } from "react-scroll";
import { v4 as uuid } from "uuid";
import axios from "axios";
import CloseIcon from "@mui/icons-material/Close";
const SelectedCounterOrder = () => {
  const [items, setItems] = useState([]);
  const [order, setOrder] = useState([]);
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const [clickedId, setClickedId] = useState(false);
  const [cartPage, setCartPage] = useState(false);
  const [counters, setCounters] = useState([]);
  const [counter, setCounter] = useState({});
  const params = useParams();
  const [filterItemTitle, setFilterItemTile] = useState("");
  const [filterCompany, setFilterCompany] = useState("");
  const [itemsCategory, setItemsCategory] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [popupForm, setPopupForm] = useState(false);
  const [orderCreated, setOrderCreated] = useState(false);
  const [holdPopup, setHoldPopup] = useState(false);
  const [loading, setLoading] = useState(false);
  const Navigate = useNavigate();
  const getIndexedDbData = async () => {
    const db = await openDB("BT", +localStorage.getItem("IDBVersion") || 1);
    let tx = await db.transaction("items", "readwrite").objectStore("items");
    let item = await tx.getAll();
    setItems(
      item
        .filter((a) => a.status !== 0)
        .map((a) => ({
          ...a,
          item_price: a.item_price || 0,
          gst_percentage: a.gst_percentage || 0,
        }))
    );
    let store = await db
      .transaction("companies", "readwrite")
      .objectStore("companies");
    let company = await store.getAll();
    setCompanies(company);
    setFilterCompany(company[0]?.company_uuid);
    store = await db
      .transaction("item_category", "readwrite")
      .objectStore("item_category");
    let route = await store.getAll();
    setItemsCategory(route);
    store = await db.transaction("counter", "readwrite").objectStore("counter");
    let countersData = await store.getAll();
    setCounters(countersData);
    db.close();
  };
  useEffect(() => {
    getIndexedDbData();
  }, []);
  useEffect(() => {
    if (counters.length)
      setCounter(counters?.find((a) => params.counter_uuid === a.counter_uuid));
  }, [counters]);
  useEffect(() => {
    setItems((prev) =>
      prev?.map((a) => ({
        ...a,
        item_price:
          counter.item_special_price?.find((b) => b.item_uuid === a.item_uuid)
            ?.price || a.item_price,
        b: 0,
        p: 0,
        status: 0,
      }))
    );
  }, [counter]);

  const postOrder = async (orderData) => {
    console.log(orderData);
    let data = {
      ...orderData,
      order_uuid: uuid(),
      opened_by: 0,
      item_details: orderData.items.map((a) => ({
        ...a,
        b: a.b,
        p: a.p,
        unit_price: a.price,
        gst_percentage: a.item_gst,
        status: 0,
        price: a.price || a.item_price,
      })),
      status: [
        {
          stage: orderData.others.stage,
          time: orderData.others.time,
          user_uuid: orderData.others.user_uuid,
        },
      ],
    };
    console.log(data);
    const response = await axios({
      method: "post",
      url: "/orders/postOrder",
      data,
      headers: {
        "Content-Type": "application/json",
      },
    });
    if (response.data.success) {
      let qty = `${
        data?.item_details?.length > 1
          ? data?.item_details?.reduce((a, b) => (+a.b || 0) + (+b.b || 0))
          : data?.item_details?.length
          ? data?.item_details[0]?.b
          : 0
      }:${
        data?.item_details?.length > 1
          ? data?.item_details?.reduce((a, b) => (+a.p || 0) + (+b.p || 0))
          : data?.item_details?.length
          ? data?.item_details[0]?.p
          : 0
      }`;
      postActivity({
        activity: "Order End",
        range: data?.item_details?.length,
        qty,
        amt: data.order_grandtotal || 0,
      });
      Navigate(-1);
    }
  };
  const postActivity = async (others = {}) => {
    let time = new Date();
    let data = {
      user_uuid: localStorage.getItem("user_uuid"),
      role: "Order",
      narration:
        counter.counter_title +
        (sessionStorage.getItem("route_title")
          ? ", " + sessionStorage.getItem("route_title")
          : ""),
      timestamp: time.getTime(),
      ...others,
    };
    const response = await axios({
      method: "post",
      url: "/userActivity/postUserActivity",
      data,
      headers: {
        "Content-Type": "application/json",
      },
    });
    if (response.data.success) {
      console.log(response);
    }
  };
  useEffect(() => {
    if (!orderCreated && order?.items?.length) {
      postActivity({ activity: "Order Start" });
      setOrderCreated(true);
    }
  }, [order]);
  return (
    <>
      <div>
        <nav className="user_nav nav_styling">
          <div className="user_menubar">
            <IoArrowBackOutline
              className="user_Back_icon"
              onClick={() => (!cartPage ? Navigate(-1) : setCartPage(false))}
            />
          </div>
          {cartPage ? (
            <>
              <h1 style={{ width: "100%", textAlign: "center" }}>Cart</h1>
              <button
                className="item-sales-search"
                style={{
                  width: "max-content",
                }}
                onClick={() => setHoldPopup("Summary")}
              >
                Free
              </button>
            </>
          ) : (
            ""
          )}
          {!cartPage ? (
            <>
              <div className="user_searchbar flex">
                <AiOutlineSearch className="user_search_icon" />
                <input
                  style={{ width: "200px" }}
                  className="searchInput"
                  type="text"
                  placeholder="search"
                  value={filterItemTitle}
                  onChange={(e) => setFilterItemTile(e.target.value)}
                />
                <CloseIcon
                  className="user_cross_icon"
                  onClick={() => setFilterItemTile("")}
                />
              </div>

              <div>
                <select
                  className="searchInput selectInput"
                  value={filterCompany}
                  onChange={(e) => setFilterCompany(e.target.value)}
                >
                  {companies?.map((a) => (
                    <option value={a.company_uuid}>{a.company_title}</option>
                  ))}
                </select>
              </div>
            </>
          ) : (
            ""
          )}
        </nav>
        <div className="home">
          <div className="container">
            <div className="menucontainer">
              <div className="menus">
                {!cartPage
                  ? itemsCategory
                      ?.filter((a) => a.company_uuid === filterCompany)
                      ?.sort((a, b) => a.sort_order - b.sort_order)
                      ?.map(
                        (category) =>
                          items
                            .filter(
                              (a) => a.category_uuid === category.category_uuid
                            )
                            ?.sort((a, b) => a.sort_order - b.sort_order)
                            ?.filter(
                              (a) =>
                                !filterItemTitle ||
                                a.item_title
                                  .toLocaleLowerCase()
                                  .includes(filterItemTitle.toLocaleLowerCase())
                            )?.length > 0 && (
                            <div
                              id={!cartPage ? category?.category_uuid : ""}
                              key={category?.category_uuid}
                              name={category?.category_uuid}
                              className="categoryItemMap"
                            >
                              <h1 className="categoryHeadline">
                                {category?.category_title}
                              </h1>

                              {items
                                ?.filter(
                                  (a) =>
                                    !filterItemTitle ||
                                    a.item_title
                                      .toLocaleLowerCase()
                                      .includes(
                                        filterItemTitle.toLocaleLowerCase()
                                      )
                                )
                                ?.sort((a, b) => a - b)
                                .filter(
                                  (a) =>
                                    a.category_uuid === category.category_uuid
                                )
                                ?.map((item) => {
                                  return (
                                    <div
                                      key={item?.item_uuid}
                                      className="menu"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setOrder((prev) => ({
                                          ...prev,
                                          items: prev?.items?.filter(
                                            (a) =>
                                              a.item_uuid === item.item_uuid
                                          )?.length
                                            ? prev?.items?.map((a) =>
                                                a.item_uuid === item.item_uuid
                                                  ? {
                                                      ...a,
                                                      b:
                                                        +(a.b || 0) +
                                                        parseInt(
                                                          ((a?.p || 0) +
                                                            (+item?.one_pack ||
                                                              1)) /
                                                            +item.conversion
                                                        ),

                                                      p:
                                                        ((a?.p || 0) +
                                                          (+item?.one_pack ||
                                                            1)) %
                                                        +item.conversion,
                                                    }
                                                  : a
                                              )
                                            : prev?.items?.length
                                            ? [
                                                ...prev.items,
                                                ...items
                                                  ?.filter(
                                                    (a) =>
                                                      a.item_uuid ===
                                                      item.item_uuid
                                                  )
                                                  .map((a) => ({
                                                    ...a,
                                                    b:
                                                      +(a.b || 0) +
                                                      parseInt(
                                                        ((a?.p || 0) +
                                                          (+item?.one_pack ||
                                                            1)) /
                                                          +item.conversion
                                                      ),

                                                    p:
                                                      ((a?.p || 0) +
                                                        (+item?.one_pack ||
                                                          1)) %
                                                      +item.conversion,
                                                  })),
                                              ]
                                            : items
                                                ?.filter(
                                                  (a) =>
                                                    a.item_uuid ===
                                                    item.item_uuid
                                                )
                                                .map((a) => ({
                                                  ...a,
                                                  b:
                                                    +(a.b || 0) +
                                                    parseInt(
                                                      ((a?.p || 0) +
                                                        (+item?.one_pack ||
                                                          1)) /
                                                        +item.conversion
                                                    ),

                                                  p:
                                                    ((a?.p || 0) +
                                                      (+item?.one_pack || 1)) %
                                                    +item.conversion,
                                                })),
                                        }));
                                      }}
                                    >
                                      <div className="menuItemDetails">
                                        <h1 className="item-name">
                                          {item?.item_title}
                                        </h1>

                                        <div
                                          className="item-mode flex"
                                          style={{
                                            justifyContent: "space-between",
                                          }}
                                        >
                                          <h3 className={`item-price`}>
                                            Price: {item?.item_price}
                                          </h3>
                                          <h3 className={`item-price`}>
                                            MRP: {item?.mrp || ""}
                                          </h3>
                                        </div>
                                      </div>
                                      <div className="menuleft">
                                        <input
                                          value={`${
                                            order?.items?.find(
                                              (a) =>
                                                a.item_uuid === item.item_uuid
                                            )?.b || 0
                                          } : ${
                                            order?.items?.find(
                                              (a) =>
                                                a.item_uuid === item.item_uuid
                                            )?.p || 0
                                          }`}
                                          className="boxPcsInput"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            setPopupForm(item);
                                          }}
                                        />
                                      </div>
                                    </div>
                                  );
                                })}
                              <div className="menu">
                                <div className="menuItemDetails">
                                  <h1 className="item-name"></h1>

                                  <div className="item-mode">
                                    <h3 className={`item-price`}></h3>
                                  </div>
                                </div>
                                <div className="menuleft"></div>
                              </div>
                            </div>
                          )
                      )
                  : itemsCategory
                      ?.sort((a, b) => a.sort_order - b.sort_order)
                      ?.map(
                        (category) =>
                          order?.items.filter(
                            (a) => a.category_uuid === category.category_uuid
                          )?.length > 0 && (
                            <div
                              id={cartPage ? category?.category_uuid : ""}
                              name={category?.category_uuid}
                              key={category?.category_uuid}
                              className="categoryItemMap"
                            >
                              <h1 className="categoryHeadline">
                                {category?.category_title}
                              </h1>

                              {order?.items
                                ?.filter(
                                  (a) =>
                                    !filterItemTitle ||
                                    a.item_title
                                      .toLocaleLowerCase()
                                      .includes(
                                        filterItemTitle.toLocaleLowerCase()
                                      )
                                )
                                ?.sort((a, b) => a.sort_order - b.sort_order)
                                .filter(
                                  (a) =>
                                    a.category_uuid === category.category_uuid
                                )
                                ?.map((item) => {
                                  return (
                                    <div
                                      key={item?.item_uuid}
                                      className="menu"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setOrder((prev) => ({
                                          ...prev,
                                          items:
                                            prev?.items?.map((a) =>
                                              a.item_uuid === item.item_uuid
                                                ? {
                                                    ...a,
                                                    b:
                                                      +(a.b || 0) +
                                                      parseInt(
                                                        ((a?.p || 0) +
                                                          (+item?.one_pack ||
                                                            1)) /
                                                          +item.conversion
                                                      ),

                                                    p:
                                                      ((a?.p || 0) +
                                                        (+item?.one_pack ||
                                                          1)) %
                                                      +item.conversion,
                                                  }
                                                : a
                                            ) ||
                                            items
                                              ?.filter(
                                                (a) =>
                                                  a.item_uuid === item.item_uuid
                                              )
                                              .map((a) => ({
                                                ...a,
                                                b:
                                                  +(a.b || 0) +
                                                  parseInt(
                                                    ((a?.p || 0) +
                                                      (+item?.one_pack || 1)) /
                                                      +item.conversion
                                                  ),

                                                p:
                                                  ((a?.p || 0) +
                                                    (+item?.one_pack || 1)) %
                                                  +item.conversion,
                                              })),
                                        }));
                                      }}
                                    >
                                      <div className="menuItemDetails">
                                        <h1 className="item-name">
                                          {item?.item_title}
                                        </h1>

                                        <div
                                          className="item-mode flex"
                                          style={{
                                            justifyContent: "space-between",
                                          }}
                                        >
                                          <h3 className={`item-price`}>
                                            Price: {item?.item_price}
                                          </h3>
                                          <h3 className={`item-price`}>
                                            MRP: {item?.mrp || ""}
                                          </h3>
                                        </div>
                                      </div>
                                      <div className="menuleft">
                                        <input
                                          value={`${item?.b || 0} : ${
                                            item?.p || 0
                                          }`}
                                          className="boxPcsInput"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            setPopupForm(item);
                                          }}
                                        />
                                      </div>
                                    </div>
                                  );
                                })}
                              <div className="menu">
                                <div className="menuItemDetails">
                                  <h1 className="item-name"></h1>

                                  <div className="item-mode">
                                    <h3 className={`item-price`}></h3>
                                  </div>
                                </div>
                                <div className="menuleft"></div>
                              </div>
                            </div>
                          )
                      )}
              </div>
            </div>
          </div>
        </div>
        <div
          className="allcategoryList"
          style={{
            bottom: itemsCategory?.length > 0 ? "3.5rem" : "1rem",
          }}
        >
          <div className={`menulist`}>
            <div
              className={`${isCategoryOpen ? "showCategory" : ""} categoryList`}
              style={{ overflow: "scroll" }}
            >
              {itemsCategory
                .filter((a) => a.company_uuid === filterCompany)
                ?.sort((a, b) => a.sort_order - b.sort_order)
                ?.map((category, i) => {
                  return (
                    (cartPage
                      ? order?.items?.filter(
                          (a) => a.category_uuid === category.category_uuid
                        )?.length > 0
                      : items.filter(
                          (a) => a.category_uuid === category.category_uuid
                        )?.length > 0) && (
                      <ScrollLink
                        id={`${i}`}
                        onClick={() => {
                          var element = document.getElementById(
                            category.category_uuid
                          );

                          element.scrollIntoView();
                          element.scrollIntoView(false);
                          element.scrollIntoView({ block: "start" });
                          element.scrollIntoView({
                            behavior: "smooth",
                            block: "end",
                            inline: "nearest",
                          });
                          setIsCategoryOpen(!isCategoryOpen);
                          setClickedId(i?.toString());
                        }}
                        smooth={true}
                        duration={1000}
                        to={category?.category_uuid}
                        className={`${
                          clickedId === i?.toString() ? "activeMenuList" : ""
                        } categorybtn`}
                        key={i}
                      >
                        {category?.category_title}
                        <span className="categoryLength">
                          {cartPage
                            ? order?.items?.filter(
                                (a) =>
                                  a.category_uuid === category.category_uuid
                              )?.length
                            : items
                                .filter(
                                  (a) =>
                                    a.category_uuid === category.category_uuid
                                )
                                ?.filter(
                                  (a) =>
                                    !filterItemTitle ||
                                    a.item_title
                                      .toLocaleLowerCase()
                                      .includes(
                                        filterItemTitle.toLocaleLowerCase()
                                      )
                                )?.length}
                        </span>
                      </ScrollLink>
                    )
                  );
                })}
            </div>
            {isCategoryOpen && <div id="black-bg" />}
            {!isCategoryOpen ? (
              <button
                className="showMenuListBtn"
                onClick={() => setIsCategoryOpen(!isCategoryOpen)}
              >
                Categories
              </button>
            ) : (
              <button
                className="showMenuListBtn"
                onClick={() => setIsCategoryOpen(!isCategoryOpen)}
              >
                <i className="fas fa-times"></i> Close
              </button>
            )}
          </div>
        </div>
      </div>
      {popupForm ? (
        <NewUserForm
          onSave={() => setPopupForm(false)}
          setOrder={setOrder}
          popupInfo={popupForm}
          order={order}
        />
      ) : (
        ""
      )}
      {loading ? (
        <div className="overlay" style={{ zIndex: 9999999 }}>
          <div className="flex" style={{ width: "40px", height: "40px" }}>
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
          </div>
        </div>
      ) : (
        ""
      )}
      {cartPage ? (
        <>
          <button
            type="button"
            className="cartBtn"
            onClick={async () => {
              setLoading(true);
              const db = await openDB(
                "BT",
                +localStorage.getItem("IDBVersion") || 1
              );
              let tx = await db
                .transaction("autobill", "readwrite")
                .objectStore("autobill");
              let autobills = await tx.getAll();
              let store = await db
                .transaction("items", "readwrite")
                .objectStore("items");
              let dbItems = await store.getAll();
              let data = await AutoAdd({
                counter,
                items: order.items,
                dbItems,
                autobills,
              });

              setOrder((prev) => ({
                ...prev,
                ...data,
                items: data?.items?.map((a) => ({
                  ...a,
                  b: +a.b + parseInt(+a.p / +a.conversion),
                  p: +a.p % +a.conversion,
                })),
              }));
              setTimeout(async () => {
                let time = new Date();
                Billing({
                  counter,
                  items: order.items,
                  others: {
                    stage: 1,
                    user_uuid: localStorage.getItem("user_uuid"),
                    time: time.getTime(),

                    type: "NEW",
                  },
                  add_discounts: true,
                }).then((data) => {
                  setOrder((prev) => ({ ...prev, ...data }));
                  postOrder({ ...order, ...data });
                  db.close();
                });
              }, 2000);
            }}
          >
            Submit
          </button>
        </>
      ) : order?.items?.length ? (
        <button
          type="button"
          onClick={() => {
            setFilterItemTile("");

            setCartPage(true);
          }}
          className="cartBtn"
          style={{ padding: "3px" }}
        >
          Cart
        </button>
      ) : (
        ""
      )}
      {holdPopup ? (
        <HoldPopup
          onSave={() => setHoldPopup(false)}
          orders={order}
          holdPopup={holdPopup}
          itemsData={items}
          setOrder={setOrder}
        />
      ) : (
        ""
      )}
    </>
  );
};

export default SelectedCounterOrder;
function HoldPopup({ onSave, orders, itemsData, holdPopup, setOrder }) {
  const [items, setItems] = useState([]);
  useEffect(() => {
    setItems(itemsData.filter((a) => a.free_issue === "Y"));
  }, []);
  const postOrderData = async () => {
    let data = orders;
    let itemsdata = items.filter((a) => a.free);
    let filterItem = data?.items?.filter(
      (a) => !itemsdata.filter((b) => b.item_uuid === a.item_uuid).length
    );
    let NonFilterItem = data.items.filter(
      (a) => itemsdata.filter((b) => b.item_uuid === a.item_uuid).length
    );
    NonFilterItem = itemsdata.map((a) =>
      NonFilterItem.filter((b) => b.item_uuid === a.item_uuid).length
        ? {
            ...NonFilterItem.find((b) => b.item_uuid === a.item_uuid),
            free: a.free,
          }
        : { ...a, b: 0, p: 0 }
    );
    let item_details = filterItem.length
      ? NonFilterItem.length
        ? [...filterItem, ...NonFilterItem]
        : filterItem
      : NonFilterItem.length
      ? NonFilterItem
      : [];
    setOrder((prev) => ({ ...prev, items: item_details }));
    console.log(item_details);
    onSave();
  };
  console.log(orders);
  return (
    <div className="overlay" style={{ zIndex: 999999999 }}>
      <div
        className="modal"
        style={{
          height: "fit-content",
          width: "max-content",
          minWidth: "250px",
        }}
      >
        <h1>Free Items</h1>
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
                    <tr style={{ color: "#fff", backgroundColor: "#7990dd" }}>
                      <th colSpan={3}>
                        <div className="t-head-element">Item</div>
                      </th>
                      <th colSpan={2}>
                        <div className="t-head-element">Qty</div>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="tbody">
                    {items?.map((item, i) => (
                      <tr
                        key={item?.item_uuid || Math.random()}
                        style={{
                          height: "30px",
                          color: "#fff",
                          backgroundColor:
                            +item.status === 1
                              ? "green"
                              : +item.status === 3
                              ? "red"
                              : "#7990dd",
                        }}
                      >
                        <td colSpan={3}>{item.item_title}</td>
                        <td colSpan={2}>
                          <input
                            type="number"
                            name="route_title"
                            className="numberInput"
                            value={item?.free || ""}
                            style={{
                              width: "100px",
                              backgroundColor: "transparent",
                              color: "#fff",
                            }}
                            onChange={(e) =>
                              setItems((prev) =>
                                prev.map((a) =>
                                  a.item_uuid === item.item_uuid
                                    ? { ...a, free: e.target.value }
                                    : a
                                )
                              )
                            }
                            maxLength={42}
                          />
                        </td>
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
                <i>No Data Present</i>
              </div>
            )}

            {items.filter((a) => a.free).length ? (
              <div className="flex" style={{ justifyContent: "space-between" }}>
                {/* <button
                type="button"
                style={{ backgroundColor: "red" }}
                className="submit"
                onClick={onSave}
              >
                Cancel
              </button> */}
                <button
                  type="button"
                  className="submit"
                  onClick={postOrderData}
                >
                  Save
                </button>
              </div>
            ) : (
              ""
            )}
          </div>
          <button onClick={onSave} className="closeButton">
            x
          </button>
        </div>
      </div>
    </div>
  );
}
function NewUserForm({ onSave, popupInfo, setOrder, order }) {
  const [data, setdata] = useState({});
  const [errMassage, setErrorMassage] = useState("");
  useEffect(() => {
    let data = order.items?.find((a) => a.item_uuid === popupInfo.item_uuid);
    setdata({
      b: data?.b || 0,
      p: data?.p || 0,
    });
  }, []);
  const submitHandler = async (e) => {
    e.preventDefault();
    setOrder((prev) => ({
      ...prev,
      items: (prev?.items?.filter((a) => a.item_uuid === popupInfo.item_uuid)
        ?.length
        ? prev?.items?.map((a) =>
            a.item_uuid === popupInfo.item_uuid
              ? {
                  ...a,
                  b: +data.b + parseInt(+data.p / +popupInfo.conversion),
                  p: +data.p % +popupInfo.conversion,
                }
              : a
          )
        : prev?.items?.length
        ? [
            ...prev?.items,
            {
              ...popupInfo,
              b: +data.b + parseInt(+data.p / +popupInfo.conversion),
              p: +data.p % +popupInfo.conversion,
            },
          ]
        : [
            {
              ...popupInfo,
              b: +data.b + parseInt(+data.p / +popupInfo.conversion),
              p: +data.p % +popupInfo.conversion,
            },
          ]
      ).filter((a) => a.b || a.p || a.free),
    }));
    onSave();
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
                  <label
                    className="selectLabel flex"
                    style={{ width: "100px" }}
                  >
                    Box
                    <input
                      type="number"
                      name="route_title"
                      className="numberInput"
                      value={data?.b}
                      style={{ width: "100px" }}
                      onChange={(e) =>
                        setdata({
                          ...data,
                          b: e.target.value,
                        })
                      }
                      maxLength={42}
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
                      value={data?.p}
                      style={{ width: "100px" }}
                      onChange={(e) =>
                        setdata({
                          ...data,
                          p: e.target.value,
                        })
                      }
                      autoFocus={true}
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
