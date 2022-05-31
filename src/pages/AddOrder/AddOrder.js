import axios from "axios";
import { useEffect, useState } from "react";
import Header from "../../components/Header";
import Sidebar from "../../components/Sidebar";
import "./index.css";
import Select from "react-select";
import { AddCircle as AddIcon } from "@mui/icons-material";
import { v4 as uuid } from "uuid";
export default function AddOrder() {
  const [counters, setCounters] = useState([]);
  const [itemsData, setItemsData] = useState([]);
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
  const [order, setOrder] = useState({
    counter_uuid: "",
    item_details: [{ uuid: uuid() }],
  });

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
  console.log(order)
  return (
    <>
      <Sidebar />
      <div className="right-side">
        <Header />
        <div className="inventory">
          <form
            className="accountGroup"
            id="voucherForm"
            action=""
            // onSubmit={type === 'edit' ? handleEdit : handleSave}
          >
            <div className="inventory_header">
              <h2>Add Order </h2>
              {/* {type === 'edit' && <XIcon className='closeicon' onClick={close} />} */}
            </div>

            <div className="topInputs">
              <div className="inputGroup">
                <label htmlFor="Warehouse">Counter</label>
                <select
                  required
                  value={order.counter_uuid}
                  onChange={(e) =>
                    setOrder((prev) => ({
                      ...prev,
                      counter_uuid: e.target.value,
                    }))
                  }
                >
                  <option value="" disabled>
                    Select
                  </option>
                  {counters?.map((a, i) => (
                    <option key={a.counter_uuid} value={a.counter_uuid}>
                      {a.counter_title}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div
              className="items_table"
              style={{ flex: "1", paddingLeft: "10px", height: "auto" }}
            >
              <table className="f6 w-100 center" cellSpacing="0">
                <thead className="lh-copy">
                  <tr className="white">
                    <th className="pa2 tl bb b--black-20 w-30">Item Name</th>
                    <th className="pa2 tc bb b--black-20">Quantity(b)</th>
                    <th className="pa2 tc bb b--black-20">Quantity(p)</th>
                    <th className="pa2 tc bb b--black-20 ">Price</th>
                  </tr>
                </thead>
                <tbody className="lh-copy">
                  {order?.item_details?.map((item, i) => {
                    return (
                      <tr key={i}>
                        <td className="ph2 pv1 tl bb b--black-20 bg-white">
                          <div className="inputGroup">
                            <select
                              onChange={(e) => {
                                setOrder((prev) => ({
                                  ...prev,
                                  item_details: prev.item_details.map((a) =>
                                    a.uuid === item.uuid
                                      ? {
                                          ...a,
                                          ...itemsData.find(
                                            (b) => b.item_uuid === e.target.value
                                          ),
                                        }
                                      : a
                                  ),
                                }));
                              }}
                              value={
                                item?.item_uuid || null
                              }
                              menuPosition="fixed"
                              menuPlacement="auto"
                              placeholder="Item"
                            >
                                <option value="" disabled>Select</option>
                                {itemsData.map((a, j) => <option value={a.item_uuid}>{a.item_title}</option>)}
                            </select>
                          </div>
                        </td>
                        <td className="ph2 pv1 tc bb b--black-20 bg-white" style={{textAlign:"center"}}>
                          <input
                            id="Quantity"
                            type="number"
                            className="numberInput"
                            
                            min={1}
                            onKeyDown={(event) => {
                              if (event.keyCode === 38 || event.keyCode === 40)
                                event.preventDefault();
                            }}
                            onWheel={(e) => e.preventDefault()}
                            value={item.b}
                            onChange={(e) => {
                              setOrder((prev) => ({
                                ...prev,
                                item_details: prev.item_details.map((a) =>
                                  a.uuid === item.uuid
                                    ? { ...a, b: e.target.value }
                                    : a
                                ),
                              }));
                            }}
                          />
                        </td>
                        <td className="ph2 pv1 tc bb b--black-20 bg-white" style={{textAlign:"center"}}>
                          <input
                            id="Quantity"
                            type="number"
                            className="numberInput"
                            
                            min={1}
                            onKeyDown={(event) => {
                              if (event.keyCode === 38 || event.keyCode === 40)
                                event.preventDefault();
                            }}
                            onWheel={(e) => e.preventDefault()}
                            value={item.p}
                            onChange={(e) => {
                              setOrder((prev) => ({
                                ...prev,
                                item_details: prev.item_details.map((a) =>
                                  a.uuid === item.uuid
                                    ? { ...a, p: e.target.value }
                                    : a
                                ),
                              }));
                            }}
                          />
                        </td>
                        <td className="ph2 pv1 tc bb b--black-20 bg-white" style={{textAlign:"center"}}>
                          <input
                            id="Quantity"
                            type="text"
                            className="numberInput"
                            
                            min={1}
                            onKeyDown={(event) => {
                              if (event.keyCode === 38 || event.keyCode === 40)
                                event.preventDefault();
                            }}
                            onWheel={(e) => e.preventDefault()}
                            value={"Rs " + (item?.item_price || 0)}
                          />
                        </td>
                      </tr>
                    );
                  })}
                  <tr>
                    <td
                      onClick={() =>
                        setOrder((prev) => ({
                          ...prev,
                          item_details: [
                            ...prev.item_details,
                            { uuid: uuid() },
                          ],
                        }))
                      }
                    >
                      <AddIcon
                        sx={{ fontSize: 40 }}
                        style={{ color: "#4AC959", cursor: "pointer" }}
                      />
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* <div className="topInputs">
        <textarea
          placeholder="Narration (Displayed)...."
          disabled={(type !== 'edit' || editValues) ? false : true}
          maxLength="200"
          value={data.voucher_narration}
          onChange={e => setData({
            ...data,
            voucher_narration: e.target.value,
          })}
        ></textarea>
        <textarea
          placeholder="Remarks (Not Displayed)...."
          disabled={(type !== 'edit' || editValues) ? false : true}
          maxLength="200"
          value={data.voucher_remarks}
          onChange={e => setData({
            ...data,
            voucher_remarks: e.target.value,
          })}
        ></textarea>
      </div> */}

            <div className="bottomContent">
              <button type="submit">Bill</button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
