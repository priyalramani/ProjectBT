import React, { useState, useEffect } from "react";
import Header from "../../components/Header";
import Sidebar from "../../components/Sidebar";
import axios from "axios";
import {
  ChevronUpIcon,
  ChevronDownIcon,
  MenuAlt2Icon,
} from "@heroicons/react/solid";
const Users = () => {
    const [users, setUsers] = useState([]);
    const [popupForm, setPopupForm] = useState(false);
    
 
 
    const getUsers = async () => {
      const response = await axios({
        method: "get",
        url: "/users/GetUserList",
  
        headers: {
          "Content-Type": "application/json",
        },
      });
      if (response.data.success) setUsers(response.data.result);
    };

    useEffect(() => {
      getUsers();
    }, [popupForm]);
  
  
    return (
      <>
        <Sidebar />
        <Header />
        <div className="item-sales-container orders-report-container">
          <div id="heading">
            <h2>Users </h2>
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
            <Table itemsDetails={users} setPopupForm={setPopupForm}/>
          </div>
        </div>
        {popupForm ? (
          <NewUserForm
            onSave={() => setPopupForm(false)}
         popupInfo={popupForm}
            setUsers={setUsers}
          />
        ) : (
          ""
        )}
      </>
    );
}

export default Users
function Table({ itemsDetails,setPopupForm }) {
  const [items, setItems] = useState("user_title");
  const [order, setOrder] = useState("asc");
    return (
      <table
        className="user-table"
        style={{ maxWidth: "100vw", height: "fit-content", overflowX: "scroll" }}
      >
        <thead>
          <tr>
            <th>S.N</th>
            <th colSpan={2}> <div className="t-head-element">
              <span>User Title</span>
              <div className="sort-buttons-container">
                <button
                  onClick={() => {
                    setItems("user_title");
                    setOrder("asc");
                  }}
                >
                  <ChevronUpIcon className="sort-up sort-button" />
                </button>
                <button
                  onClick={() => {
                    setItems("user_title");
                    setOrder("desc");
                  }}
                >
                  <ChevronDownIcon className="sort-down sort-button" />
                </button>
              </div>
            </div></th>
            <th colSpan={2}> <div className="t-head-element">
              <span>Login Id</span>
              <div className="sort-buttons-container">
                <button
                  onClick={() => {
                    setItems("login_username");
                    setOrder("asc");
                  }}
                >
                  <ChevronUpIcon className="sort-up sort-button" />
                </button>
                <button
                  onClick={() => {
                    setItems("login_username");
                    setOrder("desc");
                  }}
                >
                  <ChevronDownIcon className="sort-down sort-button" />
                </button>
              </div>
            </div></th>
            <th colSpan={2}>Permission</th>
            <th colSpan={2}> <div className="t-head-element">
              <span>Mobile</span>
              <div className="sort-buttons-container">
                <button
                  onClick={() => {
                    setItems("user_mobile");
                    setOrder("asc");
                  }}
                >
                  <ChevronUpIcon className="sort-up sort-button" />
                </button>
                <button
                  onClick={() => {
                    setItems("user_mobile");
                    setOrder("desc");
                  }}
                >
                  <ChevronDownIcon className="sort-down sort-button" />
                </button>
              </div>
            </div></th>
            <th colSpan={2}> <div className="t-head-element">
              <span>Status</span>
              <div className="sort-buttons-container">
                <button
                  onClick={() => {
                    setItems("status");
                    setOrder("asc");
                  }}
                >
                  <ChevronUpIcon className="sort-up sort-button" />
                </button>
                <button
                  onClick={() => {
                    setItems("status");
                    setOrder("desc");
                  }}
                >
                  <ChevronDownIcon className="sort-down sort-button" />
                </button>
              </div>
            </div></th>
           
          </tr>
        </thead>
        <tbody>
          {itemsDetails
          .filter((a) => a.user_title)
          .sort((a, b) =>
            order === "asc"
              ? typeof a[items] === "string"
                ? a[items].localeCompare(b[items])
                : a[items] - b[items]
              : typeof a[items] === "string"
              ? b[items].localeCompare(a[items])
              : b[items] - a[items]
          )
            ?.map((item, i) => (
              <tr key={Math.random()} style={{ height: "30px" }} onClick={()=>setPopupForm({type:"edit",data:item})}>
                <td>{i + 1}</td>
                <td colSpan={2}>{item.user_title}</td>
                <td colSpan={2}>{item.login_username}</td>
                <td colSpan={2}>{item?.user_role?.map((a,i)=>i===0?a:","+a)||"-"}</td>

                <td colSpan={2}>{item.user_mobile||"-"}</td>
                
                <td colSpan={2}>{item.status}</td>
                
              </tr>
            ))}
        </tbody>
      </table>
    );
  }
  function NewUserForm({ onSave, popupInfo, setUsers }) {
    const [data, setdata] = useState({user_mobile:"",user_type:"1",status:"1"});
    const [errMassage, setErrorMassage] = useState("");
useEffect(()=>popupInfo?.type==="edit"?setdata(popupInfo.data):{},[])

    const submitHandler = async (e) => {
      e.preventDefault();
      if(!data.user_title||!data.login_password||!data.login_username){
        setErrorMassage("Please insert user_title login_username login_password");
        return;
  
      }else if(!(data.user_mobile===""|| data.user_mobile?.length===10)){
        setErrorMassage("Please enter 10 Numbers in Mobile");
        return;
  
      }
      
     
      
      if (popupInfo?.type === "edit") {
        const response = await axios({
          method: "put",
          url: "/counters/putCounter",
          data,
          headers: {
            "Content-Type": "application/json",
          },
        });
        if (response.data.success) {
          setUsers((prev) =>
            prev.map((i) => (i.user_uuid === data.user_uuid ? data : i))
          );
          onSave();
        }
      } else {
        const response = await axios({
          method: "post",
          url: "/users/postUser",
          data,
          headers: {
            "Content-Type": "application/json",
          },
        });
        if (response.data.success) {
          setUsers((prev) => [...prev, data]);
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
                  <h1>{popupInfo.type==="edit"?"Edit":"Add"} User </h1>
                </div>
  
                <div className="form">
                  <div className="row">
                    <label className="selectLabel">
                      User Title
                      <input
                        type="text"
                        name="route_title"
                        className="numberInput"
                        value={data?.user_title}
                        onChange={(e) =>
                          setdata({
                            ...data,
                            user_title: e.target.value,
                          })
                        }
                        maxLength={42}
                      />
                    </label>
                    
                    
                    <label className="selectLabel">
                    Login Username
                    <input
                      type="text"
                      name="sort_order"
                      className="numberInput"
                      value={data?.login_username}
                      onChange={(e) =>
                        setdata({
                          ...data,
                          login_username: e.target.value,
                        })
                      }
                    />
                  </label>
                </div>
                <div className="row">
                <label className="selectLabel" style={{width:"50%"}}>
                    Login Password
                    <input
                      type="text"
                      name="sort_order"
                      className="numberInput"
                      value={data?.login_password}
                      
                      onChange={(e) =>
                        setdata({
                          ...data,
                          login_password: e.target.value,
                        })
                      }
                    />
                  </label>
                <label className="selectLabel" style={{width:"50%"}}>
                    Mobile
                    <input
                      type="number"
                      name="sort_order"
                      className="numberInput"
                      value={data?.user_mobile}
                      
                      onChange={(e) =>
                        setdata({
                          ...data,
                          user_mobile: e.target.value,
                        })
                      }
                    />
                  </label>
                
                </div>
                  <div className="row">
                  <label className="selectLabel" style={{height:"100px"}}>
                    Roles
                    <select
                      name="user_type"
                      className="select"
                      value={data?.user_role}
                      style={{height:"100px"}}
                      onChange={(e) =>{
                            let catData = data?.user_role || [];
                            let options = Array.from(
                              e.target.selectedOptions,
                              (option) => option.value
                            );
                            for (let i of options) {
                              if (catData.filter((a) => a === i).length)
                                catData = catData.filter((a) => a !== i);
                              else
                                catData = [
                                  ...catData,
                                  i,
                                ];
                            }
                            // data = occasionsData.filter(a => options.filter(b => b === a.occ_uuid).length)
                            console.log(options, catData);
                        
                            setdata({ ...data, user_role: catData });
                          }
                      }
                        
                      
                      multiple
                    >
                  
                    
                          <option value="1">
                            Order
                          </option>
                          <option value="2">
                            Processing
                          </option>
                          <option value="3">
                            Checking
                          </option>
                          <option value="4">
                            Delivery
                          </option>
                  
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
  