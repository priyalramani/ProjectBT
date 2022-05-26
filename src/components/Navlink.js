import React from "react";
import { Link } from "react-router-dom";
import { ViewGridIcon } from "@heroicons/react/solid";
const NavLink = ({
  title,
  icon,
  menuList,
  draggable,
  href,
  setIsItemAvilableOpen,
}) => {
  return (
    <Link
      to={{ pathname: href }}
      className="nav_link_container"
      onClick={() => {}}
    >
      <div
        className={`nav-link`}
        draggable={draggable}
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
            <span className={`nav_title`}>
              {title?.slice(0, 31)}
              {title?.length > 32 && "..."}
            </span>
          </p>
        </>
        {/* Submenu popup*/}
        {menuList && (
          <div className="menuItems">
            {menuList
              .filter((a) => a)
              .map((menu) => (
                <div
                  className="item"
                  key={Math.random()}
                  onClick={() => {
                    return menu.name === "Trips"
                      ? setIsItemAvilableOpen((prev) => !prev)
                      : "";
                  }}
                >
                  {<Link to={menu.link}>{menu.name}</Link>}
                </div>
              ))}
          </div>
        )}
      </div>
    </Link>
  );
};

export default NavLink;
