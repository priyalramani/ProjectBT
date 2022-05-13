import React from 'react'
import { Link } from "react-router-dom";
import { ViewGridIcon } from "@heroicons/react/solid";
const NavLink = ({ title,
    icon,
    isActive,
    menuList,
    
    draggable,
    href,
 
  }) => {
  return (
    <Link to={"/"}
        className="nav_link_container"
        onClick={ () => { }}
      >
        <div
          className={`nav-link ${ 1===1?'active' : ''}`}
          draggable={draggable}
        //   onClick={categoryFilterHandler}
          id={`item-category-${title?.toLowerCase()}`}
        >
          <>
            {icon}
            <p>
              {draggable && (
                <ViewGridIcon
                  style={{
                    minWidth: "1rem",
                    maxWidth: "1rem",
                    marginRight: 10,
                    cursor: "move",
                  }}
                />
              )}
              <span className={`nav_title ${window.location.pathname.includes("/page2") ? "page2" : ""}`}>{title?.slice(0, 31)}
                {title?.length > 32 && "..."}
              </span>
            </p>
          </>
          {/* Submenu popup*/}
          {menuList && (
            <div className="menu">
              {menuList.filter(a => a).map((menu) => (
                <div
                  className="item"
                  key={Math.random()}
                  onClick={() => {
                    console.log(menu)
                    // return (
                    //   menu.name === "Meal Calendar" ?
  
                    //     setIsMealSchedulingOpen(!isMealSchedulingOpen) :
                    //       menu.name === "Item Availability" ? +restrictions[0]?.other_quick_access_item_availability === 0
                    //         ? noWarning() :
                    //         setIsItemAvilableOpen(!isItemAvilableOpen) :
                    //         menu.name === "Daily Summary" ? +restrictions[0]?.other_report_Daily_summary === 0
                    //           ? "" :
                    //           setIsDailyReportSummary(!isDailyReportSummary)
                    //           : menu.content ?
                    //             setInventoryPageContent(menu.content)
                    //             : '')
                  }
                  }
                >
                  {
                    
                      <Link to={menu.link}>{menu.name}</Link>
                  }
                </div>
              ))}
            </div>
          )}
        </div>
      </Link >
  )
}

export default NavLink