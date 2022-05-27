import { AiOutlineArrowLeft, AiOutlineSearch } from "react-icons/ai";
import { useState, useEffect } from "react";
import { openDB } from "idb";
import { useNavigate, useParams } from "react-router-dom";
import { AutoAdd, Billing } from "../functions";
import { v4 as uuid } from "uuid";
import axios from "axios";
const SelectedCounterOrder = () => {
  const [items, setItems] = useState([]);
  const [order, setOrder] = useState([]);
  const [cartPage, setCartPage] = useState(false);
  const [counters, setCounters] = useState([]);
  const [counter, setCounter] = useState({});
  const params = useParams();
  const [filterItemTitle, setFilterItemTile] = useState("");
  const [filterCompany, setFilterCompany] = useState("");
  const [itemsCategory, setItemsCategory] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [popupForm, setPopupForm] = useState(false);
  const Navigate = useNavigate();
  const getIndexedDbData = async () => {
    const db = await openDB("BT", +localStorage.getItem("IDBVersion") || 1);
    let tx = await db.transaction("items", "readwrite").objectStore("items");
    let item = await tx.getAll();
    setItems(item);
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
        box: 0,
        pcs: 0,
        status: 0,
      }))
    );
  }, [counter]);
  console.log(order);
  const postOrder = async (orderData) => {
    console.log(orderData);
    let data = {
      ...orderData,
      order_uuid: uuid(),
      item_details: orderData.items.map((a) => ({
        ...a,
        b: a.box,
        p: a.pcs,
        unit_price: a.price,
        gst_percentage: a.item_gst,
        status: 0,
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
      Navigate("/users");
    }
  };
  return (
    <>
      <div>
        <nav className="user_nav">
          <div className="user_menubar">
            <AiOutlineArrowLeft
              onClick={() => (cartPage ? Navigate(-1) : setCartPage(false))}
            />
          </div>
          {cartPage ? <h1>Cart</h1> : ""}
          <div className="user_searchbar flex">
            <AiOutlineSearch className="user_search_icon" />
            <input
              type="text"
              placeholder="search"
              value={filterItemTitle}
              onChange={(e) => setFilterItemTile(e.target.value)}
            />
          </div>
          {!cartPage ? (
            <div>
              <select
                value={filterCompany}
                onChange={(e) => setFilterCompany(e.target.value)}
              >
                {companies?.map((a) => (
                  <option value={a.company_uuid}>{a.company_title}</option>
                ))}
              </select>
            </div>
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
                      ?.sort((a, b) => a - b)
                      ?.map(
                        (category) =>
                          items.filter(
                            (a) => a.category_uuid === category.category_uuid
                          )?.length > 0 && (
                            <div
                              id={category?.category_uuid}
                              key={category?.category_uuid}
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
                                                      box:
                                                        +(a.box || 0) +
                                                        parseInt(
                                                          ((a?.pcs || 0) +
                                                            (+item?.one_pack ||
                                                              1)) /
                                                            +item.conversion
                                                        ),

                                                      pcs:
                                                        ((a?.pcs || 0) +
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
                                                    box:
                                                      +(a.box || 0) +
                                                      parseInt(
                                                        ((a?.pcs || 0) +
                                                          (+item?.one_pack ||
                                                            1)) /
                                                          +item.conversion
                                                      ),

                                                    pcs:
                                                      ((a?.pcs || 0) +
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
                                                  box:
                                                    +(a.box || 0) +
                                                    parseInt(
                                                      ((a?.pcs || 0) +
                                                        (+item?.one_pack ||
                                                          1)) /
                                                        +item.conversion
                                                    ),

                                                  pcs:
                                                    ((a?.pcs || 0) +
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

                                        <div className="item-mode">
                                          <h3 className={`item-price`}>
                                            Rs: {item?.item_price}
                                          </h3>
                                        </div>
                                      </div>
                                      <div className="menuleft">
                                        <input
                                          style={{ width: "50px" }}
                                          value={`${
                                            order?.items?.find(
                                              (a) =>
                                                a.item_uuid === item.item_uuid
                                            )?.box || 0
                                          } : ${
                                            order?.items?.find(
                                              (a) =>
                                                a.item_uuid === item.item_uuid
                                            )?.pcs || 0
                                          }`}
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            setPopupForm(item);
                                          }}
                                        />
                                      </div>
                                    </div>
                                  );
                                })}
                            </div>
                          )
                      )
                  : itemsCategory
                      ?.filter((a) => a.company_uuid === filterCompany)
                      ?.sort((a, b) => a - b)
                      ?.map(
                        (category) =>
                          order?.items.filter(
                            (a) => a.category_uuid === category.category_uuid
                          )?.length > 0 && (
                            <div
                              id={category?.category_uuid}
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
                                          items:
                                            prev?.items?.map((a) =>
                                              a.item_uuid === item.item_uuid
                                                ? {
                                                    ...a,
                                                    box:
                                                      +(a.box || 0) +
                                                      parseInt(
                                                        ((a?.pcs || 0) +
                                                          (+item?.one_pack ||
                                                            1)) /
                                                          +item.conversion
                                                      ),

                                                    pcs:
                                                      ((a?.pcs || 0) +
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
                                                box:
                                                  +(a.box || 0) +
                                                  parseInt(
                                                    ((a?.pcs || 0) +
                                                      (+item?.one_pack || 1)) /
                                                      +item.conversion
                                                  ),

                                                pcs:
                                                  ((a?.pcs || 0) +
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

                                        <div className="item-mode">
                                          <h3 className={`item-price`}>
                                            Rs: {item?.item_price}
                                          </h3>
                                        </div>
                                      </div>
                                      <div className="menuleft">
                                        <input
                                          style={{ width: "50px" }}
                                          value={`${
                                            order?.items?.find(
                                              (a) =>
                                                a.item_uuid === item.item_uuid
                                            )?.box || 0
                                          } : ${
                                            order?.items?.find(
                                              (a) =>
                                                a.item_uuid === item.item_uuid
                                            )?.pcs || 0
                                          }`}
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            setPopupForm(item);
                                          }}
                                        />
                                      </div>
                                    </div>
                                  );
                                })}
                            </div>
                          )
                      )}
              </div>
            </div>
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

      {cartPage ? (
        <>
          <button
            type="button"
            className="autoBtn"
            style={{ left: "20vw" }}
            onClick={async () => {
              Billing(counter, order.items, {
                stage: 1,
                user_uuid: localStorage.getItem("user_uuid"),
                time: new Date().getTime(),

                type: "NEW",
              }).then((data) => {
                setOrder((prev) => ({ ...prev, ...data }));
                postOrder({ ...order, ...data });
              });
            }}
          >
            Bill
          </button>
          <button
            type="button"
            className="autoBtn"
            onClick={async () => {
              let data = await AutoAdd(counter, order.items);

              setOrder((prev) => ({ ...prev, ...data }));
            }}
          >
            Auto
          </button>
        </>
      ) : (
        <button
          type="button"
          onClick={() => setCartPage(true)}
          className="autoBtn"
        >
          Cart
        </button>
      )}
    </>
  );
};

