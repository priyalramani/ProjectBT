import React from 'react'
import { Button, Switch } from "@mui/material";
import { ThreeSixty, ToggleOff } from "@mui/icons-material";
import { useNavigate } from 'react-router-dom';

const Header = () => {
    const Navigate=useNavigate()
  return (
    <div className="header">
      <h1>Bharat Traders</h1>
      <div className="header_right">
        <div style={{ hight: "100%", display: "flex", justifyContent: "center", alignItems: "center", fontSize: "15px", marginRight: "10px" }}>

          {/* <div>{Object.keys(bulkUploadedData).length ? bulkUploadedData.total - bulkUploadedData?.count + "/" + bulkUploadedData.total + " Items Uploaded" : ""}</div> */}
        </div>
        {/* {page.includes('Inv-Ac') ? */}
          {/* <div style={{ display:'flex', alignItems: 'center'}}>
            <Button onClick={() => Navigate('/page1')} variant="contained" startIcon={<ThreeSixty />} style={{backgroundColor:'#44cd4a', fontWeight: 'bold'}}>
              POS
            </Button>
          </div>  */}
        {/* :
          <div className="header_toggle_btn" ref={ref}>
            <ToggleOff
              className="icon_btn"
              onClick={() => {
                !dropdown && getData();
                setDropdown((prevState) => !prevState);
              }}
            />
            {dropdown ? (
              <div className="toggle_dropdown">
                {/* Toggle buttons 
                {services
                  .filter((service) => service.serviceStatus === "Y")
                  .map((item, index) => (
                    <div
                      key={item + "_" + index}
                      className="toggle_dropdown_item"
                    >
                      {item.name}{" "}
                      <GreenSwitch
                        onClick={(e) => handleClick(e, item)}
                        checked={item.status}
                      />
                    </div>
                  ))}
              </div>
            ) : (
              ""
            )}
          </div>
        } */}
        <div className="header_right_link"
          onClick={() => {
            // if (page.includes('Inv-Ac')) {
            //   Navigate('/Inv-Ac')
            //   setInventoryPageContent('');
            // } else {
            //   !page.includes(selectedPage) && Navigate(selectedPage)
            // }
          }}
        >
          Dashboard
        </div>
        <div className="header_right_link" 
        onClick={() => 
        // setLogoutPopup(true)
        {}
        }>
          Logout
        </div>
      </div>
      {/* {logoutPopup ? <Logout onClose={() => setLogoutPopup(false)} /> : ""} */}

    </div>
  )
}

export default Header