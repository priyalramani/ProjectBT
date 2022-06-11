import React from "react";

const MessagePopup = ({ onClose, message }) => {
  return (
    <div className="overlay">
      <div
        className="modal"
        style={{ height: "fit-content", width: "fit-content" }}
      >
        <div
          className="content"
          style={{
            height: "fit-content",
            padding: "20px",
            width: "fit-content",
          }}
        >
          <div style={{ overflowY: "scroll" }}>
            <form
              className="form"
              onSubmit={(e) => {
                e.preventDefault();
                onClose();
              }}
            >
              <div className="formGroup">
                <div className="row">
                  <h1 style={{ textAlign: "center" }}>{message}</h1>
                </div>

                <div className="row">
                  <button type="submit" className="submit">
                    Okay
                  </button>
                </div>
              </div>
            </form>

          </div>
        </div>
      </div>
    </div>
  );
};

export default MessagePopup;
