import React, { useState, useEffect } from "react";
import Header from "../../components/Header";
import Sidebar from "../../components/Sidebar";

import axios from "axios";
const ItemsPage = () => {
  const [itemsData, setItemsData] = useState([]);
  const [itemCategories, setItemCategories] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [popupForm, setPopupForm] = useState(false);
  const getItemCategories = async () => {
    const response = await axios({
      method: "get",
      url: "/itemCategories/getItemCategories",

      headers: {
        "Content-Type": "application/json",
      },
    });
    if (response.data.success) setItemCategories(response.data.result);
  };
  const getItemsData = async () => {
    const response = await axios({
      method: "get",
      url: "/items/getItems",

      headers: {
        "Content-Type": "application/json",
      },
    });
    if (response.data.success) setItemsData(response.data.result);
  };
  useEffect(() => {
    getItemsData();
  }, [popupForm]);
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
          />
        </div>
      </div>
      {popupForm ? (
        <NewUserForm
          onSave={() => setPopupForm(false)}
          setItemsData={setItemsData}
          companies={companies}
          itemCategories={itemCategories}
        />
      ) : (
        ""
      )}
    </>
  );
};

export default ItemsPage;
function Table({ itemsDetails, companies, categories }) {
  return (
    <table
      className="user-table"
      style={{ maxWidth: "100vw", height: "fit-content", overflowX: "scroll" }}
    >
      <thead>
        <tr>
          <th>S.N</th>
          <th colSpan={2}>Item Title</th>
          <th colSpan={2}>Companies</th>
          <th colSpan={2}>Item Categories</th>
          <th>Sort Order</th>
        </tr>
      </thead>
      <tbody>
        {itemsDetails
          .sort((a, b) => a.sort_order - b.sort_order)
          ?.map((item, i) => (
            <tr key={Math.random()} style={{ height: "30px" }}>
              <td>{i + 1}</td>
              <td colSpan={2}>{item.item_title}</td>
              <td colSpan={2}>{companies.find(a=>a.company_uuid===item.company_uuid)?.company_title||"-"}</td>
              <td colSpan={2}>{categories.find(a=>a.category_uuid===item.category_uuid)?.category_title||"-"}</td>
              <td>{item.sort_order}</td>
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
                <h1>Add Items</h1>
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
                    Sort Order
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
