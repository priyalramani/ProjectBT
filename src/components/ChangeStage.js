import axios from "axios";
import React, { useState } from "react";

const ChangeStage = ({ onClose, orders, stage }) => {
  const [data, setData] = useState({ stage: stage + 1 });
  const onSubmit = async () => {
    let user_uuid = localStorage.getItem("user_uuid");
    let time = new Date();
    let selectedData = orders;
    console.log(stage,data)
    let status =
      stage === 1
        ? +data.stage === 2
          ? [{ stage: 2, time: time.getTime(), user_uuid }]
          : +data.stage === 3
          ? [
              { stage: 2, time: time.getTime(), user_uuid },
              { stage: 3, time: time.getTime(), user_uuid },
            ]
          : +data.stage === 4
          ? [
              { stage: 2, time: time.getTime(), user_uuid },
              { stage: 3, time: time.getTime(), user_uuid },
              { stage: 4, time: time.getTime(), user_uuid },
            ]
          : [
              { stage: 2, time: time.getTime(), user_uuid },
              { stage: 3, time: time.getTime(), user_uuid },
              { stage: 4, time: time.getTime(), user_uuid },
              { stage: 5, time: time.getTime(), user_uuid },
            ]
        : stage === 2
        ? +data.stage === 3
          ? [{ stage: 3, time: time.getTime(), user_uuid }]
          : +data.stage === 4
          ? [
              { stage: 3, time: time.getTime(), user_uuid },
              { stage: 4, time: time.getTime(), user_uuid },
            ]
          : [
              { stage: 3, time: time.getTime(), user_uuid },
              { stage: 4, time: time.getTime(), user_uuid },
              { stage: 5, time: time.getTime(), user_uuid },
            ]
        : stage === 3
        ? +data.stage === 4
          ? [{ stage: 4, time: time.getTime(), user_uuid }]
          : [
              { stage: 4, time: time.getTime(), user_uuid },
              { stage: 5, time: time.getTime(), user_uuid },
            ]
        : [{ stage: 5, time: time.getTime(), user_uuid }];
    selectedData = selectedData.map((a) => ({ ...a, status: [...a.status, ...status] }));
    console.log(selectedData)
    const response = await axios({
      method: "put",
      url: "/orders/putOrders",
      data:selectedData,
      headers: {
        "Content-Type": "application/json",
      },
    });
    if (response.data.success) {
      onClose();
    }
  };
  console.log(stage);
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
                onSubmit(data);

              }}
            >
              <div className="formGroup">
                <div className="row">
                  <h3>Stage</h3>
                  <div
                    style={{ textDecoration: stage >= 1 ? "line-through" : "" }}
                  >
                    <input
                      type="radio"
                      checked={data.stage === 1}
                      onClick={() => {
                        if (stage >= 1) return;
                        setData({ ...data, stage: 1 });
                      }}
                    />
                    Processing
                  </div>
                  <div
                    style={{ textDecoration: stage >= 2 ? "line-through" : "" }}
                  >
                    <input
                      type="radio"
                      checked={data.stage === 2}
                      onClick={() => {
                        if (stage >= 2) return;
                        setData({ ...data, stage: 2 });
                      }}
                    />
                    Checking
                  </div>
                  <div
                    style={{ textDecoration: stage >= 3 ? "line-through" : "" }}
                  >
                    <input
                      type="radio"
                      checked={data.stage === 3}
                      onClick={() => {
                        if (stage >= 3) return;
                        setData({ ...data, stage: 3 });
                      }}
                    />
                    Delivery
                  </div>
                  <div
                    style={{ textDecoration: stage >= 4 ? "line-through" : "" }}
                  >
                    <input
                      type="radio"
                      checked={data.stage === 4}
                      onClick={() => {
                        if (stage >= 4) return;
                        setData({ ...data, stage: 4 });
                      }}
                    />
                    Complete
                  </div>
                  <div
                    style={{ textDecoration: stage >= 5 ? "line-through" : "" }}
                  >
                    <input
                      type="radio"
                      checked={data.stage === 5}
                      onClick={() => {
                        if (stage >= 5) return;
                        setData({ ...data, stage: 5 });
                      }}
                    />
                    Cancel
                  </div>
                </div>

                <div className="row">
                  <button type="submit" className="submit">
                    Save
                  </button>
                </div>
              </div>
            </form>
          </div>
          <button onClick={onClose} className="closeButton">
            x
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChangeStage;