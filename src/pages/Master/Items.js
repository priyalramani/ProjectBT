import React, { useState, useEffect } from "react";
import Header from "../../components/Header";
import Sidebar from "../../components/Sidebar";
import {
  ChevronUpIcon,
  ChevronDownIcon,
  MenuAlt2Icon,
} from "@heroicons/react/solid";
import axios from "axios";
const ItemsPage = () => {
  const [itemsData, setItemsData] = useState([]);
  const [itemCategories, setItemCategories] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [popupForm, setPopupForm] = useState(false);
  const getItemCategories = async () => {
    const response = await axios({
      method: "get",
      url: "/itemCategories/GetItemCategoryList",

      headers: {
        "Content-Type": "application/json",
      },
    });
    if (response.data.success) setItemCategories(response.data.result);
  };
  const getItemsData = async () => {
    const response = await axios({
      method: "get",
      url: "/items/GetItemList",

      headers: {
        "Content-Type": "application/json",
      },
    });
    if (response.data.success)
      setItemsData(
        response.data.result.map((b) => ({
          ...b,
          company_title:
            companies.find((a) => a.company_uuid === b.company_uuid)
              ?.company_title || "-",
          category_title:
            itemCategories.find((a) => a.category_uuid === b.category_uuid)
              ?.category_title || "-",
        }))
      );
  };
  useEffect(() => {
    getItemsData();
  }, [popupForm, itemCategories, companies]);
  const getCompanies = async () => {
    const response = await axios({
      method: "get",
      url: "/companies/getCompanies",

      headers: {
        "Content-Type": "application/json",
      },
    });
    if (response.data.success) setCompanies(response.data.result);
  };
  useEffect(() => {
    getCompanies();
    getItemCategories();
  }, []);
  return (
    <>
      <Sidebar />
      <Header />
      <div className="item-sales-container orders-report-container">
        <div id="heading">
          <h2>Items</h2>
        </div>
        <div id="item-sales-top">
          <div id="date-input-container" style={{ overflow: "visible" }}>
            <button
              className="item-sales-search"
              onClick={() => setPopupForm(true)}
            >
              Add
            </button>
          </div>
        </div>
        <div className="table-container-user item-sales-container">
          <Table
            itemsDetails={itemsData}
            categories={itemCategories}
            companies={companies}
            setPopupForm={setPopupForm}
          />
        </div>
      </div>
      {popupForm ? (
        <NewUserForm
          onSave={() => setPopupForm(false)}
          setItemsData={setItemsData}
          companies={companies}
          itemCategories={itemCategories}
          popupInfo={popupForm}
        />
      ) : (
        ""
      )}
    </>
  );
};

