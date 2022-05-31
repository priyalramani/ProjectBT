import React from "react";
import "./style.css";
import NavLink from "./Navlink";
import {
  AutoAwesomeMosaicOutlined as MasterIcon,
  AssessmentOutlined as ReportsIcon,
  FlashOn as QuickAccessIcon,
  SettingsOutlined as SettingsIcon,
} from "@mui/icons-material";
import AddIcon from '@mui/icons-material/Add';
const Sidebar = ({setIsItemAvilableOpen}) => {
  return (
    <div className="left-panel" style={{ position: "relative" }}>
      <div className="nav" style={{ paddingTop: "70px", height: "100vh" }}>
      <NavLink
          title="New Order"
          icon={<AddIcon sx={{ fontSize: 50 }} />}
          href="/admin/addOrder"
          isActive={false}
          menuList={[]}
        />
        <NavLink
          title={"Master"}
          icon={<MasterIcon sx={{ fontSize: 50 }} />}
          isActive={true}
          menuList={[
            {
              name: "Items",
              link: "/admin/items",
            },
            {
              name: "Categories",
              link: "/admin/itemCategories",
            },
            {
              name: "Counter",
              link: "/admin/counter",
            },
            {
              name: "Routes",
              link: "/admin/routes",
            },
            {
              name: "Counter Group",
              link: "/admin/counterGroup",
            },
            {
              name: "Item Group",
              link: "/admin/itemGroup",
            },
            {
              name: "Users",
              link: "/admin/adminUsers",
            },
          ]}
        />
       
        <NavLink
        setIsItemAvilableOpen={setIsItemAvilableOpen}
          title={"Quick Access"}
          icon={<QuickAccessIcon sx={{ fontSize: 50 }} />}
          isActive={false}
          menuList={[
            {
              name: "Trips",
              link: "#",
            },
          ]}
        />
         <NavLink
          title={"Setup"}
          icon={<SettingsIcon sx={{ fontSize: 50 }} />}
          isActive={false}
          menuList={[
            {
              name: "Auto Increase Quantity",
              link: "/admin/autoIncreaseQty",
            },
            {
              name: "Auto Add Item",
              link: "/admin/autoIncreaseItem",
            },
          ]}
        />
        {/* <NavLink
          menuList={[]}
          title={"Users"}
          icon={<QuickAccessIcon sx={{ fontSize: 50 }} />}
          isActive={false}
          href="/users"
        /> */}
        
      </div>
    </div>
  );
};

export default Sidebar;
