import React, { useState, useEffect, useContext, useRef } from 'react';



const Card = ({ title2, title1, caption, color, price, rounded, item, onclickFunction, on_order, cursorItemRef, index, seats, visibleContext, setVisibleContext, isMouseInsideContext }) => {

  return (


        <>
          <div>
            <button
            //   ref={itemRef}
              className={`card-focus ${rounded ? 'rounded' : ''}`}
              onContextMenu={(e) => {
                e.preventDefault();
                if (on_order) {
                  setVisibleContext({ id: on_order.seat_uuid, elemProperties: e.currentTarget.getBoundingClientRect() });
                }
              }}
            >
              <div className={`card ${rounded ? 'rounded' : ''}`}>
                <p className='title2' >{title1 ? title1 : title2}</p>
                <p className='caption'>{title1 ? title2 : ''}</p>
                <div className={`horizontal-line`} style={{ background: `${color}` }}></div>
                {color !== '#4AC959' && on_order ? <div className='seatTimer'>
                  <div>1000</div>
                  <div>(Rs.{on_order ? on_order.price : 0})</div>
                </div> :
                  <div style={{ height: "50px" }}></div>
                }
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
    
     
  )
}

export default Card