export default ItemsPage;
function Table({ itemsDetails, setPopupForm }) {
  const [items, setItems] = useState("sort_order");
  const [order,setOrder]=useState("")
  
  console.log(items);
  return (
    <table
      className="user-table"
      style={{ maxWidth: "100vw", height: "fit-content", overflowX: "scroll" }}
    >
      <thead>
        <tr>
          <th>S.N</th>
          <th colSpan={2}>
            <div className="t-head-element">
              <span>Company Title</span>
              <div className="sort-buttons-container">
                <button
                  onClick={() =>{
                    setItems("company_title")
                    setOrder("asc")}
                  }
                >
                  <ChevronUpIcon className="sort-up sort-button" />
                </button>
                <button
                  onClick={() =>
                    {setItems(
                      "company_title"
                    )
                  setOrder("desc")}
                  }
                >
                  <ChevronDownIcon className="sort-down sort-button" />
                </button>
              </div>
            </div>
          </th>
          <th colSpan={2}>
            <div className="t-head-element">
              <span>Category Title</span>
              <div className="sort-buttons-container">
                <button
                  onClick={() =>{
                    setItems(
                      "category_title")
                       setOrder("asc")}
                  }
                >
                  <ChevronUpIcon className="sort-up sort-button" />
                </button>
                <button
                  onClick={() =>
                    {setItems(
                      "category_title"
                      
                    )
                    setOrder("desc")}
                  }
                >
                  <ChevronDownIcon className="sort-down sort-button" />
                </button>
              </div>
            </div>
          </th>
          <th colSpan={2}>
            <div className="t-head-element">
              <span>Item Title</span>
              <div className="sort-buttons-container">
                <button
                  onClick={() =>
                    {setItems("item_title"
                      
                    ) 
                    setOrder("asc")}
                  }
                >
                  <ChevronUpIcon className="sort-up sort-button" />
                </button>
                <button
                  onClick={() =>{
                    setItems("item_title"
                    )
                    setOrder("desc")}
                  }
                >
                  <ChevronDownIcon className="sort-down sort-button" />
                </button>
              </div>
            </div>
          </th>
          <th colSpan={2}>
            <div className="t-head-element">
              <span>MRP</span>
              <div className="sort-buttons-container">
                <button
                  onClick={() =>
                   { setItems("mrp")
                   setOrder("asc")}
                  }
                >
                  <ChevronUpIcon className="sort-up sort-button" />
                </button>
                <button
                  onClick={() =>
                    {setItems("mrp")
                    setOrder("desc")}
                  }
                >
                  <ChevronDownIcon className="sort-down sort-button" />
                </button>
              </div>
            </div>
          </th>
          <th colSpan={2}>
            <div className="t-head-element">
              <span>Selling Price</span>
              <div className="sort-buttons-container">
                <button
                  onClick={() =>
                    {setItems("item_price"
                      
                    )
                  
                    setOrder("asc")}
                  }
                >
                  <ChevronUpIcon className="sort-up sort-button" />
                </button>
                <button
                  onClick={() =>
                   { 
                     setItems("item_price")
                     setOrder("desc")}
                     
                  }
                >
                  <ChevronDownIcon className="sort-down sort-button" />
                </button>
              </div>
            </div>
          </th>
          <th colSpan={2}>
            <div className="t-head-element">
              <span>Conversion</span>
              <div className="sort-buttons-container">
                <button
                  onClick={() =>
                    {setItems("conversion"
                    )
                    setOrder("asc")}
                  }
                >
                  <ChevronUpIcon className="sort-up sort-button" />
                </button>
                <button
                  onClick={() =>
                   { setItems("conversion"
                    )
                    setOrder("desc")}
                  }
                >
                  <ChevronDownIcon className="sort-down sort-button" />
                </button>
              </div>
            </div>
          </th>
          <th colSpan={2}>
            <div className="t-head-element">
              <span>GST(%)</span>
              <div className="sort-buttons-container">
                <button
                  onClick={() =>
                   { setItems("item_gst"
                    )
                    setOrder("asc")}
                  }
                >
                  <ChevronUpIcon className="sort-up sort-button" />
                </button>
                <button
                  onClick={() =>
                    {setItems("item_gst"
                    )
                    setOrder("desc")}
                  }
                >
                  <ChevronDownIcon className="sort-down sort-button" />
                </button>
              </div>
            </div>
          </th>
          <th colSpan={2}>Group</th>
        </tr>
      </thead>
      <tbody>
        {itemsDetails
        .sort((a, b) =>order==="asc"
        ? typeof(a[items])==="string"?a[items].localeCompare(b[items]): a[items] - b[items]:
        typeof(a[items])==="string"?b[items].localeCompare(a[items]): b[items] - a[items])
          ?.map((item, i) => (
            <tr key={Math.random()} style={{ height: "30px" }} onClick={()=>setPopupForm({type:"edit",data:item})}>
              <td>{i + 1}</td>
              <td colSpan={2}>{item.company_title}</td>
              <td colSpan={2}>{item.category_title}</td>
              <td colSpan={2}>{item.item_title}</td>
              <td colSpan={2}>{item.mrp}</td>
              <td colSpan={2}>{item.item_price}</td>
              <td colSpan={2}>{item.conversion}</td>
              <td colSpan={2}>{item.item_gst}</td>
              <td colSpan={2}>-</td>
            </tr>
          ))}
      </tbody>
    </table>
  );
}
function NewUserForm({
  onSave,
  popupInfo,
  setItemsData,
  companies,
  itemCategories,
}) {
  const [data, setdata] = useState({ company_uuid: companies[0].company_uuid });

  const [errMassage, setErrorMassage] = useState("");
  console.log(popupInfo)
useEffect(()=>popupInfo?.type==="edit"?setdata(popupInfo.data):{},[])
  const submitHandler = async (e) => {
    e.preventDefault();
    if (!data.item_title) {
      setErrorMassage("Please insert Route Title");
      return;
    }

    if (popupInfo?.type === "edit") {
      const response = await axios({
        method: "put",
        url: "/routes/putRoute",
        data,
        headers: {
          "Content-Type": "application/json",
        },
      });
      if (response.data.success) {
        setItemsData((prev) =>
          prev.map((i) => (i.user_uuid === data.user_uuid ? data : i))
        );
        onSave();
      }
    } else {
      const response = await axios({
        method: "post",
        url: "/items/postItem",
        data,
        headers: {
          "Content-Type": "application/json",
        },
      });
      if (response.data.success) {
        setItemsData((prev) => [...prev, data]);
        onSave();
      }
    }
  };

  return (
    <div className="overlay">
      <div
        className="modal"
        style={{ height: "fit-content", width: "fit-content" }}
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
              <div className="row">
                <h1>{popupInfo.type==="edit"?"Edit":"Add"} Items</h1>
              </div>

              <div className="formGroup">
                <div className="row">
                  <label className="selectLabel">
                    Item Title
                    <input
                      type="text"
                      name="route_title"
                      className="numberInput"
                      value={data?.item_title}
                      onChange={(e) =>
                        setdata({
                          ...data,
                          item_title: e.target.value,
                          pronounce: e.target.value,
                        })
                      }
                      maxLength={60}
                    />
                  </label>
                  <label className="selectLabel">
                    Sort Order
                    <input
                      type="number"
                      name="sort_order"
                      className="numberInput"
                      value={data?.sort_order}
                      onChange={(e) =>
                        setdata({
                          ...data,
                          sort_order: e.target.value,
                        })
                      }
                    />
                  </label>
                </div>
                <div className="row">
                  <label className="selectLabel">
                    Company
                    <select
                      name="user_type"
                      className="select"
                      value={data?.company_uuid}
                      onChange={(e) =>
                        setdata({
                          ...data,
                          company_uuid: e.target.value,
                        })
                      }
                    >
                      <option value="">None</option>
                      {companies
                        .sort((a, b) => a.sort_order - b.sort_order)
                        .map((a) => (
                          <option value={a.company_uuid}>
                            {a.company_title}
                          </option>
                        ))}
                    </select>
                  </label>
                  <label className="selectLabel">
                    Item Category
                    <select
                      name="user_type"
                      className="select"
                      value={data?.category_uuid}
                      onChange={(e) =>
                        setdata({
                          ...data,
                          category_uuid: e.target.value,
                        })
                      }
                    >
                      <option value="">None</option>
                      {itemCategories
                        .filter((a) => a.company_uuid === data.company_uuid)
                        .sort((a, b) => a.sort_order - b.sort_order)
                        .map((a) => (
                          <option value={a.category_uuid}>
                            {a.category_title}
                          </option>
                        ))}
                    </select>
                  </label>
                </div>

                <div className="row">
                  <label className="selectLabel">
                    Pronounce
                    <input
                      type="text"
                      name="route_title"
                      className="numberInput"
                      value={data?.pronounce}
                      onChange={(e) =>
                        setdata({
                          ...data,
                          pronounce: e.target.value,
                        })
                      }
                      maxLength={42}
                    />
                  </label>
                  <label className="selectLabel">
                    MRP
                    <input
                      type="number"
                      name="sort_order"
                      className="numberInput"
                      value={data?.mrp}
                      onChange={(e) =>
                        setdata({
                          ...data,
                          mrp: e.target.value,
                        })
                      }
                      maxLength={5}
                    />
                  </label>
                </div>

                <div className="row">
                  <label className="selectLabel">
                    Item Price
                    <input
                      type="number"
                      name="route_title"
                      className="numberInput"
                      value={data?.item_price}
                      onChange={(e) =>
                        setdata({
                          ...data,
                          item_price: e.target.value,
                        })
                      }
                      maxLength={5}
                    />
                  </label>
                  <label className="selectLabel">
                    GST
                    <input
                      type="number"
                      name="sort_order"
                      className="numberInput"
                      value={data?.item_gst}
                      onChange={(e) =>
                        setdata({
                          ...data,
                          item_gst: e.target.value,
                        })
                      }
                      maxLength={3}
                    />
                  </label>
                </div>

                <div className="row">
                  <label className="selectLabel">
                    Conversion
                    <input
                      type="text"
                      name="route_title"
                      className="numberInput"
                      value={data?.conversion}
                      onChange={(e) =>
                        setdata({
                          ...data,
                          conversion: e.target.value,
                        })
                      }
                      maxLength={5}
                    />
                  </label>
                  <label className="selectLabel">
                    Barcode
                    <textarea
                      type="number"
                      name="sort_order"
                      className="numberInput"
                      //   value={data?.barcode}
                      style={{ height: "50px" }}
                      onChange={(e) =>
                        setdata({
                          ...data,
                          barcode: e.target.value.split("\n"),
                        })
                      }
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
