import { useState, useEffect,useRef } from "react";
import axios from "axios";
import Select from "react-select";
import { v4 as uuid } from "uuid";
import { AddCircle as AddIcon } from "@mui/icons-material";
export function OrderDetails({ order, onSave }) {
  const [counters, setCounters] = useState([]);
  const [itemsData, setItemsData] = useState([]);
  const [editOrder, setEditOrder] = useState(false);
  const [orderData,setOrderData]=useState()
  const [qty_details, setQtyDetails] = useState(false);
  const [focusedInputId, setFocusedInputId] = useState(0)
  const reactInputsRef = useRef({})
  useEffect(()=>{setOrderData(order)},[])
  const getItemsData = async () => {
    const response = await axios({
      method: "get",
      url: "/items/GetItemList",

      headers: {
        "Content-Type": "application/json",
      },
    });
    if (response.data.success) setItemsData(response.data.result);
  };

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
  useEffect(() => {
    getCounter();
    getItemsData();
  }, []);
  console.log(
    +order.status.map((a) => +a.stage || 0).reduce((c, d) => Math.max(c, d))
  );
  const jumpToNextIndex = id => {
    console.log(id)
    document.querySelector(`#${id}`).blur()
    const index = document.querySelector(`#${id}`).getAttribute('index')
    console.log('this is index', index)

    const nextElem = document.querySelector(`[index="${+index + 1}"]`)

    if (nextElem) {
      if (nextElem.id.includes('selectContainer-')) {
        console.log("next select container id: ", nextElem.id)
        reactInputsRef.current[nextElem.id.replace('selectContainer-', '')].focus()
      }
      else {
        console.log("next input id: ", nextElem.id)
        setFocusedInputId('')
        setTimeout(() => document.querySelector(`[index="${+index + 1}"]`).focus(), 250);
        return
      }
    } else {
      let nextElemId = uuid()
      setFocusedInputId(`selectContainer-${nextElemId}`)
      setTimeout(() => setOrderData(prev => ({
        ...prev,
        item_details: [...prev.item_details, { uuid: nextElemId, b: 0, p: 0, sr: prev.item_details.length + 1 }],
      })), 250);
    }
  }

  let listItemIndexCount = 0
  return (
    <>
      <div className="overlay">
        <div className="modal" style={{ height: "fit-content", width: "80vw" }}>
          <div className="inventory">
            <div
              className="accountGroup"
              id="voucherForm"
              action=""
              style={{
                height: "max-content",
                maxHeight: "500px",
                overflow: "scroll",
              }}
            >
              <div className="inventory_header">
                <h2>Order Details</h2>
              </div>

              <div className="topInputs">
                <div
                  className="inputGroup flex"
                  style={{
                    width: "100%",
                    flexDirection: "row",
                    justifyContent: "space-between",
                  }}
                >
                  <h2>
                    {counters.find((a) => a.counter_uuid === order.counter_uuid)
                      ?.counter_title || ""}
                  </h2>
                  <button
                    style={{ width: "fit-Content" }}
                    className="item-sales-search"
                    onClick={() => setEditOrder(true)}
                  >
                    Edit
                  </button>
                </div>
              </div>

              <div
                className="items_table"
                style={{ flex: "1", paddingLeft: "10px" }}
              >
                <table className="f6 w-100 center" cellSpacing="0">
                  <thead className="lh-copy" style={{ position: "static" }}>
                    <tr className="white">
                      <th className="pa2 tl bb b--black-20 w-30">Item Name</th>
                      <th className="pa2 tc bb b--black-20">Quantity(b)</th>
                      <th className="pa2 tc bb b--black-20">Quantity(p)</th>
                      <th className="pa2 tc bb b--black-20 ">Price</th>
                    </tr>
                  </thead>{" "}
                  <tbody className="lh-copy">
                    {orderData?.item_details?.map((item, i) => {
                      return (
                        <tr key={i} style={{ height: "50px" }}>
                          <td className="ph2 pv1 tl bb b--black-20 bg-white">
                            <div className="inputGroup">

                              {editOrder?
                               <Select
                               ref={ref => reactInputsRef.current[item.uuid] = ref}
                               id={"item_uuid" + item.uuid}
                               options={itemsData.sort((a, b) =>
                                 a.item_title.localeCompare(b.item_title)
                               ).map((a, j) => ({
                                 value: a.item_uuid,
                                 label: a.item_title + "______" + a.mrp,
                                 key: a.item_uuid,
                               }))} z
                               onChange={(e) => {
                                 setTimeout(() => setQtyDetails((prev) => !prev), 2000);
                                 setOrderData((prev) => ({
                                   ...prev,
                                   item_details: prev.item_details.map((a) =>
                                     a.uuid === item.uuid ? {
                                       ...a,
                                       ...itemsData.find(b => b.item_uuid === e.value),
                                     } : a
                                   ),
                                 }));
                                 jumpToNextIndex(`selectContainer-${item.uuid}`)
                               }}
                               value={itemsData.sort((a, b) => a.item_title.localeCompare(b.item_title))
                                 .filter((a) => a.item_uuid === item.uuid)
                                 .map((a, j) => ({
                                   value: a.item_uuid,
                                   label: a.item_title + "______" + a.mrp,
                                   key: a.item_uuid,
                                 }))[0]
                               }
                               openMenuOnFocus={true}
                               autoFocus={focusedInputId === `selectContainer-${item.uuid}` || (i === 0 && focusedInputId === 0)}
                               menuPosition="fixed"
                               menuPlacement="auto"
                               placeholder="Item"
                             />: itemsData.find(
                                (a) => a.item_uuid === item.item_uuid
                              )?.item_title || ""}
                            </div>
                          </td>
                          <td
                            className="ph2 pv1 tc bb b--black-20 bg-white"
                            style={{ textAlign: "center" }}
                          >
                            {editOrder?<input
                            id={"q" + item.uuid}
                            type="number"
                            className="numberInput"
                            onWheel={(e) => e.preventDefault()}
                            index={listItemIndexCount++}
                            value={item.b || ""}
                            onChange={e => {
                              setOrderData((prev) => {
                                setTimeout(() => setQtyDetails((prev) => !prev), 2000);
                                return {
                                  ...prev,
                                  item_details: prev.item_details.map((a) =>
                                    a.uuid === item.uuid
                                      ? { ...a, b: e.target.value }
                                      : a
                                  ),
                                };
                              });
                            }}
                            onFocus={e => e.target.select()}
                            onKeyDown={e => e.key === 'Enter' ? jumpToNextIndex("q" + item.uuid) : ''}
                            disabled={!item.item_uuid}
                          />:item.b || 0}
                          </td>
                          <td
                            className="ph2 pv1 tc bb b--black-20 bg-white"
                            style={{ textAlign: "center" }}
                          >
                            {editOrder?<input
                            id={"p" + item.uuid}
                            type="number"
                            className="numberInput"
                            onWheel={(e) => e.preventDefault()}
                            index={listItemIndexCount++}
                            value={item.p || ""}
                            onChange={(e) => {
                              setOrderData((prev) => {
                                setTimeout(() => setQtyDetails((prev) => !prev), 2000);
                                return {
                                  ...prev,
                                  item_details: prev.item_details.map((a) =>
                                    a.uuid === item.uuid
                                      ? { ...a, p: e.target.value }
                                      : a
                                  ),
                                };
                              });
                            }}
                            onFocus={e => e.target.select()}
                            onKeyDown={e => e.key === 'Enter' ? jumpToNextIndex("p" + item.uuid) : ''}
                            disabled={!item.item_uuid}
                          />: item.p || 0}
                          </td>
                          <td
                            className="ph2 pv1 tc bb b--black-20 bg-white"
                            style={{ textAlign: "center" }}
                          >
                            Rs {item?.item_price || 0}
                          </td>
                        </tr>

                      );
                    })}
                    {editOrder?<tr>
                      <td
                        onClick={() =>
                          setOrderData((prev) => ({
                            ...prev,
                            item_details: [
                              ...prev.item_details,
                              { uuid: uuid(), b: 0, p: 0 },
                            ],
                          }))
                        }
                      >
                        <AddIcon
                          sx={{ fontSize: 40 }}
                          style={{ color: "#4AC959", cursor: "pointer" }}
                        />
                      </td>
                    </tr>:""}
                  </tbody>
                </table>
              </div>
              <div className="bottomContent"></div>
            </div>
            <button onClick={onSave} className="closeButton">
              x
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
