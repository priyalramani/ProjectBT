const Card = ({
  title2,
  title1,
  selectedOrder,
  color,
  status,
  price,
  rounded,
  item,
  onclickFunction,
  on_order,
  cursorItemRef,
  index,
  seats,
  visibleContext,
  setVisibleContext,
  isMouseInsideContext,
}) => {
  console.log(selectedOrder);
  return (
    <>
      <div>
        <button
          className={`card-focus 
            ${rounded ? "rounded" : ""} 
            ${selectedOrder ? "selected-seat" : ""}
            `}
          style={{ margin: "10px" }}
        >
          <div className={`card ${rounded ? "rounded" : ""}`}>
            <p className="title2">{title1 ? title1 : title2}</p>
            <p className="caption">{title1 ? title2 : ""}</p>
            <div
              className={`horizontal-line`}
              style={{ background: `${color}` }}
            ></div>
            <div className="seatTimer">
              <div>{status}</div>
              {/* <div>(Rs.{on_order ? on_order.price : 0})</div> */}
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