export default SelectedCounterOrder;

function NewUserForm({ onSave, popupInfo, setOrder, order }) {
  const [data, setdata] = useState({});
  const [errMassage, setErrorMassage] = useState("");
  useEffect(() => {
    let data = order.items?.find((a) => a.item_uuid === popupInfo.item_uuid);
    setdata({
      box: data?.box || 0,
      pcs: data?.pcs || 0,
    });
  }, []);
  const submitHandler = async (e) => {
    e.preventDefault();
    setOrder((prev) => ({
      ...prev,
      items: prev.items.filter((a) => a.item_uuid === popupInfo.item_uuid)
        ?.length
        ? prev?.items?.map((a) =>
            a.item_uuid === popupInfo.item_uuid
              ? {
                  ...a,
                  box: +data.box + parseInt(+data.pcs / +popupInfo.conversion),
                  pcs: +data.pcs % +popupInfo.conversion,
                }
              : a
          )
        : prev?.items?.length
        ? [
            ...prev.items,
            {
              ...popupInfo,
              box: +data.box + parseInt(+data.pcs / +popupInfo.conversion),
              pcs: +data.pcs % +popupInfo.conversion,
            },
          ]
        : [
            {
              ...popupInfo,
              box: +data.box + parseInt(+data.pcs / +popupInfo.conversion),
              pcs: +data.pcs % +popupInfo.conversion,
            },
          ],
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
                      type="text"
                      name="route_title"
                      className="numberInput"
                      value={data?.box}
                      style={{ width: "100px" }}
                      onChange={(e) =>
                        setdata({
                          ...data,
                          box: e.target.value,
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
                      type="text"
                      name="route_title"
                      className="numberInput"
                      value={data?.pcs}
                      style={{ width: "100px" }}
                      onChange={(e) =>
                        setdata({
                          ...data,
                          pcs: e.target.value,
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
