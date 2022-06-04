import axios from "axios";
import React, { useEffect, useState, useRef } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { AiFillPlayCircle } from "react-icons/ai";
import { openDB } from "idb";
import { useSpeechSynthesis } from "react-speech-kit";
import { Billing } from "../functions";
import { AiOutlineArrowLeft } from "react-icons/ai";

let intervalId = 0;
const ProcessingOrders = () => {
  const [BarcodeMessage, setBarcodeMessage] = useState([]);
  const [itemChanged, setItemChanged] = useState([]);
  const [popupDelivery, setPopupDelivery] = useState(false);
  const [popupBarcode, setPopupBarcode] = useState(false);
  const [holdPopup, setHoldPopup] = useState(false);
  const params = useParams();
  const [popupForm, setPopupForm] = useState(false);
  const [orders, setOrders] = useState([]);
  const [items, setItems] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [counters, setCounters] = useState([]);
  const [itemCategories, setItemsCategory] = useState([]);
  const [playCount, setPlayCount] = useState(1);
  const [selectedOrder, setSelectedOrder] = useState();
  const { speak } = useSpeechSynthesis();
  const [orderSpeech, setOrderSpeech] = useState("");
  const audiosRef = useRef();
  const Location = useLocation();
  const [playerSpeed, setPlayerSpeed] = useState(1);
  const [updateBilling, setUpdateBilling] = useState(false);
  const [orderCreated, setOrderCreated] = useState(false);
  const [oneTimeState, setOneTimeState] = useState(false);
  const [barcodeFilter, setBarcodeFilter] = useState("");
  const [barcodeFilterState, setBarcodeFilterState] = useState("");

  const Navigate = useNavigate();

  useEffect(() => {
    let data = sessionStorage.getItem("playCount");
    if (data) {
      setPlayCount(data);
    }
  }, []);

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
    store = await db
      .transaction("item_category", "readwrite")
      .objectStore("item_category");
    let route = await store.getAll();
    setItemsCategory(route);
    store = await db.transaction("counter", "readwrite").objectStore("counter");
    let countersData = await store.getAll();
    setCounters(countersData);
  };

  // const log = message => {
  //   console.log(message)
  //   const elem = document.querySelector('#console')
  //   const onbottom = 363 < elem.scrollHeight - elem.scrollTop && elem.scrollHeight - elem.scrollTop < 402
  //   const child = document.createElement('p')
  //   child.innerText = JSON.stringify(message)
  //   document.querySelector('#console').append(child)
  //   if (!onbottom) return
  //   const h = document.querySelector('#console').scrollHeight + 10
  //   document.querySelector('#console').scrollBy(h, h)
  // }

  const audioLoopFunction = ({ i, recall, forcePlayCount }) => {
    try {
      clearInterval(intervalId);

      if (audiosRef.current?.[i]?.getAttribute("played") === "true") {
        console.log(`skipped number : ${i + 1}`);
        audioLoopFunction({ i: i + 1, recall, forcePlayCount });
        return;
      }

      console.log(`trying to play audio number : ${i + 1}`);

      navigator.mediaSession.setActionHandler("play", function () {
        audiosRef.current[i].play();
        navigator.mediaSession.playbackState = "playing";
      });

      navigator.mediaSession.setActionHandler("pause", function () {
        audiosRef.current[i].pause();
        navigator.mediaSession.playbackState = "paused";
      });

      audiosRef.current[i]
        .play()
        .then((res) => {
          if (!forcePlayCount) {
            audiosRef.current[i].pause();
            navigator.mediaSession.playbackState = "paused";
            console.log(`Paused ${i + 1}/${audiosRef.current.length} audios`);
          } else {
            console.log(`Playing ${i + 1}/${audiosRef.current.length} audios`);
            navigator.mediaSession.playbackState = "playing";
            console.log("forcePlayCount:", forcePlayCount);
          }

          intervalId = setInterval(() => {
            if (
              audiosRef.current[i]?.duration -
                audiosRef.current[i].currentTime >
              8.8
            )
              return console.log(
                `returning : ${
                  audiosRef.current[i]?.duration -
                  audiosRef.current[i].currentTime
                }`
              );

            clearInterval(intervalId);
            audiosRef.current[i].currentTime = audiosRef.current[i].duration;
            audiosRef.current[i].pause();
            audiosRef.current[i].setAttribute("played", "true");
            navigator.mediaSession.playbackState = "paused";
            setItemChanged((prev) =>
              prev.filter((a) => a.item_uuid === audiosRef.current[i].item_uuid)
                .length
                ? [
                    ...prev.filter(
                      (a) => !(a.item_uuid === audiosRef.current[i].item_uuid)
                    ),
                  ]
                : [
                    ...prev,
                    selectedOrder.item_details.find(
                      (a) => a.item_uuid === audiosRef.current[i].item_uuid
                    ),
                  ]
            );
            setSelectedOrder((prev) => ({
              ...prev,
              item_details: prev.item_details.map((a) =>
                a.item_uuid === audiosRef.current[i].item_uuid
                  ? { ...a, status: 1 }
                  : a
              ),
            }));

            if (!audiosRef.current[i + 1])
              return console.log(`no next audio : ${i + 1}`);

            setTimeout(() => {
              audioLoopFunction({
                i: i + 1,
                forcePlayCount: forcePlayCount ? forcePlayCount - 1 : 0,
                recall,
              });
            }, 1000);
          }, 100);
        })
        .catch((error) => {
          if (recall)
            setTimeout(() => {
              console.log(
                `could not play ${i} audio : ${error.message} recall : ${recall}`
              );
              audioLoopFunction({ i, recall });
            }, 3000);
          else console.log(`could not play ${i} audio : ${error.message}`);
        });
    } catch (error) {
      console.log(error.message);
    }
  };
  console.log(selectedOrder);
  const getTripOrders = async () => {
    const db = await openDB("BT", +localStorage.getItem("IDBVersion") || 1);
    let tx = db.transaction("items", "readonly").objectStore("items");
    let IDBItems = await tx.getAll();
    setItems(IDBItems);

    const response = await axios({
      method: "post",
      url: `/orders/${
        Location.pathname.includes("checking")
          ? "GetOrderCheckingList"
          : Location.pathname.includes("delivery")
          ? "GetOrderDeliveryList"
          : "GetOrderProcessingList"
      }`,
      data: {
        trip_uuid: params.trip_uuid,
        user_uuid: localStorage.getItem("user_uuid"),
      },
    });
    console.log(response);
    if (response.data.success) setOrders(response.data.result);
    if (!response?.data?.result) return;
  };

  useEffect(() => {
    getTripOrders();
  }, []);

  useEffect(() => {
    if (!selectedOrder || audiosRef.current?.[0]) return;

    const audioElements = [];
    const unprocessedItems =
      selectedOrder?.item_details?.filter((a) => !a.status) || [];
    let progressCount = 0;

    for (let i = 0; i < unprocessedItems.length; i++) {
      const order_item = unprocessedItems[i];
      const item = items.find((j) => j.item_uuid === order_item.item_uuid);

      if (item) {
        console.log(item.item_title);
        const handleQty = (value, label, sufix) =>
          value ? `${value} ${label}${value > 1 ? sufix : ""}` : "";
        const speechString = `Item ${item.pronounce} ${
          item.mrp
        } MRP ${handleQty(order_item.b, "Box", "es")} ${handleQty(
          order_item.p,
          "Piece",
          "s"
        )}`;

        let audioElement = new Audio(
          `${axios.defaults.baseURL}/stream/${speechString
            .toLowerCase()
            .replaceAll(" ", "_")}`
        );

        audioElement.addEventListener(
          "durationchange",
          function (e) {
            if (audioElement.duration != Infinity) {
              audioElement.remove();
              console.log(audioElement.duration);
              audioElement.item_uuid = item.item_uuid;
              loopEndFunctioin(audioElement);
            }
          },
          false
        );

        audioElement.load();
        audioElement.currentTime = 24 * 60 * 60;
        audioElement.volume = 0;

        const loopEndFunctioin = (audio) => {
          audioElements.push(audio);
          console.log(`${++progressCount}/${unprocessedItems?.length}`);

          if (progressCount === unprocessedItems?.length) {
            console.log(audioElements);
            audiosRef.current = audioElements
              .sort(itemsSortFunction)
              .map((i) => {
                i.volume = 1;
                i.currentTime = 0;
                return i;
              });
            audioLoopFunction({ i: 0, recall: true });
          }
        };
      } else progressCount++;
    }
  }, [selectedOrder]);

  const postActivity = async (others = {}) => {
    let time = new Date();
    let data = {
      user_uuid: localStorage.getItem("user_uuid"),
      role: Location.pathname.includes("checking")
        ? "Checking"
        : Location.pathname.includes("delivery")
        ? "Delivery"
        : "Processing",
      narration:
        counters.find((a) => a.counter_uuid === selectedOrder.counter_uuid)
          ?.counter_title +
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

  const postOrderData = async () => {
    setPopupBarcode(false);
    let data = selectedOrder;
    if (updateBilling) {
      let billingData = await Billing({
        replacement: data.replacement,
        counter: counters.find(
          (a) => a.counter_uuid === selectedOrder.counter_uuid
        ),
        items: selectedOrder.item_details.map((a) => {
          let itemData = items.find((b) => a.item_uuid === b.item_uuid);
          return {
            ...itemData,
            ...a,
            price: itemData?.price || 0,
          };
        }),
      });
      data = {
        ...data,
        ...billingData,
        item_details: billingData.items,
      };
    }

    let time = new Date();
    if (
      data?.item_details?.filter((a) => +a.status === 1 || +a.status === 3)
        ?.length === data?.item_details.length &&
      Location.pathname.includes("processing")
    )
      data = {
        ...data,
        processing_canceled: data?.item_details?.filter((a) => +a.status === 3),
        status: [
          ...data.status,
          {
            stage: "2",
            time: time.getTime(),
            user_uuid: localStorage.getItem("user_uuid"),
          },
        ],
      };
    if (Location.pathname.includes("checking"))
      data = {
        ...data,
        status: [
          ...data.status,
          {
            stage: "3",
            time: time.getTime(),
            user_uuid: localStorage.getItem("user_uuid"),
          },
        ],
      };
    if (Location.pathname.includes("delivery"))
      data = {
        ...data,
        status: [
          ...data.status,
          {
            stage: "4",
            time: time.getTime(),
            user_uuid: localStorage.getItem("user_uuid"),
          },
        ],
      };

    data = Object.keys(data)
      .filter((key) => key !== "others" || key !== "items")
      .reduce((obj, key) => {
        obj[key] = data[key];
        return obj;
      }, {});

    console.log(data);
    const response = await axios({
      method: "put",
      url: "/orders/putOrders",
      data: [data],
      headers: {
        "Content-Type": "application/json",
      },
    });
    if (response.data.success) {
      console.log(response);
      sessionStorage.setItem("playCount", playCount);
      let dataItem = Location.pathname.includes("processing")
        ? itemChanged
        : data?.item_details;

      let qty = `${
        dataItem?.length > 1
          ? dataItem?.reduce((a, b) => (+a.b || 0) + (+b.b || 0))
          : dataItem?.length
          ? dataItem[0]?.b
          : 0
      }:${
        dataItem?.length > 1
          ? dataItem?.reduce((a, b) => (+a.p || 0) + (+b.p || 0))
          : dataItem?.length
          ? dataItem[0]?.p
          : 0
      }`;
      postActivity({
        activity:
          (Location.pathname.includes("checking")
            ? "Checking"
            : Location.pathname.includes("delivery")
            ? "Delivery"
            : "Processing") + " End",
        range: Location.pathname.includes("processing")
          ? itemChanged.length
          : data?.item_details?.length,
        qty,
        amt: data.order_grandtotal || 0,
      });
      setSelectedOrder(false);
      getTripOrders();
    }
  };

  useEffect(() => {
    if (!orderCreated && selectedOrder) {
      postActivity({
        activity:
          (Location.pathname.includes("checking")
            ? "Checking"
            : Location.pathname.includes("delivery")
            ? "Delivery"
            : "Processing") + " Start",
      });
      setOrderCreated(true);
    }
  }, [oneTimeState, selectedOrder]);

  const itemsSortFunction = (a, b) => {
    let aItem = items.find((i) => i.item_uuid === a.item_uuid);
    let bItem = items.find((i) => i.item_uuid === b.item_uuid);
    let aItemCompany = companies.find(
      (i) => i.company_uuid === aItem?.company_uuid
    );
    let bItemCompany = companies.find(
      (i) => i.company_uuid === bItem?.company_uuid
    );
    let aItemCategory = itemCategories.find(
      (i) => i.category_uuid === aItem?.category_uuid
    );
    let bItemCategory = itemCategories.find(
      (i) => i.category_uuid === bItem?.category_uuid
    );
    return (
      aItemCompany?.company_title?.localeCompare(bItemCompany?.company_title) ||
      aItemCategory?.category_title?.localeCompare(
        bItemCategory?.category_title
      ) ||
      aItem?.item_title?.localeCompare(bItem?.item_title)
    );
  };

  useEffect(() => {
    if (selectedOrder)
      setBarcodeFilterState(
        items?.map((a) => ({
          item_uuid: a.item_uuid,
          one_pack: a.one_pack,
          qty: 0,
          barcode: items.find((b) => a.item_uuid === b.item_uuid)?.barcode,
        }))
      );
  }, [selectedOrder]);
  const barcodeFilterUpdate = () => {
    if (
      barcodeFilterState.find(
        (a) =>
          a?.barcode?.filter((a) => a).filter((a) => a === barcodeFilter)
            ?.length
      )
    ) {
      setBarcodeFilterState((prev) =>
        prev.map((a) =>
          a?.barcode?.filter((a) => a).filter((a) => a === barcodeFilter)
            ?.length
            ? { ...a, qty: (+a.qty || 0) + (+a.one_pack || 1) }
            : a
        )
      );
    } else {
      setBarcodeFilterState((prev) =>
        prev.length
          ? [...prev, { barcode: [barcodeFilter], qty: 1 }]
          : { barcode: [barcodeFilter], qty: 1 }
      );
    }
    setBarcodeFilter("");
  };
  const checkingQuantity = () => {
    let data = [];
    for (let a of barcodeFilterState) {
      let orderItem = selectedOrder.item_details.find(
        (b) => b.item_uuid === a.item_uuid
      );
      let ItemData = items.find((b) => b.item_uuid === a.item_uuid);
      console.log(a.qty, ItemData);
      if (
        (+orderItem?.b || 0) * +(+ItemData?.conversion || 1) + orderItem?.p !==
        a?.qty
      ) {
        if (orderItem)
          setBarcodeMessage((prev) =>
            prev.length
              ? [
                  ...prev,
                  {
                    ...ItemData,
                    ...orderItem,
                    barcodeQty: a.qty,
                    case: 1,
                    qty:
                      (+orderItem?.b || 0) * +(+ItemData?.conversion || 1) +
                      orderItem?.p,
                  },
                ]
              : [
                  {
                    ...ItemData,
                    ...orderItem,
                    barcodeQty: a.qty,
                    case: 1,
                    qty:
                      (+orderItem?.b || 0) * +(+ItemData?.conversion || 1) +
                      orderItem?.p,
                  },
                ]
          );
        else if (ItemData && a?.qty)
          setBarcodeMessage((prev) =>
            prev.length
              ? [
                  ...prev,
                  {
                    ...ItemData,
                    barcodeQty: a.qty,
                    case: 2,
                    qty:
                      (+orderItem?.b || 0) * +(+ItemData?.conversion || 1) +
                      orderItem?.p,
                  },
                ]
              : [
                  {
                    ...ItemData,
                    barcodeQty: a.qty,
                    case: 2,
                    qty:
                      (+orderItem?.b || 0) * +(+ItemData?.conversion || 1) +
                      orderItem?.p,
                  },
                ]
          );
        else if (a?.qty)
          setBarcodeMessage((prev) =>
            prev.length
              ? [
                  ...prev,
                  {
                    ...a,
                    barcodeQty: a.qty,
                    case: 3,
                    qty:
                      (+orderItem?.b || 0) * +(+ItemData?.conversion || 1) +
                      orderItem?.p,
                  },
                ]
              : [
                  {
                    ...a,
                    barcodeQty: a.qty,
                    case: 3,
                    qty:
                      (+orderItem?.b || 0) * +(+ItemData?.conversion || 1) +
                      orderItem?.p,
                  },
                ]
          );
      }
    }
    setTimeout(() => setPopupBarcode(true), 2000);
  };
  console.log(BarcodeMessage);
  return (
    <div>
      <nav className="user_nav" style={{ top: "0" }}>
        <div className="user_menubar">
          <AiOutlineArrowLeft
            onClick={() => {
              if (selectedOrder) {
                setSelectedOrder(false);
                clearInterval(intervalId);
                audiosRef.current.forEach((audio) => audio.pause());
                navigator.mediaSession.playbackState = "none";
                audiosRef.current = null;
                console.clear();
              } else Navigate(-1);
            }}
          />
        </div>
      </nav>
      <div
        className="item-sales-container orders-report-container"
        style={{ width: "100%", left: "0", top: "50px", textAlign: "center" }}
      >
        {selectedOrder ? (
          <>
            <h1>{selectedOrder.counter_title}</h1>
            <div className="flex" style={{ justifyContent: "left" }}>
              <h2 style={{ width: "40vw", textAlign: "start" }}>
                {selectedOrder.invoice_number}
              </h2>
              {Location.pathname.includes("checking") ? (
                <input
                  type="text"
                  onChange={(e) => setBarcodeFilter(e.target.value)}
                  value={barcodeFilter}
                  placeholder="Search Barcode..."
                  className="searchInput"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") barcodeFilterUpdate();
                  }}
                />
              ) : !Location.pathname.includes("delivery") ? (
                <button
                  className="item-sales-search"
                  style={{ width: "max-content" }}
                  onClick={() =>
                    audioLoopFunction({ i: 0, forcePlayCount: +playCount })
                  }
                >
                  Play
                </button>
              ) : (
                ""
              )}
              <button
                className="item-sales-search"
                style={{
                  width: "max-content",
                  position: "fixed",
                  top: "50px",
                  right: 0,
                }}
                onClick={() => {
                  Location.pathname.includes("checking")
                    ? checkingQuantity()
                    : Location.pathname.includes("delivery")
                    ? setPopupDelivery(true)
                    : postOrderData();
                }}
              >
                Save
              </button>
              {!(
                Location.pathname.includes("checking") ||
                Location.pathname.includes("delivery")
              ) ? (
                <>
                  <input
                    className="searchInput"
                    style={{
                      position: "fixed",
                      top: "100px",
                      right: "80px",
                      border: "none",
                      borderBottom: "2px solid black",
                      borderRadius: "0px",
                      width: "50px",
                      padding: "0 5px",
                    }}
                    value={playCount}
                    onChange={(e) => setPlayCount(e.target.value)}
                  />
                  <select
                    className="audioPlayerSpeed"
                    style={{
                      position: "fixed",
                      top: "100px",
                      right: "0px",
                      border: "none",
                      borderBottom: "2px solid black",
                      borderRadius: "0px",
                      width: "75px",
                      padding: "0 5px",
                    }}
                    defaultValue={playerSpeed}
                    onChange={(e) => {
                      console.log(e.target.value);
                      setPlayerSpeed(e.target.value);
                      audiosRef.current.forEach(
                        (i) => (i.playbackRate = +e.target.value)
                      );
                    }}
                  >
                    <option value="1">1x</option>
                    <option value="1.25">1.25x</option>
                    <option value="1.50">1.50x</option>
                  </select>
                </>
              ) : (
                ""
              )}
            </div>
          </>
        ) : (
          ""
        )}
        <div
          className="table-container-user item-sales-container"
          style={{
            width: "100vw",
            overflow: "scroll",
            left: "0",
            top: "0",
            display: "flex",
          }}
        >
          {!selectedOrder ? (
            <button
              className="item-sales-search"
              style={{
                width: "max-content",
                position: "fixed",
                top: "0",
                right: "0",
              }}
              onClick={() => setHoldPopup(true)}
            >
              Hold
            </button>
          ) : (
            ""
          )}
          <table
            className="user-table"
            style={{
              width:
                Location.pathname.includes("checking") ||
                Location.pathname.includes("delivery")
                  ? "100"
                  : selectedOrder
                  ? "max-content"
                  : "100%",
              height: "fit-content",
            }}
          >
            <thead>
              <tr>
                {selectedOrder &&
                !(
                  Location.pathname.includes("checking") ||
                  Location.pathname.includes("delivery")
                ) ? (
                  <th></th>
                ) : (
                  ""
                )}
                <th>S.N</th>
                {selectedOrder ? (
                  <>
                    <th colSpan={2}>
                      <div className="t-head-element">Item Name</div>
                    </th>
                    <th>
                      <div className="t-head-element">MRP</div>
                    </th>
                    {!Location.pathname.includes("checking") ? (
                      <>
                        <th>
                          <div className="t-head-element">Qty</div>
                        </th>
                        {!Location.pathname.includes("delivery") ? (
                          <th>
                            <div className="t-head-element">Action</div>
                          </th>
                        ) : (
                          ""
                        )}
                      </>
                    ) : (
                      ""
                    )}
                  </>
                ) : (
                  <>
                    <th colSpan={2}>
                      <div className="t-head-element">Counter Title</div>
                    </th>
                    <th colSpan={2}>
                      <div className="t-head-element">Progress</div>
                    </th>
                  </>
                )}
              </tr>
            </thead>
            <tbody className="tbody">
              {selectedOrder
                ? selectedOrder.item_details
                    ?.sort(itemsSortFunction)
                    ?.map((item, i) => (
                      <tr
                        key={item.item_uuid}
                        style={{
                          height: "30px",
                          backgroundColor:
                            +item.status === 1
                              ? "green"
                              : +item.status === 2
                              ? "yellow"
                              : +item.status === 3
                              ? "red"
                              : "#fff",
                          color:
                            +item.status === 1 || +item.status === 3
                              ? "#fff"
                              : "#000",
                        }}
                      >
                        {selectedOrder &&
                        !(
                          Location.pathname.includes("checking") ||
                          Location.pathname.includes("delivery")
                        ) ? (
                          <td
                            style={{
                              padding: "10px",

                              height: "50px",
                            }}
                            onClick={() => {
                              setItemChanged((prev) =>+item.status!==1?
                              prev.filter(
                                (a) => a.item_uuid === item.item_uuid
                              ).length
                                ? [
                                    ...prev.filter(
                                      (a) =>
                                        !(
                                          a.item_uuid === item.item_uuid
                                        )
                                    ),
                                  ]
                                : [
                                    ...prev,
                                    selectedOrder.item_details.find(
                                      (a) =>
                                        a.item_uuid === item.item_uuid
                                    ),
                                  ]:prev
                            );
                              setOneTimeState();
                              setSelectedOrder((prev) => ({
                                ...prev,
                                item_details: prev.item_details.map((a) =>
                                  a.item_uuid === item.item_uuid
                                    ? { ...a, status: +a.status === 1 ? 0 : 1 }
                                    : a
                                ),
                              }));
                            }}
                          >
                            {item.item_uuid === orderSpeech ? (
                              <AiFillPlayCircle
                                style={{ fontSize: "25px", cursor: "pointer" }}
                              />
                            ) : (
                              ""
                            )}
                          </td>
                        ) : (
                          ""
                        )}
                        <td>{i + 1}</td>
                        <td colSpan={2}>
                          {
                            items.find((a) => a.item_uuid === item.item_uuid)
                              ?.item_title
                          }
                        </td>
                        <td>
                          {
                            items.find((a) => a.item_uuid === item.item_uuid)
                              ?.mrp
                          }
                        </td>
                        {!Location.pathname.includes("checking") ? (
                          <>
                            <td
                              onClick={() => {
                                setOneTimeState();
                                setPopupForm(
                                  items.find(
                                    (a) => a.item_uuid === item.item_uuid
                                  )
                                );
                              }}
                            >
                              {item.b + ":" + item.p}
                            </td>
                            {!Location.pathname.includes("delivery") ? (
                              <td className="flex">
                                <button
                                  className="item-sales-search"
                                  style={{ width: "max-content" }}
                                  onClick={() => {
                                    setOneTimeState();
                                    
                                    setSelectedOrder((prev) => ({
                                      ...prev,
                                      item_details: prev.item_details.map((a) =>
                                        a.item_uuid === item.item_uuid
                                          ? {
                                              ...a,
                                              status: +a.status === 2 ? 0 : 2,
                                            }
                                          : a
                                      ),
                                    }));
                                  }}
                                >
                                  Hold
                                </button>
                                <button
                                  className="item-sales-search"
                                  style={{ width: "max-content" }}
                                  onClick={() => {
                                    setOneTimeState();
                                  
                                    setSelectedOrder((prev) => ({
                                      ...prev,
                                      item_details: prev.item_details.map((a) =>
                                        a.item_uuid === item.item_uuid
                                          ? {
                                              ...a,
                                              status: +a.status === 3 ? 0 : 3,
                                            }
                                          : a
                                      ),
                                    }));
                                  }}
                                >
                                  Cancel
                                </button>
                              </td>
                            ) : (
                              ""
                            )}
                          </>
                        ) : (
                          ""
                        )}
                      </tr>
                    ))
                : orders
                    ?.sort((a, b) => a.created_at - b.created_at)
                    ?.map((item, i) => (
                      <tr
                        key={Math.random()}
                        style={{ height: "30px" }}
                        onClick={() => setSelectedOrder(item)}
                      >
                        <td>{i + 1}</td>
                        <td colSpan={2}>{item.counter_title}</td>
                        <td colSpan={2}>
                          {
                            item?.item_details?.filter((a) => +a.status === 1)
                              ?.length
                          }
                          /{item?.item_details?.length || 0}
                        </td>
                      </tr>
                    ))}
            </tbody>
          </table>
        </div>
      </div>
      {popupForm ? (
        <NewUserForm
          onSave={() => setPopupForm(false)}
          setOrder={setSelectedOrder}
          popupInfo={popupForm}
          order={selectedOrder}
          setUpdateBilling={setUpdateBilling}
          deliveryPage={Location.pathname.includes("delivery")}
        />
      ) : (
        ""
      )}
      {popupBarcode ? (
        <CheckingValues
          onSave={() => setPopupBarcode(false)}
          BarcodeMessage={BarcodeMessage}
          postOrderData={postOrderData}
        />
      ) : (
        ""
      )}
      {popupDelivery ? (
        <DiliveryPopup
          onSave={() => setPopupDelivery(false)}
          postOrderData={postOrderData}
          order_uuid={selectedOrder?.order_uuid}
          setSelectedOrder={setSelectedOrder}
        />
      ) : (
        ""
      )}
      {holdPopup ? (
        <HoldPopup
          onSave={() => setHoldPopup(false)}
          orders={orders}
          itemsData={items}
        />
      ) : (
        ""
      )}
    </div>
  );
};

