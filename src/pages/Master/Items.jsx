import React, { useState, useEffect, useMemo, useContext } from "react";
import axios from "axios";
import Compressor from "compressorjs";
import { ChevronUpIcon, ChevronDownIcon } from "@heroicons/react/solid";
import { DeleteOutline } from "@mui/icons-material";
import { GrList } from "react-icons/gr";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import { IoIosCloseCircle } from "react-icons/io";
import { v4 as uuid } from "uuid";
import Header from "../../components/Header";
import Sidebar from "../../components/Sidebar";
import noimg from "../../assets/noimg.jpg";
import context from "../../context/context";
import { server } from "../../App";
import { IoCheckmarkDoneOutline } from "react-icons/io5";
import { FaSave } from "react-icons/fa";
import Prompt from "../../components/Prompt";

const ItemsPage = () => {
  const [itemsData, setItemsData] = useState([]);
  const [disabledItem, setDisabledItem] = useState(false);
  const [itemCategories, setItemCategories] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [popupForm, setPopupForm] = useState(false);
  const [deletePopup, setDeletePopup] = useState(false);
  const [filterTitle, setFilterTitle] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [filterCompany, setFilterCompany] = useState("");
  const { setNotification } = useContext(context);
  const getItemCategories = async (controller = new AbortController()) => {
    const response = await axios({
      method: "get",
      url: "/itemCategories/GetItemCategoryList",
      signal: controller.signal,
      headers: {
        "Content-Type": "application/json",
      },
    });
    if (response.data.success) setItemCategories(response.data.result);
  };
  const getItemsData = async (controller = new AbortController()) => {
    const response = await axios({
      method: "get",
      url: "/items/GetItemData",
      signal: controller.signal,
      headers: {
        "Content-Type": "application/json",
      },
    });
    if (response.data.success) setItemsData(response.data.result);
  };
  useEffect(() => {
    const controller = new AbortController();
    getItemsData(controller);
    return () => {
      controller.abort();
    };
  }, [popupForm]);
  const filterItemsData = useMemo(
    () =>
      itemsData
        .map((b) => ({
          ...b,
          company_title:
            companies.find((a) => a.company_uuid === b.company_uuid)
              ?.company_title || "-",
          category_title:
            itemCategories.find((a) => a.category_uuid === b.category_uuid)
              ?.category_title || "-",
        }))
        .filter(
          (a) =>
            a.item_title &&
            (disabledItem || a.status) &&
            (!filterTitle ||
              a.item_title
                .toLocaleLowerCase()
                .includes(filterTitle.toLocaleLowerCase())) &&
            (!filterCompany ||
              a.company_title
                .toLocaleLowerCase()
                .includes(filterCompany.toLocaleLowerCase())) &&
            (!filterCategory ||
              a.category_title
                .toLocaleLowerCase()
                .includes(filterCategory.toLocaleLowerCase()))
        ),
    [
      companies,
      disabledItem,
      filterCategory,
      filterCompany,
      filterTitle,
      itemCategories,
      itemsData,
    ]
  );
  const getCompanies = async () => {
    const cachedData = localStorage.getItem('companiesData');
    
    if (cachedData) {
      setCompanies(JSON.parse(cachedData));
    } else {
      const response = await axios({
        method: "get",
        url: "/companies/getCompanies",
        headers: {
          "Content-Type": "application/json",
        },
      });
  
      if (response.data.success) {
        localStorage.setItem('companiesData', JSON.stringify(response.data.result));
        setCompanies(response.data.result);
      }
    }
  };  
  useEffect(() => {
    const controller = new AbortController();
    getCompanies(controller);
    getItemCategories();
    return () => {
      controller.abort(controller);
    };
  }, []);

  return (
    <>
      <Sidebar />
      <Header />
      <div className="item-sales-container orders-report-container">
        <div id="heading" style={{ position: "relative" }}>
          <h2>Items</h2>
          <span
            style={{
              position: "absolute",
              right: "30px",
              top: "50%",
              translate: "0 -50%",
            }}
          >
            Total Items: {filterItemsData.length}
          </span>
        </div>
        <div id="item-sales-top">
          <div
            id="date-input-container"
            style={{
              overflow: "visible",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              width: "100%",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <input
                type="text"
                onChange={(e) => setFilterTitle(e.target.value)}
                value={filterTitle}
                placeholder="Search Item Title..."
                className="searchInput"
              />
              <input
                type="text"
                onChange={(e) => setFilterCompany(e.target.value)}
                value={filterCompany}
                placeholder="Search Company..."
                className="searchInput"
              />
              <input
                type="text"
                onChange={(e) => setFilterCategory(e.target.value)}
                value={filterCategory}
                placeholder="Search Category..."
                className="searchInput"
              />
              <label
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: "8px",
                  cursor: "pointer",
                }}
              >
                <input
                  type="checkbox"
                  onChange={(e) => setDisabledItem(e.target.checked)}
                  value={disabledItem}
                  className="searchInput"
                  style={{ scale: "1.2" }}
                />
                <span>Disabled Items</span>
              </label>
            </div>

            <button className="theme-btn" onClick={() => setPopupForm(true)}>
              Add
            </button>
          </div>
        </div>
        <div className="table-container-user item-sales-container">
          <Table
            itemsDetails={filterItemsData}
            categories={itemCategories}
            companies={companies}
            setPopupForm={setPopupForm}
            setDeletePopup={setDeletePopup}
          />
        </div>
      </div>
      {popupForm ? (
        <NewUserForm
          onSave={() => {
            setPopupForm(false);
            getItemsData();
          }}
          setItemsData={setItemsData}
          companies={companies}
          itemCategories={itemCategories}
          popupInfo={popupForm}
          items={itemsData}
          setNotification={setNotification}
        />
      ) : (
        ""
      )}
      {deletePopup ? (
        <DeleteItemPopup
          onSave={() => {
            setDeletePopup(false);
            getItemsData();
          }}
          setItemsData={setItemsData}
          popupInfo={deletePopup}
        />
      ) : (
        ""
      )}
    </>
  );
};

