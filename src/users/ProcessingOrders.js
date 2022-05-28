import axios from "axios";
import React, { useEffect, useState, useRef, createElement } from "react";
import { useParams } from "react-router-dom";
import { AiFillPlayCircle } from "react-icons/ai";
import { openDB } from "idb";
import { useSpeechSynthesis } from "react-speech-kit";

const ProcessingOrders = () => {
  // console.log(axios.defaults.baseURL)
  const params = useParams();
  const [orders, setOrders] = useState([]);
  const [items, setItems] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState();
  const { speak } = useSpeechSynthesis();
  const [orderSpeech, setOrderSpeech] = useState("");
  const [oneTime, setOneTime] = useState(false);
  const audiosRef = useRef();
  const [currentAudioId, setCurrentAudioId] = useState('')

  const log = message => {
    console.log(message)
    // const elem = document.querySelector('#console')
    // const onbottom = 363 < elem.scrollHeight - elem.scrollTop && elem.scrollHeight - elem.scrollTop < 402
    // const child = document.createElement('p')
    // child.innerText = JSON.stringify(message)
    // document.querySelector('#console').append(child)

    // if (!onbottom) return
    // const h = document.querySelector('#console').scrollHeight + 10
    // document.querySelector('#console').scrollBy(h, h)
  }

  const audioLoopFunction = ({ i, recall, forceStart }) => {
    try {
      log(`trying to play audio number : ${i + 1}`)

      navigator.mediaSession.setActionHandler('play', function () {
        log('--------------plays')
        audiosRef.current[i].play()
        navigator.mediaSession.playbackState = 'playing';
      });

      navigator.mediaSession.setActionHandler('pause', function () {
        log('--------------paused')
        audiosRef.current[i].pause()
        navigator.mediaSession.playbackState = 'paused';
      });

      audiosRef.current[i].play()
        .then(res => {
          if (!forceStart) {
            audiosRef.current[i].pause()
            navigator.mediaSession.playbackState = 'paused';
          }
          else
            navigator.mediaSession.playbackState = 'playing';
          log(`Playing ${i + 1}/${audiosRef.current.length} audios`)

          let intervalId = setInterval(() => {
            if (audiosRef.current[i]?.duration - audiosRef.current[i].currentTime > 1)
              return log(`returning : ${audiosRef.current[i]?.duration - audiosRef.current[i].currentTime}`)

            clearInterval(intervalId)
            if (!audiosRef.current[i + 1])
              return log(`no next audio : ${i + 1}`)

            setTimeout(() => {
              audioLoopFunction({ i: i + 1, forceStart, recall })
            }, 1000);

          }, 1000)
        })
        .catch(error => {

          if (recall)
            setTimeout(() => {
              log(`could not play ${i} audio : ${error.message} recall : ${recall}`)
              audioLoopFunction({ i, recall })
            }, 3000)
          else
            log(`could not play ${i} audio : ${error.message}`)
        })
    } catch (error) {
      log(error.message)
    }
  }

  const getTripOrders = async () => {

    const db = await openDB("BT", +localStorage.getItem("IDBVersion") || 1);
    let tx = db.transaction("items", "readonly").objectStore("items");
    let IDBItems = await tx.getAll();
    setItems(IDBItems);

    const response = await axios({
      method: "post",
      url: "/orders/GetOrderProcessingList",
      data: {
        trip_uuid: params.trip_uuid,
      },
    });
    if (response.data.success) setOrders(response.data.result);
    if (!response?.data?.result) return;
  };

  useEffect(() => {
    getTripOrders();
  }, []);

  useEffect(() => {
    if (!selectedOrder) return
    const audioElements = [];

    for (let i = 0; i < selectedOrder.item_details.length; i++) {
      const order_item = selectedOrder.item_details[i];
      const item = items.find(j => j.item_uuid === order_item.item_uuid);
      if (item) {
        const handleQty = (value, label, sufix) => value ? `${value} ${label}${value > 1 ? sufix : ''}` : '';
        const speechString = `Item ${item.pronounce} ${item.mrp} MRP ${handleQty(order_item.b, 'Box', 'es')} ${handleQty(order_item.p, 'Piece', 's')} Audio Should Be Longer Than 5 Seconds`;
        let audioElement = new Audio(`${axios.defaults.baseURL}/stream/${speechString.toLowerCase().replaceAll(' ', '_')}`);
        audioElement.id = order_item.item_uuid;
        audioElements.push(audioElement)
      }
    }

    log(audioElements)
    audiosRef.current = audioElements
    audioLoopFunction({ i: 0, recall: true })
    // storeAudios()
  }, [selectedOrder])

  // const PlayAudio = async () => {
  //   if (oneTime) {
  //     await speak({ text: "Order Completed" });
  //     return;
  //   }

  //   for (let item of selectedOrder.item_details) {
  //     setOrderSpeech(item.item_uuid);
  //     let detail = items.find((a) => a.item_uuid === item.item_uuid);
  //     console.log(detail);
  //     let data = `${detail.pronounce} ${item.b ? `${item.b} box` : ""} ${item.p ? `${item.p} pcs` : ""
  //       }`;
  //     await speak({ text: data });
  //     setTimeout(() => setOrderSpeech(""), 3000);
  //   }
  //   setOneTime(true);
  // };

  return (
    <div
      className="item-sales-container orders-report-container"
      style={{ width: "100%", left: "0", top: "0", textAlign: "center" }}
    >
      {selectedOrder ? (
        <>
          <h1>{selectedOrder.counter_title}</h1>
          <div className="flex" style={{ justifyContent: "left" }}>
            <h2 style={{ width: "40vw", textAlign: "start" }}>
              {selectedOrder.invoice_number}
            </h2>
            <button
              className="item-sales-search"
              style={{ width: "max-content" }}
              onClick={() => { audioLoopFunction({ i: 0 }) }}
            >
              Play
            </button>
          </div>
        </>
      ) : (
        ""
      )}
      <div
        className="table-container-user item-sales-container"
        style={{ width: "100%", left: "0", top: "0", display: "flex" }}
      >
        <table
          className="user-table"
          style={{
            maxWidth: "100vw",
            height: "fit-content",
            overflowX: "scroll",
          }}
        >
          <thead>
            <tr>
              {selectedOrder ? <th></th> : ""}
              <th>S.N</th>
              {selectedOrder ? (
                <>
                  <th colSpan={2}>
                    <div className="t-head-element">Item Name</div>
                  </th>
                  <th>
                    <div className="t-head-element">MRP</div>
                  </th>
                  <th>
                    <div className="t-head-element">Qty</div>
                  </th>
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
              ? selectedOrder.item_details?.map((item, i) => (
                <tr key={Math.random()} style={{ height: "30px" }}>
                  {selectedOrder ? (
                    <td
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        padding: "10px",
                      }}
                    >
                      {item.item_uuid === orderSpeech ? (
                        <AiFillPlayCircle
                          style={{ fontSize: "30px", cursor: "pointer" }}
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
                    {items.find((a) => a.item_uuid === item.item_uuid)?.mrp}
                  </td>
                  <td>{item.b + ":" + item.p}</td>
                </tr>
              ))
              : orders
                .sort((a, b) => a.created_at - b.created_at)
                ?.map((item, i) => (
                  <tr
                    key={Math.random()}
                    style={{ height: "30px" }}
                    onClick={() => setSelectedOrder(item)}
                  >
                    <td>{i + 1}</td>
                    <td colSpan={2}>{item.counter_title}</td>
                    <td colSpan={2}>0/{item?.item_details?.length || 0}</td>
                  </tr>
                ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ProcessingOrders;