export default ProcessingOrders;
function CheckingValues({ onSave, BarcodeMessage, postOrderData }) {
  return (
    <div className="overlay">
      <div
        className="modal"
        style={{ height: "fit-content", width: "max-content" }}
      >
        <h1>Correction</h1>
        <div
          className="content"
          style={{
            height: "fit-content",
            padding: "20px",
            width: "fit-content",
          }}
        >
          <div style={{ overflowY: "scroll" }}>
            {BarcodeMessage?.filter((a) => +a.case === 1 && a.barcodeQty)
              .length ? (
              <div
                className="flex"
                style={{ flexDirection: "column", width: "100%" }}
              >
                {" "}
                <i>Incorrect Quantity</i>
                <table
                  className="user-table"
                  style={{
                    width: "max-content",
                    height: "fit-content",
                  }}
                >
                  <thead>
                    <tr style={{ color: "#fff", backgroundColor: "#7990dd" }}>
                      <th colSpan={2}>
                        <div className="t-head-element">Item</div>
                      </th>
                      <th>
                        <div className="t-head-element">MRP</div>
                      </th>
                      <th style={{ backgroundColor: "green" }}>
                        <div className="t-head-element">Order</div>
                      </th>
                      <th style={{ backgroundColor: "red" }}>
                        <div className="t-head-element">Checking</div>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="tbody">
                    {BarcodeMessage?.filter(
                      (a) => +a.case === 1 && a.barcodeQty
                    )?.map((item, i) => (
                      <tr
                        key={item?.item_uuid || Math.random()}
                        style={{
                          height: "30px",
                          color: "#fff",
                          backgroundColor: "#7990dd",
                        }}
                      >
                        <td colSpan={2}>{item.item_title}</td>
                        <td>{item?.mrp || 0}</td>
                        <td style={{ backgroundColor: "green" }}>
                          {item?.b || 0}:{item?.p || 0}
                        </td>
                        <td style={{ backgroundColor: "red" }}>
                          {item?.barcodeQty || 0}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              ""
            )}
            {BarcodeMessage?.filter((a) => +a.case === 2).length ? (
              <div className="flex" style={{ flexDirection: "column" }}>
                {" "}
                <i>Remove Extra Items</i>
                <table
                  className="user-table"
                  style={{
                    width: "max-content",
                    height: "fit-content",
                    backgroundColor: "yellow",
                    color: "#fff",
                  }}
                >
                  <thead>
                    <tr style={{ color: "#fff", backgroundColor: "red" }}>
                      <th colSpan={2}>
                        <div className="t-head-element">Item</div>
                      </th>
                      <th>
                        <div className="t-head-element">MRP</div>
                      </th>
                      <th>
                        <div className="t-head-element">Checking</div>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="tbody">
                    {BarcodeMessage?.filter((a) => +a.case === 2)?.map(
                      (item, i) => (
                        <tr
                          key={item?.item_uuid || Math.random()}
                          style={{
                            height: "30px",
                            color: "#fff",
                            backgroundColor: "red",
                          }}
                        >
                          <td colSpan={2}>{item.item_title}</td>
                          <td>{item?.mrp || 0}</td>
                          <td>{item?.barcodeQty}</td>
                        </tr>
                      )
                    )}
                  </tbody>
                </table>
              </div>
            ) : (
              ""
            )}
            {BarcodeMessage?.filter((a) => +a.case === 1 && !a.barcodeQty)
              .length ? (
              <div className="flex" style={{ flexDirection: "column" }}>
                {" "}
                <i>Add Items</i>
                <table
                  className="user-table"
                  style={{
                    width: "max-content",
                    height: "fit-content",
                    backgroundColor: "yellow",
                    color: "#000",
                  }}
                >
                  <thead>
                    <tr style={{ color: "#000", backgroundColor: "#ffbf00" }}>
                      <th colSpan={2}>
                        <div className="t-head-element">Item</div>
                      </th>
                      <th>
                        <div className="t-head-element">MRP</div>
                      </th>
                      <th>
                        <div className="t-head-element">Order</div>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="tbody">
                    {BarcodeMessage?.filter(
                      (a) => +a.case === 1 && !a.barcodeQty
                    )?.map((item, i) => (
                      <tr
                        key={item?.item_uuid || Math.random()}
                        style={{
                          height: "30px",
                          color: "#000",
                          backgroundColor: "#ffbf00",
                        }}
                      >
                        <td colSpan={2}>{item.item_title}</td>
                        <td>{item?.mrp || 0}</td>
                        <td>
                          {item?.b || 0}:{item?.p || 0}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              ""
            )}
            {BarcodeMessage?.filter((a) => +a.case === 3).length ? (
              <div
                className="flex"
                style={{ flexDirection: "column", width: "100%" }}
              >
                {" "}
                <i>Unknown Barcode</i>
                <table
                  className="user-table"
                  style={{
                    width: "100%",
                    height: "fit-content",
                    backgroundColor: "yellow",
                    color: "#fff",
                    border: "2px solid #000",
                  }}
                >
                  <thead>
                    <tr style={{ color: "#000", backgroundColor: "#fff" }}>
                      <th colSpan={2}>
                        <div className="t-head-element">Barcode</div>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="tbody">
                    {BarcodeMessage?.filter((a) => +a.case === 3)?.map(
                      (item, i) => (
                        <tr
                          key={item?.item_uuid || Math.random()}
                          style={{
                            height: "30px",
                            color: "#000",
                            backgroundColor: "#fff",
                          }}
                        >
                          <td colSpan={2}>{item.barcode[0]}</td>
                        </tr>
                      )
                    )}
                  </tbody>
                </table>
              </div>
            ) : (
              ""
            )}
            <div className="flex" style={{ justifyContent: "space-between" }}>
              <button
                type="button"
                style={{ backgroundColor: "red" }}
                className="submit"
                onClick={onSave}
              >
                Cancel
              </button>
              <button type="button" className="submit" onClick={postOrderData}>
                Save
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
function HoldPopup({ onSave, orders, itemsData }) {
  const [items, setItems] = useState([]);
  useEffect(() => {
    let data = [].concat
      .apply(
        [],
        orders.map((a) => a.item_details)
      )
      .filter((a) => a.status === 2)
      .map((a) => ({
        ...a,
        item_title: itemsData?.find((b) => b.item_uuid === a.item_uuid)
          ?.item_title,
      }));
    console.log(data);
    let result = data.reduce((acc, curr) => {
      let item = acc.find((item) => item.item_uuid === curr.item_uuid);

      if (item) {
        item.p = +item.p + curr.p;
        item.b = +item.b + curr.b;
      } else {
        acc.push(curr);
      }

      return acc;
    }, []);
    console.log(result);
    setItems(result);
  }, []);

  return (
    <div className="overlay">
      <div
        className="modal"
        style={{
          height: "fit-content",
          width: "max-content",
          minWidth: "400px",
        }}
      >
        <h1>Hold</h1>
        <div
          className="content"
          style={{
            height: "fit-content",
            padding: "20px",
            width: "fit-content",
          }}
        >
          <div style={{ overflowY: "scroll" }}>
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
                      <th colSpan={2}>
                        <div className="t-head-element">Item</div>
                      </th>
                      <th>
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
                          backgroundColor: "#7990dd",
                        }}
                      >
                        <td colSpan={2}>{item.item_title}</td>
                        <td>
                          {item?.b || 0} : {item?.p || 0}
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

            {/* <div className="flex" style={{ justifyContent: "space-between" }}>
              <button
                type="button"
                style={{ backgroundColor: "red" }}
                className="submit"
                onClick={onSave}
              >
                Cancel
              </button>
              <button type="button" className="submit" onClick={postOrderData}>
                Save
              </button>
            </div> */}
          </div>
          <button onClick={onSave} className="closeButton">
            x
          </button>
        </div>
      </div>
    </div>
  );
}
function DiliveryPopup({
  onSave,
  postOrderData,
  order_uuid,
  setSelectedOrder,
}) {
  const [PaymentModes, setPaymentModes] = useState([]);
  const [modes, setModes] = useState([]);
  const [error, setError] = useState("");
  const [popup, setPopup] = useState(false);
  const [data, setData] = useState({});

  const GetPaymentModes = async () => {
    const response = await axios({
      method: "get",
      url: "/paymentModes/GetPaymentModesList",

      headers: {
        "Content-Type": "application/json",
      },
    });
    if (response.data.success) setPaymentModes(response.data.result);
  };
  useEffect(() => {
    GetPaymentModes();
  }, []);
  useEffect(() => {
    if (PaymentModes.length)
      setModes(
        PaymentModes.map((a) => ({
          ...a,
          amt: "",
          coin: "",
          status: a.mode_title === "UPI" ? "0" : 1,
        }))
      );
  }, [PaymentModes]);
  const submitHandler = async () => {
    setSelectedOrder((prev) => ({ ...prev, replacement: data.actual }));
    let obj = modes.find((a) => a.mode_title === "Cash");
    if (obj?.amt && obj?.coin === "") {
      setError("Enter Coins");
      return;
    }
    let time = new Date();
    obj = {
      user_uuid: localStorage.getItem("user_uuid"),
      time: time.getTime(),
      order_uuid,
      modes,
    };
    const response = await axios({
      method: "post",
      url: "/receipts/postReceipt",
      data: obj,
      headers: {
        "Content-Type": "application/json",
      },
    });
    if (response.data.success) {
      postOrderData();
      onSave();
    }
  };
  return (
    <>
      <div className="overlay">
        <div
          className="modal"
          style={{ height: "fit-content", width: "max-content" }}
        >
          <h1>Payments</h1>
          <div
            className="content"
            style={{
              height: "fit-content",
              padding: "20px",
              width: "fit-content",
            }}
          >
            <div style={{ overflowY: "scroll" }}>
              <form className="form">
                <div className="formGroup">
                  {PaymentModes.map((item) => (
                    <div
                      className="row"
                      style={{ flexDirection: "row", alignItems: "center" }}
                      key={item.mode_uuid}
                    >
                      <div style={{ width: "50px" }}>{item.mode_title}</div>
                      <label
                        className="selectLabel flex"
                        style={{ width: "150px" }}
                      >
                        <input
                          type="number"
                          name="route_title"
                          className="numberInput"
                          value={
                            modes.find((a) => a.mode_uuid === item.mode_uuid)
                              ?.amt
                          }
                          style={{ width: "150px" }}
                          onChange={(e) =>
                            setModes((prev) =>
                              prev.map((a) =>
                                a.mode_uuid === item.mode_uuid
                                  ? {
                                      ...a,
                                      amt: e.target.value,
                                    }
                                  : a
                              )
                            )
                          }
                          maxLength={42}
                        />
                        {/* {popupInfo.conversion || 0} */}
                      </label>
                      {item.mode_title === "Cash" ? (
                        <label
                          className="selectLabel flex"
                          style={{ width: "100px" }}
                        >
                          <input
                            type="number"
                            name="route_title"
                            className="numberInput"
                            placeholder="Coins"
                            value={
                              modes.find((a) => a.mode_uuid === item.mode_uuid)
                                ?.coin
                            }
                            style={{ width: "100px" }}
                            onChange={(e) =>
                              setModes((prev) =>
                                prev.map((a) =>
                                  a.mode_uuid === item.mode_uuid
                                    ? {
                                        ...a,
                                        coin: e.target.value,
                                      }
                                    : a
                                )
                              )
                            }
                            maxLength={42}
                          />
                        </label>
                      ) : (
                        ""
                      )}
                    </div>
                  ))}

                  <div
                    className="row"
                    style={{ flexDirection: "row", alignItems: "center" }}
                  >
                    <button
                      type="button"
                      className="submit"
                      style={{ color: "#fff", backgroundColor: "#7990dd" }}
                      onClick={() => setPopup(true)}
                    >
                      Replacement
                    </button>
                  </div>
                  <i style={{ color: "red" }}>{error}</i>
                </div>

                <div
                  className="flex"
                  style={{ justifyContent: "space-between" }}
                >
                  <button
                    type="button"
                    style={{ backgroundColor: "red" }}
                    className="submit"
                    onClick={onSave}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    className="submit"
                    onClick={submitHandler}
                  >
                    Save
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
      {popup ? (
        <DiliveryReplaceMent
          onSave={() => setPopup(false)}
          setData={setData}
          data={data}
        />
      ) : (
        ""
      )}
    </>
  );
}
function DiliveryReplaceMent({ onSave, data, setData }) {
  return (
    <div className="overlay">
      <div
        className="modal"
        style={{ height: "fit-content", width: "max-content" }}
      >
        <h1>Payments</h1>
        <div
          className="content"
          style={{
            height: "fit-content",
            padding: "20px",
            width: "fit-content",
          }}
        >
          <div style={{ overflowY: "scroll" }}>
            <form className="form">
              <div className="formGroup">
                <div
                  className="row"
                  style={{ flexDirection: "row", alignItems: "center" }}
                >
                  <div style={{ width: "50px" }}>MRP</div>
                  <label
                    className="selectLabel flex"
                    style={{ width: "150px" }}
                  >
                    <input
                      type="number"
                      name="route_title"
                      className="numberInput"
                      value={data.mrp}
                      style={{ width: "150px" }}
                      onChange={(e) =>
                        setData((prev) => ({
                          mrp: e.target.value,
                          actual: +e.target.value * 0.8,
                        }))
                      }
                      maxLength={42}
                    />
                    {/* {popupInfo.conversion || 0} */}
                  </label>
                </div>
                <div
                  className="row"
                  style={{ flexDirection: "row", alignItems: "center" }}
                >
                  <div style={{ width: "50px" }}>Actual</div>
                  <label
                    className="selectLabel flex"
                    style={{ width: "150px" }}
                  >
                    <input
                      type="number"
                      name="route_title"
                      className="numberInput"
                      value={data.actual}
                      style={{ width: "150px" }}
                      onChange={(e) =>
                        setData((prev) => ({
                          actual: e.target.value,
                        }))
                      }
                      maxLength={42}
                    />
                    {/* {popupInfo.conversion || 0} */}
                  </label>
                </div>

                <div
                  className="row"
                  style={{ flexDirection: "row", alignItems: "center" }}
                >
                  <button
                    type="button"
                    className="submit"
                    style={{ color: "#fff", backgroundColor: "#7990dd" }}
                  >
                    Replacement
                  </button>
                </div>
              </div>

              <div className="flex" style={{ justifyContent: "space-between" }}>
                <button
                  type="button"
                  style={{ backgroundColor: "red" }}
                  className="submit"
                  onClick={onSave}
                >
                  Cancel
                </button>
                <button type="button" className="submit" onClick={onSave}>
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
function NewUserForm({
  onSave,
  popupInfo,
  setOrder,
  order,
  setUpdateBilling,
  deliveryPage,
}) {
  const [data, setdata] = useState({});
  useEffect(() => {
    let data = order?.item_details?.find(
      (a) => a.item_uuid === popupInfo.item_uuid
    );
    setdata({
      b: data?.b || 0,
      p: data?.p || 0,
    });
  }, []);
  const submitHandler = async (e) => {
    e.preventDefault();
    setOrder((prev) => ({
      ...prev,
      delivery_return: deliveryPage
        ? prev.delivery_return.length
          ? prev.delivery_return.filter(
              (a) => a.item_uuid === popupInfo.item_uuid
            )
            ? prev.delivery_return.map((a) =>
                a.item_uuid === popupInfo.item_uuid
                  ? {
                      item_uuid: popupInfo.item_uuid,
                      b:
                        +data.b -
                        (+prev?.item_details?.find(
                          (a) => a.item_uuid === popupInfo.item_uuid
                        )?.b || 0),
                      p:
                        +data.p -
                        (+prev?.item_details?.find(
                          (a) => a.item_uuid === popupInfo.item_uuid
                        )?.p || 0),
                    }
                  : a
              )
            : [
                ...prev.delivery_return,
                {
                  item_uuid: popupInfo.item_uuid,
                  b:
                    +data.b -
                    (+prev?.item_details?.find(
                      (a) => a.item_uuid === popupInfo.item_uuid
                    )?.b || 0),
                  p:
                    +data.p -
                    (+prev?.item_details?.find(
                      (a) => a.item_uuid === popupInfo.item_uuid
                    )?.p || 0),
                },
              ]
          : [
              {
                item_uuid: popupInfo.item_uuid,
                b:
                  +data.b -
                  (+prev?.item_details?.find(
                    (a) => a.item_uuid === popupInfo.item_uuid
                  )?.b || 0),
                p:
                  +data.p -
                  (+prev?.item_details?.find(
                    (a) => a.item_uuid === popupInfo.item_uuid
                  )?.p || 0),
              },
            ]
        : [],
      item_details: prev.item_details.filter(
        (a) => a.item_uuid === popupInfo.item_uuid
      )?.length
        ? prev?.item_details?.map((a) => {
            if (a.item_uuid === popupInfo.item_uuid)
              return {
                ...a,
                b: +data.b + parseInt(+data.p / (+popupInfo.conversion || 1)),
                p: +data.p % (+popupInfo.conversion || 1),
              };
            else return a;
          })
        : prev?.item_details?.length
        ? [
            ...prev.item_details,
            {
              ...popupInfo,
              b: +data.b + parseInt(+data.p / (+popupInfo.conversion || 1)),
              p: +data.p % (+popupInfo.conversion || 1),
            },
          ]
        : [
            {
              ...popupInfo,
              b: +data.b + parseInt(+data.p / (+popupInfo.conversion || 1)),
              p: +data.p % (+popupInfo.conversion || 1),
            },
          ],
    }));
    setUpdateBilling(true);
    onSave();
  };
  console.log(popupInfo);
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
                      type="text"
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
                      maxLength={42}
                    />
                  </label>
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