export default ItemsPage;
function Table({ itemsDetails, setPopupForm, setDeletePopup }) {
  const [items, setItems] = useState("sort_order");
  const [order, setOrder] = useState("");
  const [pricesListState, setPricesListState] = useState();
  return (
    <>
      <div
        style={{ maxWidth: "100vw", height: "fit-content", overflowX: "auto" }}
      >
        <table className="user-table" style={{ tableLayout: "auto" }}>
          <thead>
            <tr>
              <th>S.N</th>
              <th>
                <div className="t-head-element">
                  <span>Company Title</span>
                  <div className="sort-buttons-container">
                    <button
                      onClick={() => {
                        setItems("company_title");
                        setOrder("asc");
                      }}
                    >
                      <ChevronUpIcon className="sort-up sort-button" />
                    </button>
                    <button
                      onClick={() => {
                        setItems("company_title");
                        setOrder("desc");
                      }}
                    >
                      <ChevronDownIcon className="sort-down sort-button" />
                    </button>
                  </div>
                </div>
              </th>
              <th>
                <div className="t-head-element">
                  <span>Category Title</span>
                  <div className="sort-buttons-container">
                    <button
                      onClick={() => {
                        setItems("category_title");
                        setOrder("asc");
                      }}
                    >
                      <ChevronUpIcon className="sort-up sort-button" />
                    </button>
                    <button
                      onClick={() => {
                        setItems("category_title");
                        setOrder("desc");
                      }}
                    >
                      <ChevronDownIcon className="sort-down sort-button" />
                    </button>
                  </div>
                </div>
              </th>
              <th>
                <div className="t-head-element">
                  <span>Item Title</span>
                  <div className="sort-buttons-container">
                    <button
                      onClick={() => {
                        setItems("item_title");
                        setOrder("asc");
                      }}
                    >
                      <ChevronUpIcon className="sort-up sort-button" />
                    </button>
                    <button
                      onClick={() => {
                        setItems("item_title");
                        setOrder("desc");
                      }}
                    >
                      <ChevronDownIcon className="sort-down sort-button" />
                    </button>
                  </div>
                </div>
              </th>
              <th>
                <div className="t-head-element">
                  <span>MRP</span>
                  <div className="sort-buttons-container">
                    <button
                      onClick={() => {
                        setItems("mrp");
                        setOrder("asc");
                      }}
                    >
                      <ChevronUpIcon className="sort-up sort-button" />
                    </button>
                    <button
                      onClick={() => {
                        setItems("mrp");
                        setOrder("desc");
                      }}
                    >
                      <ChevronDownIcon className="sort-down sort-button" />
                    </button>
                  </div>
                </div>
              </th>
              <th>
                <div className="t-head-element">
                  <span>Code</span>
                  <div className="sort-buttons-container">
                    <button
                      onClick={() => {
                        setItems("item_code");
                        setOrder("asc");
                      }}
                    >
                      <ChevronUpIcon className="sort-up sort-button" />
                    </button>
                    <button
                      onClick={() => {
                        setItems("item_code");
                        setOrder("desc");
                      }}
                    >
                      <ChevronDownIcon className="sort-down sort-button" />
                    </button>
                  </div>
                </div>
              </th>
              <th>
                <div className="t-head-element">
                  <span>Discount</span>
                  <div className="sort-buttons-container">
                    <button
                      onClick={() => {
                        setItems("item_discount");
                        setOrder("asc");
                      }}
                    >
                      <ChevronUpIcon className="sort-up sort-button" />
                    </button>
                    <button
                      onClick={() => {
                        setItems("item_discount");
                        setOrder("desc");
                      }}
                    >
                      <ChevronDownIcon className="sort-down sort-button" />
                    </button>
                  </div>
                </div>
              </th>
              <th>
                <div className="t-head-element">
                  <span>Selling Price</span>
                  <div className="sort-buttons-container">
                    <button
                      onClick={() => {
                        setItems("item_price");

                        setOrder("asc");
                      }}
                    >
                      <ChevronUpIcon className="sort-up sort-button" />
                    </button>
                    <button
                      onClick={() => {
                        setItems("item_price");
                        setOrder("desc");
                      }}
                    >
                      <ChevronDownIcon className="sort-down sort-button" />
                    </button>
                  </div>
                </div>
              </th>
              <th>
                <div className="t-head-element">
                  <span>Conversion</span>
                  <div className="sort-buttons-container">
                    <button
                      onClick={() => {
                        setItems("conversion");
                        setOrder("asc");
                      }}
                    >
                      <ChevronUpIcon className="sort-up sort-button" />
                    </button>
                    <button
                      onClick={() => {
                        setItems("conversion");
                        setOrder("desc");
                      }}
                    >
                      <ChevronDownIcon className="sort-down sort-button" />
                    </button>
                  </div>
                </div>
              </th>
              <th>
                <div className="t-head-element">
                  <span>HSN</span>
                  <div className="sort-buttons-container">
                    <button
                      onClick={() => {
                        setItems("hsn");
                        setOrder("asc");
                      }}
                    >
                      <ChevronUpIcon className="sort-up sort-button" />
                    </button>
                    <button
                      onClick={() => {
                        setItems("hsn");
                        setOrder("desc");
                      }}
                    >
                      <ChevronDownIcon className="sort-down sort-button" />
                    </button>
                  </div>
                </div>
              </th>
              <th>
                <div className="t-head-element">
                  <span>GST(%)</span>
                  <div className="sort-buttons-container">
                    <button
                      onClick={() => {
                        setItems("item_gst");
                        setOrder("asc");
                      }}
                    >
                      <ChevronUpIcon className="sort-up sort-button" />
                    </button>
                    <button
                      onClick={() => {
                        setItems("item_gst");
                        setOrder("desc");
                      }}
                    >
                      <ChevronDownIcon className="sort-down sort-button" />
                    </button>
                  </div>
                </div>
              </th>
              <th>
                <div className="t-head-element">
                  <span>One Pack</span>
                  <div className="sort-buttons-container">
                    <button
                      onClick={() => {
                        setItems("one_pack");
                        setOrder("asc");
                      }}
                    >
                      <ChevronUpIcon className="sort-up sort-button" />
                    </button>
                    <button
                      onClick={() => {
                        setItems("one_pack");
                        setOrder("desc");
                      }}
                    >
                      <ChevronDownIcon className="sort-down sort-button" />
                    </button>
                  </div>
                </div>
              </th>
              <th></th>
            </tr>
          </thead>
          <tbody className="tbody">
            {itemsDetails
              .map((a) => ({ ...a, item_discount: +a.item_discount || 0 }))
              .sort((a, b) =>
                order === "asc"
                  ? typeof a[items] === "string"
                    ? a[items]?.localeCompare(b[items])
                    : a[items] - b[items]
                  : typeof a[items] === "string"
                  ? b[items]?.localeCompare(a[items])
                  : b[items] - a[items]
              )
              ?.map((item, i) => (
                <tr
                  key={Math.random()}
                  style={{ height: "30px" }}
                  onClick={(e) => {
                    e.stopPropagation();
                    setPopupForm({ type: "edit", data: item });
                  }}
                >
                  <td>{i + 1}</td>
                  <td>{item.company_title}</td>
                  <td>{item.category_title}</td>
                  <td>{item.item_title}</td>
                  <td>{item.mrp}</td>
                  <td>{item.item_code}</td>
                  <td>{item.item_discount || 0}</td>
                  <td>{item.item_price}</td>
                  <td>{item.conversion}</td>
                  <td>{item.hsn}</td>
                  <td>{item.item_gst}</td>
                  <td>{item.one_pack}</td>
                  <td>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "5px",
                      }}
                    >
                      <div
                        style={{
                          fontWeight: 700,
                          fontSize: 20,
                          paddingRight: 10,
                        }}
                        onClick={(e) => {
                          e.stopPropagation();
                          setPopupForm({ type: "price", data: item });
                        }}
                      >
                        ₹
                      </div>
                      <GrList
                        style={{ fontSize: "22px" }}
                        onClick={(e) => {
                          e.stopPropagation();
                          setPricesListState({
                            active: true,
                            item: {
                              item_uuid: item?.item_uuid,
                              item_title: item?.item_title,
                              item_price: item?.item_price,
                            },
                          });
                        }}
                      />
                      <DeleteOutline
                        onClick={(e) => {
                          setDeletePopup(item);
                        }}
                      />
                    </div>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
      {pricesListState?.active && (
        <CounterPrices
          item={pricesListState?.item}
          close={() => setPricesListState()}
        />
      )}
    </>
  );
}
function NewUserForm({
  onSave,
  popupInfo,
  setItemsData,
  companies,
  itemCategories,
  items,
  setNotification,
}) {
  const [data, setdata] = useState({ item_group_uuid: [] });

  const [itemGroup, setItemGroup] = useState([]);

  const [errMassage, setErrorMassage] = useState("");
  let findDuplicates = (arr) =>
    arr?.filter((item, index) => arr?.indexOf(item) != index);
  const getCounterGroup = async () => {
    const response = await axios({
      method: "get",
      url: "/itemGroup/GetItemGroupList",

      headers: {
        "Content-Type": "application/json",
      },
    });
    if (response.data.success)
      setItemGroup(
        response.data.result.filter(
          (a) => a.item_group_uuid && a.item_group_title
        )
      );
  };

  useEffect(() => {
    getCounterGroup();
  }, []);
  useEffect(() => {
    if (popupInfo?.type === "edit")
      setdata({
        one_pack: "1",
        conversion: "1",
        status: 1,
        ...popupInfo.data,
      });
    else if (popupInfo?.type === "price")
      setdata({
        item_uuid: popupInfo.data.item_uuid,
        item_title: popupInfo.data.item_title,
        item_price_a: popupInfo.data.item_price_a || 0,
        item_price_b: popupInfo.data.item_price_b || 0,
        item_price_c: popupInfo.data.item_price_c || 0,
      });
    else
      setdata({
        one_pack: "1",
        conversion: "1",
        company_uuid: companies[0].company_uuid,
        category_uuid: itemCategories.filter(
          (a) => a.company_uuid === companies[0].company_uuid
        )[0]?.category_uuid,
        free_issue: "N",
        status: 1,
        exclude_discount: 0,
      });
  }, [companies, itemCategories, popupInfo.data, popupInfo?.type]);
  console.log({ data });
  const submitHandler = async (e) => {
    let obj = { ...data, item_uuid: data.item_uuid || uuid() };
    e.preventDefault();
    if (!obj.item_group_uuid?.length && popupInfo.type !== "price") {
      setNotification({ success: false, message: "Please Select Item Group" });
      setTimeout(() => setNotification(null), 5000);
      return;
    }
    let barcodeChecking = items
      ?.filter((a) => a.item_uuid !== obj.item_uuid)
      ?.filter((a) => a?.barcode?.length)
      ?.map((a) => a?.barcode)
      ?.filter(
        (a) =>
          a?.filter((b) => obj?.barcode?.filter((c) => b === c)?.length)?.length
      );
    barcodeChecking = [].concat.apply([], barcodeChecking);
    if (!obj.item_title) {
      setErrorMassage("Please insert Item Title");
      return;
    }
    if (findDuplicates(obj.barcode)?.length || barcodeChecking?.length) {
      setErrorMassage("Please insert Unique Barcode");
      return;
    }

    if (obj.img) {
      const previousFile = obj.img;
      new Compressor(obj.img, {
        quality: 0.8, // 0.6 can also be used, but its not recommended to go below.
        success: (compressedResult) => {
          // compressedResult has the compressed file.
          // Use the compressed file to upload the images to your server.
          const FileData = new File(
            [compressedResult],
            obj.item_uuid + "thumbnail.png"
          );
          const form = new FormData();
          form.append("file", FileData);
          axios({
            method: "post",
            url: "/uploadImage",
            data: form,
            headers: {
              "Content-Type": "multipart/form-data",
            },
          });
        },
      });
      const newFile = new File([previousFile], data.item_uuid + ".png");
      const form = new FormData();
      form.append("file", newFile);
      await axios({
        method: "post",
        url: "/uploadImage",
        data: form,
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      obj = { ...obj, img_status: 1 };
    }
    if (popupInfo?.type === "edit" || popupInfo.type === "price") {
      const response = await axios({
        method: "put",
        url: "/items/putItem",
        data: [obj],
        headers: {
          "Content-Type": "application/json",
        },
      });
      if (response.data.result[0].success) {
        onSave();
      }
    } else {
      if (obj?.item_code && items.find((a) => a.item_code === obj.item_code)) {
        setErrorMassage("Please insert Different Item Code");
        return;
      }
      const response = await axios({
        method: "post",
        url: "/items/postItem",
        data: obj,
        headers: {
          "Content-Type": "application/json",
        },
      });
      if (response.data.success) {
        onSave();
      }
    }
  };
  const onChangeGroupHandler = (item_group_uuid) => {
    setdata((prev) => ({
      ...prev,
      item_group_uuid: prev?.item_group_uuid?.find((a) => a === item_group_uuid)
        ? prev?.item_group_uuid?.filter((a) => a !== item_group_uuid)
        : [...(prev.item_group_uuid ?? []), item_group_uuid],
    }));
  };
  return (
    <div className="overlay" style={{ zIndex: 9999999 }}>
      <div
        className="modal"
        style={{
          height: popupInfo.type === "price" ? "65vh" : "90vh",
          width: "fit-content",
        }}
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
                <h1>
                  {popupInfo.type === "price"
                    ? "Item Price"
                    : popupInfo.type === "edit"
                    ? "Edit Items"
                    : "Add Items"}
                </h1>
              </div>
              {popupInfo.type === "price" ? (
                <div className="formGroup">
                  <div className="row">
                    <label className="selectLabel">
                      Item Price A
                      <input
                        type="number"
                        onWheel={(e) => e.target.blur()}
                        name="route_title"
                        className="numberInput"
                        step="0.001"
                        value={data?.item_price_a}
                        onChange={(e) =>
                          setdata({
                            ...data,
                            item_price_a: e.target.value,
                          })
                        }
                        maxLength={5}
                      />
                    </label>
                  </div>
                  <div className="row">
                    <label className="selectLabel">
                      Item Price B
                      <input
                        type="number"
                        onWheel={(e) => e.target.blur()}
                        name="route_title"
                        className="numberInput"
                        step="0.001"
                        value={data?.item_price_b}
                        onChange={(e) =>
                          setdata({
                            ...data,
                            item_price_b: e.target.value,
                          })
                        }
                        maxLength={5}
                      />
                    </label>
                  </div>
                  <sdiv className="row">
                    <label className="selectLabel">
                      Item Price C
                      <input
                        type="number"
                        onWheel={(e) => e.target.blur()}
                        name="route_title"
                        className="numberInput"
                        step="0.001"
                        value={data?.item_price_c}
                        onChange={(e) =>
                          setdata({
                            ...data,
                            item_price_c: e.target.value,
                          })
                        }
                        maxLength={5}
                      />
                    </label>
                  </sdiv>
                </div>
              ) : (
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
                        onWheel={(e) => e.target.blur()}
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
                    <label htmlFor={data.item_uuid} className="flex">
                      Upload Image
                      <input
                        className="searchInput"
                        type="file"
                        id={data.item_uuid}
                        style={{ display: "none" }}
                        onChange={(e) => {
                          if (e.target.files[0].size > 500000) {
                            setNotification({ message: "File is too big!" });
                            setTimeout(() => setNotification(null), 500);
                          } else {
                            setdata((prev) => ({
                              ...prev,
                              img: e.target.files[0],
                            }));
                          }
                        }}
                      />
                      <img
                        style={{
                          width: "100px",
                          height: "100px",
                          objectFit: "contain",
                        }}
                        src={
                          data.img_status
                            ? server + "/" + data.item_uuid + ".png"
                            : noimg
                        }
                        onError={({ currentTarget }) => {
                          currentTarget.onerror = null; // prevents looping
                          currentTarget.src = noimg;
                        }}
                        alt=""
                      />
                    </label>
                    {data.img_status ? (
                      <span
                        className="flex"
                        style={{ width: "10%", height: "100px" }}
                        onClick={() =>
                          setdata((prev) => ({ ...prev, img_status: false }))
                        }
                      >
                        <DeleteOutline />
                      </span>
                    ) : (
                      ""
                    )}
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
                            category_uuid: itemCategories.filter(
                              (a) => a.company_uuid === e.target.value
                            )[0]?.category_uuid,
                          })
                        }
                      >
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
                        onWheel={(e) => e.target.blur()}
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
                        onWheel={(e) => e.target.blur()}
                        name="route_title"
                        className="numberInput"
                        step="0.001"
                        value={data?.item_price}
                        onChange={(e) =>
                          setdata({
                            ...data,
                            item_price: e.target.value,
                            margin: (data.mrp / e.target.value - 1) * 100,
                          })
                        }
                        maxLength={5}
                      />
                    </label>
                    <label className="selectLabel">
                      Item Margin
                      <input
                        type="number"
                        onWheel={(e) => e.target.blur()}
                        name="route_title"
                        className="numberInput"
                        step="0.001"
                        value={data?.margin}
                        onChange={(e) => {
                          let item_price =
                            data?.mrp / (e.target.value / 100 + 1);
                          item_price =
                            item_price - Math.floor(item_price) !== 0
                              ? item_price
                                  .toString()
                                  .match(
                                    new RegExp(
                                      "^-?\\d+(?:.\\d{0," + (2 || -1) + "})?"
                                    )
                                  )[0]
                              : item_price;

                          setdata({
                            ...data,
                            margin: e.target.value,
                            item_price,
                          });
                        }}
                        maxLength={5}
                      />
                    </label>{" "}
                  </div>

                  <div className="row">
                    <label className="selectLabel">
                      Item Code
                      <input
                        type="text"
                        name="one_pack"
                        className="numberInput"
                        value={data?.item_code}
                        onChange={(e) =>
                          setdata({
                            ...data,
                            item_code: e.target.value.replace(/\s+/g, ""),
                          })
                        }
                      />
                    </label>
                    <label className="selectLabel">
                      GST
                      <input
                        type="number"
                        onWheel={(e) => e.target.blur()}
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
                        disabled={popupInfo.type === "edit"}
                      />
                    </label>
                    <label className="selectLabel">
                      One Pack
                      <input
                        type="text"
                        name="one_pack"
                        className="numberInput"
                        value={data?.one_pack}
                        onChange={(e) =>
                          setdata({
                            ...data,
                            one_pack: e.target.value,
                          })
                        }
                        maxLength={5}
                      />
                    </label>
                  </div>

                  <div className="row">
                    <label className="selectLabel">
                      Item Discount
                      <input
                        type="text"
                        name="one_pack"
                        className="numberInput"
                        value={data?.item_discount}
                        onChange={(e) =>
                          setdata({
                            ...data,
                            item_discount: e.target.value,
                          })
                        }
                        maxLength={5}
                      />
                    </label>
                    <label className="selectLabel">
                      Product HSN
                      <input
                        type="number"
                        name="one_pack"
                        className="numberInput"
                        value={data?.hsn}
                        onChange={(e) => {
                          if (e.target.value.length <= 8)
                            setdata({
                              ...data,
                              hsn: e.target.value,
                            });
                        }}
                        maxLength={8}
                      />
                    </label>
                    <label className="selectLabel" style={{ width: "100px" }}>
                      Free Issue
                      <div
                        className="flex"
                        style={{ justifyContent: "space-between" }}
                      >
                        <div className="flex">
                          <input
                            type="radio"
                            name="statusOnn"
                            className="numberInput"
                            checked={data.free_issue === "Y"}
                            style={{ height: "25px" }}
                            onClick={() =>
                              setdata((prev) => ({ ...prev, free_issue: "Y" }))
                            }
                          />
                          Yes
                        </div>
                        <div className="flex">
                          <input
                            type="radio"
                            name="statusOff"
                            className="numberInput"
                            checked={data.free_issue === "N"}
                            style={{ height: "25px" }}
                            onClick={() =>
                              setdata((prev) => ({ ...prev, free_issue: "N" }))
                            }
                          />
                          No
                        </div>
                      </div>
                    </label>
                  </div>
                  <div className="row">
                    <label className="selectLabel">
                      Barcode
                      <textarea
                        type="number"
                        onWheel={(e) => e.target.blur()}
                        name="sort_order"
                        className="numberInput"
                        value={data?.barcode?.toString()?.replace(/,/g, "\n")}
                        style={{ height: "50px" }}
                        onChange={(e) =>
                          setdata({
                            ...data,
                            barcode: e.target.value.split("\n"),
                          })
                        }
                      />
                    </label>
                    <label className="selectLabel" style={{ width: "100px" }}>
                      Status
                      <div
                        className="flex"
                        style={{ justifyContent: "space-between" }}
                      >
                        <div className="flex">
                          <input
                            type="radio"
                            name="sort_order"
                            className="numberInput"
                            checked={data.status}
                            style={{ height: "25px" }}
                            onClick={(e) =>
                              setdata((prev) => ({
                                ...prev,
                                status: 1,
                              }))
                            }
                          />
                          On
                        </div>
                        <div className="flex">
                          <input
                            type="radio"
                            name="sort_order"
                            className="numberInput"
                            checked={!data?.status}
                            style={{ height: "25px" }}
                            onClick={(e) =>
                              setdata((prev) => ({
                                ...prev,
                                status: 0,
                              }))
                            }
                          />
                          Off
                        </div>
                      </div>
                    </label>
                  </div>
                  <div className="row">
                    <label
                      className="selectLabel"
                      style={{
                        maxWidth: "400px",
                        maxHeight: "150px",
                        overflowX: "scroll",
                      }}
                    >
                      Item Group
                      <table className="user-table">
                        <tbody className="tbody">
                          {itemGroup?.map((item) => {
                            return (
                              <tr
                                key={item.item_group_uuid}
                                style={{ height: "30px" }}
                              >
                                <td
                                  className="flex"
                                  style={{ justifyContent: "flex-start" }}
                                >
                                  <input
                                    type="checkbox"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      onChangeGroupHandler(
                                        item.item_group_uuid
                                      );
                                    }}
                                    checked={data.item_group_uuid?.find(
                                      (a) => a === item.item_group_uuid
                                    )}
                                    style={{
                                      transform: "scale(1.3)",
                                    }}
                                  />
                                  <div style={{ width: "10px" }}></div>
                                  {item.item_group_title || ""}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </label>
                    <div style={{ flexDirection: "column", gap: "10px" }}>
                      <div>
                        Exclude Discount
                        <div
                          className="flex"
                          style={{ justifyContent: "flex-start", gap: "20px" }}
                        >
                          <div className="flex">
                            <input
                              type="checkbox"
                              name="sort_order"
                              className="numberInput"
                              checked={data.exclude_discount}
                              style={{ height: "25px", marginRight: "5px" }}
                              onClick={() =>
                                setdata((prev) => ({
                                  ...prev,
                                  exclude_discount: 1,
                                }))
                              }
                            />
                            Yes
                          </div>
                          <div className="flex">
                            <input
                              type="checkbox"
                              name="sort_order"
                              className="numberInput"
                              checked={!data.exclude_discount}
                              style={{ height: "25px", marginRight: "5px" }}
                              onClick={() =>
                                setdata((prev) => ({
                                  ...prev,
                                  exclude_discount: 0,
                                }))
                              }
                            />
                            No
                          </div>
                        </div>
                      </div>
                      <div>
                        Billing Type
                        <div
                          className="flex"
                          style={{ justifyContent: "flex-start", gap: "20px" }}
                        >
                          {["Invoice", "Estimate"]?.map((_i, idx) => (
                            <div
                              key={_i}
                              className="flex"
                              onClick={() =>
                                setdata((x) => ({
                                  ...x,
                                  billing_type: _i?.[0],
                                }))
                              }
                            >
                              <input
                                type="radio"
                                checked={
                                  data.billing_type === _i?.[0] ||
                                  (idx === 0 && !data.billing_type)
                                }
                                style={{ height: "25px", marginRight: "5px" }}
                              />
                              {_i}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

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
function DeleteItemPopup({ onSave, popupInfo, setItemsData }) {
  const [errMassage, setErrorMassage] = useState("");
  const [loading, setLoading] = useState(false);

  const submitHandler = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await axios({
        method: "delete",
        url: "/items/deleteItem",
        data: { item_uuid: popupInfo.item_uuid },
        headers: {
          "Content-Type": "application/json",
        },
      });
      if (response.data.success) {
        onSave();
      }
    } catch (err) {
      console.log(err);
      setErrorMassage("Order already exist");
    }
    setLoading(false);
  };

  return (
    <div className="overlay">
      <div className="modal" style={{ width: "fit-content" }}>
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
                <h1>Delete Items</h1>
              </div>
              <div className="row">
                <h1>{popupInfo.item_title}</h1>
              </div>

              <i style={{ color: "red" }}>
                {errMassage === "" ? "" : "Error: " + errMassage}
              </i>
              <div className="flex" style={{ justifyContent: "space-between" }}>
                {loading ? (
                  <button
                    className="submit"
                    id="loading-screen"
                    style={{ background: "red", width: "120px" }}
                  >
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
                  </button>
                ) : (
                  <button
                    type="submit"
                    className="submit"
                    style={{ background: "red" }}
                  >
                    Confirm
                  </button>
                )}
                <button type="button" className="submit" onClick={onSave}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
function CounterPrices({ close, item }) {
  const [countersList, setCountersList] = useState();
  const [modifiedPrices, setModifiedPrices] = useState({});
  const [loadingState, setLoadingState] = useState();
  const [promptState, setPromptState] = useState();

  const saveCounterPrice = async (counter_uuid) => {
    setLoadingState((prev) => ({ ...prev, [counter_uuid]: true }));
    try {
      await axios({
        method: "patch",
        url: "/counters/item_special_price/" + counter_uuid,
        data: [
          {
            item_uuid: item.item_uuid,
            price: modifiedPrices?.[counter_uuid],
          },
        ],
      });

      setCountersList((prev) =>
        prev.map((i) =>
          i.counter_uuid === counter_uuid
            ? { ...i, special_price: modifiedPrices?.[counter_uuid] }
            : i
        )
      );
    } catch (error) {}
    setLoadingState((prev) => ({ ...prev, [counter_uuid]: false }));
  };

  const deleteSpecialPrice = async (counter_uuid) => {
    setLoadingState((prev) => ({ ...prev, [counter_uuid]: true }));
    try {
      await axios({
        method: "patch",
        url: "/counters/delete_special_price",
        data: { counter_uuid, item_uuid: item.item_uuid },
      });
      setPromptState(null);
      setCountersList((prev) =>
        prev.filter((i) => i.counter_uuid !== counter_uuid)
      );
    } catch (error) {}
    setLoadingState((prev) => ({ ...prev, [counter_uuid]: false }));
  };

  const deleteConfirmation = (counter) => {
    setPromptState({
      message: `Item ${item?.item_title}'s special price will be removed from counter '${counter?.counter_title}'. Continue?`,
      actions: [
        { label: "Cancel", classname: "black", action: () => setPromptState() },
        {
          label: "Continue",
          classname: "delete",
          action: () => deleteSpecialPrice(counter?.counter_uuid),
        },
      ],
    });
  };

  useEffect(() => {
    (async () => {
      try {
        const response = await axios.get(
          `/counters/counter-special-prices/${item?.item_uuid}`
        );
        if (response.data) setCountersList(response.data);
      } catch (error) {
        console.error(error);
      }
    })();
  }, []);

  return (
    <>
      <div className="overlay" style={{ zIndex: 9999999 }}>
        <div
          className="modal"
          style={{ padding: 0, maxHeight: "unset", overflow: "hidden" }}
        >
          <div>
            <div className="theme-heading">
              <h2>Counter Special Prices</h2>
              <button className="close-btn" onClick={close}>
                <IoIosCloseCircle />
              </button>
            </div>
            <div
              className="table-container-user"
              style={{
                height: "80vh",
                width: "80vw",
                padding: "0 0 10px",
                overflow: "auto",
              }}
            >
              <table className="user-table performance-summary-table nohover">
                <thead>
                  <tr>
                    <th>Counter Title</th>
                    <th>Route Title</th>
                    <th>Special Price (Original Price: {item?.item_price})</th>
                  </tr>
                </thead>
                <tbody className="tbody">
                  {countersList?.map((counter) => (
                    <tr key={counter?.counter_uuid} style={{ height: "30px" }}>
                      <td>
                        {counter?.counter_title || (
                          <small style={{ opacity: ".45", fontWeight: "600" }}>
                            N/A
                          </small>
                        )}
                      </td>
                      <td>
                        {counter?.route_title || (
                          <small style={{ opacity: ".45", fontWeight: "600" }}>
                            N/A
                          </small>
                        )}
                      </td>
                      <td>
                        <div>
                          <input
                            type="text"
                            value={
                              modifiedPrices[counter?.counter_uuid] ||
                              counter?.special_price
                            }
                            onChange={(e) =>
                              setModifiedPrices((prev) => ({
                                ...prev,
                                [counter?.counter_uuid]: e.target.value,
                              }))
                            }
                          />
                          <div>
                            {loadingState?.[counter?.counter_uuid] ? (
                              <span
                                className="loader"
                                style={{
                                  width: "20px",
                                  height: "20px",
                                  borderWidth: "2px",
                                }}
                              />
                            ) : (
                              <>
                                {+counter?.special_price ===
                                  +modifiedPrices[counter?.counter_uuid] ||
                                !modifiedPrices[counter?.counter_uuid] ? (
                                  <IoCheckmarkDoneOutline
                                    className="table-icon checkmark"
                                    style={{ margin: 0 }}
                                  />
                                ) : (
                                  <FaSave
                                    style={{ margin: 0 }}
                                    className="table-icon"
                                    title="Save current price as special item price"
                                    onClick={() =>
                                      saveCounterPrice(counter.counter_uuid)
                                    }
                                  />
                                )}
                                <DeleteOutlineIcon
                                  style={{ color: "red" }}
                                  className="table-icon"
                                  onClick={() => deleteConfirmation(counter)}
                                />
                              </>
                            )}
                          </div>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
      {promptState && <Prompt {...promptState} />}
    </>
  );
}
