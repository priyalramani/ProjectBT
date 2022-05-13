import React from 'react'
import "./style.css"
import  NavLink  from './Navlink'
import {
    Add as VouchersIcon,
    Redeem as InventoryIcon,
    AccountBalanceWalletOutlined as AccountIcon,
    AutoAwesomeMosaicOutlined as MasterIcon,
    AssessmentOutlined as ReportsIcon,
    FlashOn as QuickAccessIcon,
    SettingsOutlined as SettingsIcon,
  } from "@mui/icons-material";
const Sidebar = () => {
  return (
    <div className="left-panel" style={{ position: "relative" }}>
     
      <div className="nav"  style={{marginTop:"70px"}}>
      
                <NavLink
                  title={"Master"}
                  icon={<MasterIcon sx={{ fontSize: 50 }} />}

                  isActive={true}
                  menuList={[
                    {
                      name: "Items",
                      link: "/",
                    },
                    {
                      name: "Categories",
                      link: "/itemCategories",
                    },
                    {
                      name: "Counter",
                      link: "/",
                    },
                    {
                      name: "Routes",
                      link: "/routes",
                    },
                    {
                      name: "Counter Group",
                      link: "/counterGroup",
                    },
                    {
                      name: "Item Group",
                      link: "/itemGroup",
                    },
                    {
                      name: "Users",
                      link: "/",
                    },

                  ]}
                />
                <NavLink
                  title={"Reports"}
                  icon={<ReportsIcon sx={{ fontSize: 50 }} />}
                  isActive={false}
                  

                  menuList={[
                  
                    
                  ]}
                />
                <NavLink
                  

                  title={"Quick Access"}
                  icon={<QuickAccessIcon sx={{ fontSize: 50 }} />}
                  isActive={false}
                  menuList={ [
                   
                  ]}
                />
                <NavLink
                  title="Setup"
                  icon={<SettingsIcon sx={{ fontSize: 50 }} />}
                  href="/setup"
                  isActive={false}
                  menuList={[]}
                />
              </div>
              </div>
  )
}

export default Sidebar