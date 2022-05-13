import React,{useState,useEffect} from 'react'
import Header from '../../components/Header';
import Sidebar from '../../components/Sidebar';
import "./styles.css"
import axios from "axios"
const RoutesPage = () => {
    const [routesData,setRoutesData]=useState([])
    const [popupForm,setPopupForm]=useState(false)
    const getRoutesData=async()=>{
        const response= await axios({
            method: "get",
            url: "/routes/getRoutes",
            
            headers: {
              "Content-Type": "application/json",
            },
          });
          if(response.data.success)
          setRoutesData(response.data.result)
    }
    useEffect(() => {
      getRoutesData()
    }, [popupForm])
    
  return (
    <>
            <Sidebar
                
            />
            <Header />
            <div className="item-sales-container orders-report-container">
                <div id="heading">
                    <h2>Routes</h2>
                </div>
                <div id="item-sales-top" >
                    <div id="date-input-container" style={{overflow:"visible"}}>
                        
                       
                        <button
                            className="item-sales-search"
                            onClick={()=>setPopupForm(true)}
                        >
                             Add
                        </button>
                    </div>
                   
                    
                </div>
                <div className="table-container-user item-sales-container">
                    <Table itemsDetails={routesData} />
                </div>
            </div>
            {popupForm?<NewUserForm onSave={()=>setPopupForm(false)} setRoutesData={setRoutesData}/>:""}
        </>
  )
}

export default RoutesPage
function Table({ itemsDetails }) {

    return (

        <table className="user-table" style={{ maxWidth: "100vw",height:"fit-content", overflowX: "scroll" }}>
            <thead>
                <tr>
                    <th>S.N</th>
                    <th colSpan={3}>Routes Title</th>
                    <th>Sort Order</th>
                    
                </tr>
            </thead>
            <tbody>
                {itemsDetails.sort((a,b)=>a.sort_order-b.sort_order)?.map((item, i) =>

                    <tr key={Math.random()} style={{height:"30px"}}>
                        <td>{i + 1}</td>
                        <td colSpan={3}>{item.route_title}</td>
                        <td >{item.sort_order}</td>
                      
                    </tr>
                )}
            </tbody>
        </table>
    );
}
function NewUserForm({ onSave,popupInfo,setRoutesData }) {
    const [data, setdata] = useState({});

    const [errMassage, setErrorMassage] = useState("");
    const submitHandler = async (e) => {
        e.preventDefault()
        if(!data.route_title){
            setErrorMassage("Please insert Route Title")
            return
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
            setRoutesData((prev) =>
              prev.map((i) => (i.user_uuid === data.user_uuid ? data : i))
            );
            onSave();
          }
        } else {
          const response = await axios({
            method: "post",
            url: "/routes/postRoute",
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
      <div className="modal" style={{height:"fit-content",width:"fit-content"}}>
        <div className="content" style={{height:"fit-content",padding:"20px",width:"fit-content"}}>
        
          
      <div style={{ overflowY: "scroll" }}>
        <form className="form" 
        onSubmit={submitHandler}
        >
          <div className="row">
            <h1>Add Route</h1>
          </div>
  
          <div className="formGroup">
            <div className="row">
              <label className="selectLabel">
                Route Title
                <input
                  type="text"
                  name="route_title"
                  className="numberInput"
                  value={data?.route_title}
                  onChange={(e) =>
                    setdata({
                      ...data,
                      route_title: e.target.value,
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
           
           
            
        
          </div>
          <i style={{ color: "red" }}>{errMassage === "" ? "" : "Error: " + errMassage}</i>
  
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
  