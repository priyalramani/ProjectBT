import React, { useState, useEffect } from "react"
import axios from "axios"

function NotesPopup({
	onSave: close,
	order,
	setSelectedOrder,
	notesPopup,
	HoldOrder,
	customSubmit,
	orderInfo,
	counterName
}) {
	const [notes, setNotes] = useState([])
	const [edit, setEdit] = useState(false)

	useEffect(() => {
		setNotes(order?.notes || [])
	}, [order])

	const submitHandler = async () => {
		if (customSubmit) return customSubmit({ notes, order_uuid: order?.order_uuid })
		const response = await axios({
			method: "put",
			url: "/orders/putOrderNotes",
			data: { notes, invoice_number: order?.invoice_number },
			headers: {
				"Content-Type": "application/json"
			}
		})
		if (response.data.success) {
			setSelectedOrder(prev => ({
				...prev,
				notes
			}))
			if (notesPopup === "hold") setTimeout(HoldOrder, 2000)
			close()
		}
	}

	return (
		<>
			<div className="overlay" style={{ zIndex: 9999999999 }}>
				<div className="modal" style={{ height: "fit-content", width: "max-content" }}>
					<div className="flex" style={{ justifyContent: "space-between" }}>
						<div>
							<h3>Order Notes</h3>
							{orderInfo && (
								<div style={{ marginBottom: "10px" }}>
									<small>
										In <b>{counterName || "<Counter>"}</b> for order <b>{order?.invoice_number}</b> -{" "}
										<b>
											Rs.
											{order?.order_grandtotal}
										</b>
									</small>
								</div>
							)}
						</div>
						{notesPopup === "hold" ? <h3>Please Enter Notes</h3> : ""}
					</div>
					<div
						className="content"
						style={{
							height: "fit-content",
							padding: "10px",
							width: "fit-content"
						}}
					>
						<div style={{ overflowY: "scroll" }}>
							<form className="form">
								<div className="formGroup">
									<div className="row" style={{ flexDirection: "row", alignItems: "start" }}>
										<div style={{ width: "50px" }}>Notes</div>
										<label className="selectLabel flex" style={{ width: "200px" }}>
											<textarea
												name="route_title"
												className="numberInput"
												style={{ width: "200px", height: "200px" }}
												value={notes?.toString()?.replace(/,/g, "\n")}
												onChange={e => {
													setNotes(e.target.value.split("\n"))
													setEdit(true)
												}}
											/>
										</label>
									</div>
								</div>

								<div className="flex" style={{ justifyContent: "space-between" }}>
									<button onClick={close} className="closeButton">
										x
									</button>
									{edit ? (
										<button type="button" className="submit" onClick={submitHandler}>
											Save
										</button>
									) : (
										""
									)}
								</div>
							</form>
						</div>
					</div>
				</div>
			</div>
		</>
	)
}

export default NotesPopup