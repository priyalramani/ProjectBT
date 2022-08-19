import React, { useState } from "react";
import "./style.css";
import NavLink from "./Navlink";
import {
  AutoAwesomeMosaicOutlined as MasterIcon,
  AssessmentOutlined as ReportsIcon,
  FlashOn as QuickAccessIcon,
  SettingsOutlined as SettingsIcon,
  UpgradeOutlined,
} from "@mui/icons-material";
import AssessmentIcon from "@mui/icons-material/Assessment";
import AddIcon from "@mui/icons-material/Add";
import axios from "axios";
const Sidebar = ({ setIsItemAvilableOpen }) => {
  const [loading, setLoading] = useState(false);
  const updateMinLevel = async () => {
    if (!loading) return;
    setLoading(true);
    const response = await axios({
      method: "get",
      url: "users/MinLevelUpdate",

      headers: {
        "Content-Type": "application/json",
      },
    });
    console.log(response.data.result.user_type);
    if (response.data.success) setLoading(false);
  };
  return (
    <div
      className="left-panel"
      style={{ position: "relative", zIndex: "9000000" }}
    >
      <div className="nav" style={{ height: "100vh" }}>
        <NavLink
          title="New"
          icon={<AddIcon sx={{ fontSize: 50 }} />}
          // href="/admin/addOrder"
          isActive={false}
          menuList={[
            {
              name: "Add Order",
              link: "/admin/addOrder",
            },
            {
              name: "Add Stock",
              link: "/admin/addStock",
            },
          ]}
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
            {
              name: "Warehouse",
              link: "/admin/warehouse",
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
            {
              name: "Signed Bills",
              link: "/admin/signedBills",
            },
            {
              name: "Tasks",
              link: "/admin/tasks",
            },
          ]}
        />
        <NavLink
          title={"Report"}
          icon={<AssessmentIcon sx={{ fontSize: 50 }} />}
          isActive={false}
          menuList={[
            {
              name: "User Activity",
              link: "/admin/userActivity",
            },
            {
              name: "UPI Transaction",
              link: "/admin/upiTransactionReport",
            },
            {
              name: "Completed Orders",
              link: "/admin/completeOrderReport",
            },
            {
              name: "Items Wise",
              link: "/admin/OrderItemReport",
            },
            {
              name: "Completed Trips",
              link: "/admin/CompletedTripsReport",
            },
            {
              name: "Counter Ledger",
              link: "/admin/CounterLeger",
            },
            {
              name: "Outstandings",
              link: "/admin/Outstandings",
            },
            {
              name: "Pending Entry",
              link: "/admin/pendingEntry",
            },
            {
              name: "Current Stock",
              link: "/admin/currentStock",
            },
            {
              name: "Stock Transfer Vochers",
              link: "/admin/stockTransferVochers",
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
            {
              name: "Order Range Incentive",
              link: "/admin/OrderRangeIncentive",
            },
            {
              name: "Delivery Incentive",
              link: "/admin/DeliveryIncentive",
            },
            {
              name: "Order Item Incentive",
              link: "/admin/ItemIncentive",
            },
          ]}
        />
        <div className="nav_link_container" onClick={updateMinLevel} style={{width:"100%"}}>
          <div className={`nav-link`}>
            <>
              <UpgradeOutlined sx={{ fontSize: 50 }} />
              <p>
                <span className={`nav_title`}>Update MinLevel</span>
              </p>
            </>
            {/* Submenu popup*/}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
