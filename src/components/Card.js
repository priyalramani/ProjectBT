const Card = ({
  title2,
  title1,
  selectedOrder,
  details,
  status,
  dateTime,
  rounded,
  onDoubleClick,
}) => {
  var days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const monthNames = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];

  function formatAMPM(date) {
    var hours = date.getHours();
    var minutes = date.getMinutes();
    var ampm = hours >= 12 ? "pm" : "am";
    hours = hours % 12;
    hours = hours ? hours : 12; // the hour '0' should be '12'
    minutes = minutes < 10 ? "0" + minutes : minutes;
    var strTime = hours + ":" + minutes + " " + ampm;
    return strTime;
  }
  function hours(oldDate) {
    let date = new Date();
    var hours = date.getHours() - oldDate.getHours();
    var day = date.getDate() - oldDate.getDate();
    let finalHours = day * 24 + hours;

    return finalHours;
  }
  
  return (
    <>
      <div onDoubleClick={onDoubleClick}>
        <button
          className={`card-focus 
            ${rounded ? "rounded" : ""} 
            ${selectedOrder ? "selected-seat" : ""}
            `}
          style={{ margin: "5px" }}
        >
          <div
            className={`card ${rounded ? "rounded" : ""}`}
            style={{
              backgroundColor:
                hours(new Date(dateTime)) >=
                +details?.map((a) => a.order_time_1)[0]
                  ? "#9c1010"
                  : hours(new Date(dateTime)) >=
                    +details.map((a) => a.order_time_1)[0]
                  ? "#f2e017"
                  : "#fff",
            }}
          >
            <p className="title2">{title1 ? title1 : title2}</p>
            <p className="caption" style={{ color: "#000" }}>
              {title1 ? title2 : ""}
            </p>

            <div>{status}</div>
            <div style={{ fontSize: "10px" }}>{`${
              days[new Date(dateTime).getDay()] || ""
            } ${new Date(dateTime).getDate() || ""} ${
              monthNames[new Date().getMonth()] || ""
            }`}</div>
            <div style={{ fontSize: "10px" }}>
              {formatAMPM(new Date(dateTime)) || ""}
            </div>
          </div>
        </button>
      </div>
      {/* {on_order && visibleContext?.id === on_order.seat_uuid &&
            <ContextMenu
            //   itemRef={itemRef}
              id={on_order?.uuid}
              visibleContext={visibleContext}
              setVisibleContext={setVisibleContext}
              isMouseInsideContext={isMouseInsideContext}
              order_type={0}
              seats={seats}
              currentSeat={on_order?.seat_uuid}
            />
          } */}
    </>
  );
};

export default Card;
