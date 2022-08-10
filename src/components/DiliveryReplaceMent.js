import React from "react";

function DiliveryReplaceMent({ onSave, data, setData }) {
  return (
    <div className="overlay" style={{zIndex:"9999999999999"}}>
      <div
        className="modal"
        style={{ height: "fit-content", width: "max-content" }}
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
            <form className="form">
              <div className="formGroup">
                <div
                  className="row"
                  style={{ flexDirection: "row", alignItems: "center" }}
                >
                  <div style={{ width: "100px" }}>Replacement</div>
                  <label
                    className="selectLabel flex"
                    style={{ width: "100px" }}
                  >
                    <input
                      type="number"
                      name="route_title"
                      className="numberInput"
                      value={data.actual}
                      style={{ width: "100px" }}
                      onChange={(e) =>
                        setData((prev) => ({
                          ...prev,
                          actual: e.target.value,
                        }))
                      }
                      maxLength={42}
                      onWheel={(e) => e.preventDefault()}
                    />
                    {/* {popupInfo.conversion || 0} */}
                  </label>
                </div>
                <div
                  className="row"
                  style={{ flexDirection: "row", alignItems: "center" }}
                >
                  <div style={{ width: "100px" }}>Shortage</div>
                  <label
                    className="selectLabel flex"
                    style={{ width: "100px" }}
                  >
                    <input
                      type="number"
                      name="route_title"
                      className="numberInput"
                      value={data.shortage}
                      style={{ width: "100px" }}
                      onChange={(e) =>
                        setData((prev) => ({
                          ...prev,
                          shortage: e.target.value,
                        }))
                      }
                      maxLength={42}
                      onWheel={(e) => e.preventDefault()}
                    />
                    {/* {popupInfo.conversion || 0} */}
                  </label>
                </div>
                <div
                  className="row"
                  style={{ flexDirection: "row", alignItems: "center" }}
                >
                  <div style={{ width: "100px" }}>Adjustment</div>
                  <label
                    className="selectLabel flex"
                    style={{ width: "100px" }}
                  >
                    <input
                      type="number"
                      name="route_title"
                      className="numberInput"
                      value={data.adjustment}
                      style={{ width: "100px" }}
                      onChange={(e) =>
                        setData((prev) => ({
                          ...prev,
                          adjustment: e.target.value,
                        }))
                      }
                      maxLength={42}
                      onWheel={(e) => e.preventDefault()}
                    />
                    {/* {popupInfo.conversion || 0} */}
                  </label>
                </div>
                {data.adjustment ? (
                  <div
                    className="row"
                    style={{ flexDirection: "row", alignItems: "center" }}
                  >
                    <div style={{ width: "100px" }}>Adjustment Remarks</div>
                    <label
                      className="selectLabel flex"
                      style={{ width: "100px" }}
                    >
                      <textarea
                        type="number"
                        name="route_title"
                        className="numberInput"
                        value={data.adjustment_remarks}
                        style={{ width: "100px", height: "100px" }}
                        onChange={(e) =>
                          setData((prev) => ({
                            ...prev,
                            adjustment_remarks: e.target.value,
                          }))
                        }
                        onWheel={(e) => e.preventDefault()}
                      />
                      {/* {popupInfo.conversion || 0} */}
                    </label>
                  </div>
                ) : (
                  ""
                )}
              </div>

              <div className="flex" style={{ justifyContent: "space-between" }}>
                <button
                  type="button"
                  style={{ backgroundColor: "red" }}
                  className="submit"
                  onClick={onSave}
                >
                  Cancel
                </button>
                <button type="button" className="submit" onClick={onSave}>
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DiliveryReplaceMent;
