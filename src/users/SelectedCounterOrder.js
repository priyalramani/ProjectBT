import { AiOutlineArrowLeft, AiOutlineSearch } from "react-icons/ai";
import { useState, useEffect } from "react";
import { openDB } from "idb";
import { useNavigate, useParams } from "react-router-dom";
const SelectedCounterOrder = () => {
  const [items, setItems] = useState([]);
  const [counter, setCounter] = useState({});
  const params=useParams()
  const [filterItemTitle, setFilterItemTile] = useState("");
  const [filterCompany, setFilterCompany] = useState("");
  const [itemsCategory, setItemsCategory] = useState([]);
  const [companies, setCompanies] = useState([]);
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
    store = await db
      .transaction("counters", "readwrite")
      .objectStore("counters");
    let counters = await store.getAll();
    setCounter(counters.find(a=>params.counter_uuid===a.counter_uuid));
  };
  useEffect(() => getIndexedDbData(), []);
  useEffect(() => {
      setItems(prev=>prev.map(a=>({...a,item_price:counter.item_special_price.find(b=>b.item_uuid===a.item_uuid)?.price||a.item_price})))
  }
  , [counter]);
  return (
    <div>
      <nav className="user_nav">
        <div className="user_menubar">
          <AiOutlineArrowLeft onClick={() => Navigate(-1)} />
        </div>

        <div className="user_searchbar flex">
          <AiOutlineSearch className="user_search_icon" />
          <input
            type="text"
            placeholder="search"
            value={filterItemTitle}
            onChange={(e) => setFilterItemTile(e.target.value)}
          />
        </div>
        <div>
          <select
            value={filterCompany}
            onChange={(e) => setFilterCompany(e.target.value)}
          >
            {companies.map((a) => (
              <option value={a.company_uuid}>{a.company_title}</option>
            ))}
          </select>
        </div>
      </nav>
      <div className="home">
        <div className="container">
          <div className="menucontainer">
            <div className="menus">
              {itemsCategory
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
                                .includes(filterItemTitle.toLocaleLowerCase())
                          )
                          ?.sort((a, b) => a - b)
                          .filter(
                            (a) => a.category_uuid === category.category_uuid
                          )
                          ?.map((item) => {
                            return (
                              <div key={item?.item_uuid} className="menu">
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
                                  {/* {state?.find(
                        (s) => s?.item_uuid === menu_item?.item_uuid
                      ) ? (
                        <button className={`addToCart activeAddCartBtn`}>
                          <span
                            className="fas fa-minus"
                            onClick={(e) =>
                              cartAmountDecreaseHandler(e, menu_item)
                            }
                          ></span>
                          <span className="count">
                            {
                              state?.find(
                                (s) => s?.item_uuid == menu_item?.item_uuid
                              )?.quantity
                            }
                          </span>
                          <span
                            className="fas fa-plus"
                            onClick={(e) =>
                              cartAmountIncreaseHandler(e, menu_item)
                            }
                          ></span>
                        </button>
                      ) : ( */}
                                  <button
                                    className="addButton"
                                    //   onClick={() => {
                                    //     (menu_item?.menu_item_addons?.length > 0 ||
                                    //       menu_item?.menu_item_multi?.length > 0) &&
                                    //       setIsCustomMenuOpen(!isCustomMenuOpen);
                                    //     menu_item?.menu_item_addons?.length > 0 ||
                                    //       menu_item?.menu_item_multi?.length > 0
                                    //       ? setCustomItem(menu_item)
                                    //       : addToCart(menu_item, [], []);
                                    //   }}
                                  >
                                    Add
                                  </button>
                                  {/* )} */}
                                  {/* {(menu_item?.menu_item_addons?.length > 0 ||
                        menu_item?.menu_item_multi?.length > 0) && (
                          <h4>customizable</h4>
                        )} */}
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
  );
};

export default SelectedCounterOrder;
