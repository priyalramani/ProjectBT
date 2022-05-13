import React, { useState, useEffect } from "react";
import Header from "../../components/Header";
import Sidebar from "../../components/Sidebar";

import axios from "axios";
const ItemCompanies = () => {
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
    getItemCategories();
  }, [popupForm]);
  useEffect(() => {
    getCompanies();
  }, []);

  return (
    <>
      <Sidebar />
      <Header />
      <div className="item-sales-container orders-report-container">
        <div id="heading">
          <h2>Item Categories</h2>
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
          <Table itemsDetails={itemCategories} companies={companies}/>
        </div>
      </div>
      {popupForm ? (
        <NewUserForm
          onSave={() => setPopupForm(false)}
          companies={companies}
          setRoutesData={setItemCategories}
        />
      ) : (
        ""
      )}
    </>
  );
};

export default ItemCompanies;
function Table({ itemsDetails,companies }) {
  return (
    <table
      className="user-table"
      style={{ maxWidth: "100vw", height: "fit-content", overflowX: "scroll" }}
    >
      <thead>
        <tr>
          <th>S.N</th>
          <th colSpan={2}>Category Title</th>
          <th>Company</th>
          <th>Sort Order</th>
        </tr>
      </thead>
      <tbody>
        {itemsDetails
          .sort((a, b) => a.sort_order - b.sort_order)
          ?.map((item, i) => (
            <tr key={Math.random()} style={{ height: "30px" }}>
              <td>{i + 1}</td>
              <td colSpan={2}>{item.category_title}</td>
              <td colSpan={2}>{companies.find(a=>a.company_uuid===item.company_uuid)?.company_title||"-"}</td>
              <td>{item.sort_order}</td>
            </tr>
          ))}
      </tbody>
    </table>
  );
}
function NewUserForm({ onSave, popupInfo, setRoutesData, companies }) {
  const [data, setdata] = useState({});
  const [errMassage, setErrorMassage] = useState("");
  const submitHandler = async (e) => {
    e.preventDefault();
    if (!data.company_uuid) {
      setErrorMassage("Please insert Company");
      return;
    }else if(!data.category_title){
      setErrorMassage("Please insert Category Title");
      return;

    }
    if (popupInfo?.type === "edit") {
      const response = await axios({
        method: "put",
        url: "/itemCategories/putItemCategories",
        data,
        headers: {
          "Content-Type": "application/json",
        },
      });
      if (response.data.success) {
        setRoutesData((prev) =>
          prev.map((i) => (i.user_uuid === data.user_uuid ? data : i))
        );
        onSave();
      }
    } else {
      const response = await axios({
        method: "post",
        url: "/itemCategories/postItemCategories",
        data,
        headers: {
          "Content-Type": "application/json",
        },
      });
      if (response.data.success) {
        setRoutesData((prev) => [...prev, data]);
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
                <h1>Add Category</h1>
              </div>

              <div className="formGroup">
                <div className="row">
                  <label className="selectLabel">
                    Category Title
                    <input
                      type="text"
                      name="route_title"
                      className="numberInput"
                      value={data?.category_title}
                      onChange={(e) =>
                        setdata({
                          ...data,
                          category_title: e.target.value,
                        })
                      }
                      maxLength={42}
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
                    User Type
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
