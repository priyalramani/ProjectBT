import React, { useEffect, useMemo, useState } from "react"

const OrderPrint = ({
	renderID,
	counter = [],
	counters = [],
	order = { item_details: [] },
	allOrderItems,
	date = "",
	user = {},
	itemData = [],
	item_details = [],
	reminderDate,
	footer = false,
	paymentModes = [],
	charges = []
}) => {
	const isEstimate = order?.order_type === "E"
	const [gstValues, setGstVAlues] = useState([])

	let deliveryMessage = useMemo(
		() =>
			paymentModes?.filter(
				a => counters?.find(a => order?.counter_uuid === a.counter_uuid)?.payment_modes?.filter(b => b === a.mode_uuid)?.length
			),
		[counters, order?.counter_uuid, paymentModes]
	)
	useEffect(() => {
		let arr = []
		let gst_value = order.item_details.map(a => a.gst_percentage)
		gst_value = gst_value.filter((item, pos) => {
			return gst_value.indexOf(item) === pos
		})

		for (let a of gst_value) {
			let data = order.item_details.filter(b => +b.gst_percentage === a)
			let amt = data.length > 1 ? data.map(b => +b?.item_total).reduce((a, b) => +a + b) : data.length ? +data[0].item_total : 0
			let value = +amt - (+amt * 100) / (100 + a)

			if (value)
				arr.push({
					value: a,
					tex_amt: (amt - value).toFixed(2),
					amount: value.toFixed(2)
				})
		}
		setGstVAlues(arr)
	}, [order.item_details])
	let total_desc_amt =
		order?.item_details?.map(item => {
			const itemInfo = itemData?.find(a => a.item_uuid === item.item_uuid)
			let itemQty = (+item.b || 0) * (+itemInfo?.conversion || 1) + (+item.p || 0)
			let unit_price = (+item?.item_total || 0) / (+itemQty || 1)
			let tex_amt = (+unit_price || 0) - ((+unit_price || 0) * 100) / (100 + (+item.gst_percentage || 0)) || 0
			let dsc_amt = (+(item?.price || item.price) - (+unit_price || 0)) * itemQty || 0
			return { dsc_amt, tex_amt }
		}) || []

	const isBorderItem = item => {
		let time = new Date().getTime()
		return time - item?.created_at < reminderDate * 86400000
	}

	const deductions = [
		["Replacement", order?.replacement],
		["Adjustment", order?.adjustment],
		["Shortage", order?.shortage]
	]

	return (
		<div
			id={renderID}
			style={{
				width: "170mm",
				height: "128mm",
				border: "1px solid black",
				pageBreakAfter: "always",
				display: "flex",
				flexDirection: "column",
				justifyContent: "space-between"
			}}
		>
			<table style={{ width: "100%" }}>
				<tr>
					<td
						colSpan={28}
						style={{
							textAlign: "center",
							fontWeight: "600",
							fontSize: "small",
							width: "100%"
						}}
					>
						{!isEstimate ? <b>GST INVOICE</b> : <b>ESTIMATE</b>}
					</td>
				</tr>
				<tr>
					{!isEstimate ? (
						<>
							<td style={{ width: "50%" }} colSpan={14}>
								<table>
									<tr>
										<td
											style={{
												fontWeight: "600",
												fontSize: "larger",
												lineHeight: 0.5
											}}
										>
											Bharat Traders
										</td>
									</tr>
									<tr>
										<td style={{ fontWeight: "600", fontSize: "x-small" }}>
											Ganesh Nagar, Near Sharda Convent School,
											<br /> Ganesh Nagar, Gondia - 441401
										</td>
									</tr>
									<tr>
										<td style={{ fontWeight: "600", fontSize: "x-small" }}>Phone: 9422551074</td>
									</tr>
									<tr>
										<td style={{ fontWeight: "600", fontSize: "x-small" }}>Email: bharattradersgondia96@gmail.com</td>
									</tr>
									<tr>
										<td style={{ fontWeight: "600", fontSize: "x-small" }}>GSTIN: 27ABIPR1186M1Z2</td>
									</tr>
									<tr>
										<td style={{ fontWeight: "600", fontSize: "x-small" }}>FSSAI : 20230106104339794</td>
									</tr>
								</table>
							</td>
							<td colSpan={14}>
								<table>
									<tr>
										<td style={{ fontWeight: "600", fontSize: "x-small" }}>M/S {counter?.counter_title || ""}</td>
									</tr>
									{counter?.address ? (
										<tr>
											<td style={{ fontWeight: "600", fontSize: "x-small" }}>{counter?.address || ""}</td>
										</tr>
									) : (
										""
									)}

									{counter?.mobile?.length ? (
										<tr>
											<td style={{ fontWeight: "600", fontSize: "x-small" }}>
												{counter?.mobile
													?.map(i => i.mobile)
													?.filter(i => i?.[0])
													?.join(", ") || ""}
											</td>
										</tr>
									) : (
										""
									)}
									{counter?.food_license ? (
										<tr>
											<td style={{ fontWeight: "600", fontSize: "x-small" }}>Food License: {counter?.food_license}</td>
										</tr>
									) : (
										""
									)}
									{counter?.gst ? (
										<tr>
											<td style={{ fontWeight: "600", fontSize: "x-small" }}>GSTIN: {counter?.gst}</td>
										</tr>
									) : (
										""
									)}
								</table>
							</td>
						</>
					) : (
						<td colSpan={28}>
							<div>
								<p style={{ fontWeight: "600", fontSize: "small" }}>M/S {counter?.counter_title || ""}</p>
								{counter?.address ? <p style={{ fontWeight: "600", fontSize: "small" }}>{counter?.address || ""}</p> : ""}

								{counter?.mobile?.length ? (
									<p style={{ fontWeight: "600", fontSize: "small" }}>
										{counter?.mobile
											?.filter(i => i?.mobile?.[0])
											?.map(i => i?.mobile)
											?.join(", ") || ""}
									</p>
								) : (
									""
								)}
								{counter?.food_license ? (
									<p style={{ fontWeight: "600", fontSize: "small" }}>Food License: {counter?.food_license}</p>
								) : (
									""
								)}
								{counter?.gst ? <p style={{ fontWeight: "600", fontSize: "small" }}>GSTIN: {counter?.gst}</p> : ""}
							</div>
						</td>
					)}
				</tr>
				<tr>
					<th colSpan={28}>
						<hr
							style={{
								height: "3px",
								backgroundColor: "#000",
								width: "100%"
							}}
						/>
					</th>
				</tr>
				<tr>
					<td style={{ fontWeight: "600", fontSize: "x-small" }} colSpan={7}>
						{isEstimate ? `Estimate: E${order?.invoice_number}` : `Invoice: N${order?.invoice_number}`}
					</td>
					<td style={{ fontWeight: "600", fontSize: "x-small" }} colSpan={7}>
						Date:{" "}
						{"dd/mm/yy"
							.replace("mm", ("00" + (date?.getMonth() + 1).toString()).slice(-2))
							.replace("yy", ("0000" + date?.getFullYear().toString()).slice(-4))
							.replace("dd", ("00" + date?.getDate().toString()).slice(-2))}
					</td>
					<td style={{ fontWeight: "600", fontSize: "x-small" }} colSpan={7}>
						S.M: {user}
					</td>
					<td style={{ fontWeight: "600", fontSize: "x-small" }} colSpan={7}>
						Memo: Cash
					</td>
				</tr>
				<tr>
					<th colSpan={28}>
						<hr
							style={{
								height: "3px",
								backgroundColor: "#000",
								width: "100%"
							}}
						/>
					</th>
				</tr>
				<tr
					style={{
						backgroundColor: "#EDEDED"
					}}
				>
					<th style={{ fontWeight: "600", fontSize: "x-small" }}>S.</th>
					<th style={{ fontWeight: "600", fontSize: "x-small" }} colSpan={3}>
						Product
					</th>
					<th style={{ fontWeight: "600", fontSize: "x-small" }} colSpan={2}>
						Pack
					</th>
					<th style={{ fontWeight: "600", fontSize: "x-small" }} colSpan={2}>
						MRP
					</th>
					<th style={{ fontWeight: "600", fontSize: "x-small" }} colSpan={2}>
						Qty
					</th>
					<th style={{ fontWeight: "600", fontSize: "x-small" }} colSpan={2}>
						Free
					</th>
					<th style={{ fontWeight: "600", fontSize: "x-small" }} colSpan={2}>
						Tax (%)
					</th>
					<th style={{ fontWeight: "600", fontSize: "x-small" }} colSpan={2}>
						Unit Price
					</th>
					<th style={{ fontWeight: "600", fontSize: "x-small" }} colSpan={2}>
						Dsc A (%)
					</th>
					<th style={{ fontWeight: "600", fontSize: "x-small" }} colSpan={2}>
						Dsc B (%)
					</th>
					<th style={{ fontWeight: "600", fontSize: "x-small" }} colSpan={2}>
						Dsc Amt
					</th>
					<th style={{ fontWeight: "600", fontSize: "x-small" }} colSpan={2}>
						Tax Amt
					</th>
					<th style={{ fontWeight: "600", fontSize: "x-small" }} colSpan={2}>
						Net Unit Price
					</th>
					<th style={{ fontWeight: "600", fontSize: "x-small" }} colSpan={2}>
						Amount
					</th>
				</tr>
				<tr>
					<th colSpan={28}>
						<hr
							style={{
								height: "3px",
								backgroundColor: "#000",
								width: "100%"
							}}
						/>
					</th>
				</tr>

				{item_details?.map((item, i) => {
					const itemInfo = itemData.find(a => a.item_uuid === item.item_uuid)
					let itemQty = (+item.b || 0) * (+itemInfo?.conversion || 1) + (+item.p || 0)
					let unit_price = (+item.item_total || 0) / (+itemQty || 1)
					let tex_amt = (+unit_price || 0) - ((+unit_price || 0) * 100) / (100 + (+item.gst_percentage || 0))
					let dsc_amt = (+(item.price || item.item_price || 0) - (+unit_price || 0)) * itemQty
					let boldedItem = isBorderItem(item)

					return (
						<tr style={{ borderBottom: "1px solid #000" }} className="order_item">
							<td style={{ fontWeight: "600", fontSize: "x-small" }}>{item?.sr || i + 1}.</td>
							<td
								style={
									boldedItem
										? {
												fontWeight: "900",
												border: "1px solid #000",
												fontSize: "x-small"
										  }
										: { fontWeight: "600", fontSize: "x-small" }
								}
								colSpan={3}
							>
								{itemInfo?.item_title || ""}
							</td>
							<td
								style={{
									fontWeight: "600",
									fontSize: "x-small",
									textAlign: "center"
								}}
								colSpan={2}
							>
								{itemInfo?.conversion || ""}
							</td>

							<td
								style={{
									fontWeight: "600",
									fontSize: "x-small",
									textAlign: "center"
								}}
								colSpan={2}
							>
								Rs. {itemInfo?.mrp || ""}
							</td>
							<td
								style={{
									fontWeight: "600",
									fontSize: "x-small",
									textAlign: "center"
								}}
								colSpan={2}
							>
								{(item.b || 0) + ":" + (item?.p || 0)}
							</td>
							<td
								style={{
									fontWeight: "600",
									fontSize: "x-small",
									textAlign: "center"
								}}
								colSpan={2}
							>
								{item?.free || 0}
							</td>
							<td
								style={{
									fontWeight: "600",
									fontSize: "x-small",
									textAlign: "center"
								}}
								colSpan={2}
							>
								{item?.gst_percentage || 0} %
							</td>
							<td
								style={{
									fontWeight: "600",
									fontSize: "x-small",
									textAlign: "center"
								}}
								colSpan={2}
							>
								{item?.price || item?.item_price || unit_price || 0}
							</td>
							<td
								style={{
									fontWeight: "600",
									fontSize: "x-small",
									textAlign: "center"
								}}
								colSpan={2}
							>
								{item?.charges_discount?.length ? item?.charges_discount[0]?.value || 0 : 0}
							</td>
							<td
								style={{
									fontWeight: "600",
									fontSize: "x-small",
									textAlign: "center"
								}}
								colSpan={2}
							>
								{item?.charges_discount?.length > 1 ? item.charges_discount[1]?.value || 0 : 0}
							</td>
							<td
								style={{
									fontWeight: "600",
									fontSize: "x-small",
									textAlign: "center"
								}}
								colSpan={2}
							>
								{(dsc_amt || 0).toFixed(2)}
							</td>
							<td
								style={{
									fontWeight: "600",
									fontSize: "x-small",
									textAlign: "center"
								}}
								colSpan={2}
							>
								{(tex_amt || 0).toFixed(2)}
							</td>
							<td
								style={{
									fontWeight: "600",
									fontSize: "x-small",
									textAlign: "center"
								}}
								colSpan={2}
							>
								{(unit_price || 0).toFixed(2)}
							</td>
							<td
								style={{
									fontWeight: "600",
									fontSize: "x-small",
									textAlign: "center"
								}}
								colSpan={2}
							>
								{item?.item_total || 0}
							</td>
						</tr>
					)
				})}
			</table>
			<table style={{ width: "100%" }}>
				{footer ? (
					<>
						<tr>
							<th colSpan={28}>
								<hr
									style={{
										height: "3px",
										backgroundColor: "#000",
										width: "100%"
									}}
								/>
							</th>
						</tr>
						<tr style={{ borderBottom: "1px solid #000" }}>
							<td style={{ fontWeight: "600", fontSize: "x-small" }}></td>
							<th style={{ fontWeight: "600", fontSize: "x-small" }} colSpan={3}>
								Total
							</th>
							<td
								style={{
									fontWeight: "600",
									fontSize: "x-small",
									textAlign: "center"
								}}
								colSpan={2}
							></td>
							<td
								style={{
									fontWeight: "600",
									fontSize: "x-small",
									textAlign: "center"
								}}
								colSpan={2}
							></td>
							<th
								style={{
									fontWeight: "600",
									fontSize: "x-small",
									textAlign: "center"
								}}
								colSpan={2}
							>
								{allOrderItems?.length > 1
									? allOrderItems?.map(a => +a.b || 0).reduce((a, b) => a + b)
									: allOrderItems?.[0]?.b || 0}
								:
								{allOrderItems?.length > 1
									? allOrderItems?.map(a => +a.p || 0).reduce((a, b) => a + b)
									: allOrderItems?.[0]?.p || 0}
							</th>
							<th
								style={{
									fontWeight: "600",
									fontSize: "x-small",
									textAlign: "center"
								}}
								colSpan={2}
							>
								{allOrderItems?.length > 1
									? allOrderItems?.map(a => +a.free || 0).reduce((a, b) => a + b)
									: allOrderItems?.[0]?.free || 0}
							</th>
							<td
								style={{
									fontWeight: "600",
									fontSize: "x-small",
									textAlign: "center"
								}}
								colSpan={2}
							></td>
							<td
								style={{
									fontWeight: "600",
									fontSize: "x-small",
									textAlign: "center"
								}}
								colSpan={2}
							></td>
							<td
								style={{
									fontWeight: "600",
									fontSize: "x-small",
									textAlign: "center"
								}}
								colSpan={2}
							></td>
							<td
								style={{
									fontWeight: "600",
									fontSize: "x-small",
									textAlign: "center"
								}}
								colSpan={2}
							></td>
							<th
								style={{
									fontWeight: "600",
									fontSize: "x-small",
									textAlign: "center"
								}}
								colSpan={2}
							>
								{(total_desc_amt?.length > 1
									? total_desc_amt?.map(a => a.dsc_amt).reduce((a, b) => a + b)
									: total_desc_amt[0]?.dsc_amt || 0
								).toFixed(2)}
							</th>
							<th
								style={{
									fontWeight: "600",
									fontSize: "x-small",
									textAlign: "center"
								}}
								colSpan={2}
							>
								{(total_desc_amt?.length > 1
									? total_desc_amt?.map(a => a.tex_amt).reduce((a, b) => a + b)
									: total_desc_amt[0]?.tex_amt || 0
								).toFixed(2)}
							</th>
							<td
								style={{
									fontWeight: "600",
									fontSize: "x-small",
									textAlign: "center"
								}}
								colSpan={2}
							></td>
							<th
								style={{
									fontWeight: "600",
									fontSize: "x-small",
									textAlign: "center"
								}}
								colSpan={2}
							>
								{(
									(allOrderItems?.length > 1
										? allOrderItems?.map(a => +a.item_total || 0).reduce((a, b) => a + b)
										: +allOrderItems?.[0]?.item_total) || 0
								).toFixed(2)}
							</th>
						</tr>
					</>
				) : (
					""
				)}
				<tr>
					<th colSpan={28}>
						<hr
							style={{
								height: "3px",
								backgroundColor: "#000",
								width: "100%"
							}}
						/>
					</th>
				</tr>

				{footer ? (
					<>
						{!isEstimate ? (
							<>
								<tr>
									<td colSpan={14}>
										<table style={{ borderRight: "1px solid black", width: "100%" }}>
											<tr>
												<td style={{ fontWeight: "600", fontSize: "x-small" }}>
													<b> Bank:</b> Punjab National Bank, Gondia
												</td>
											</tr>
											<tr>
												<td style={{ fontWeight: "600", fontSize: "x-small" }}>
													<b>Ac. No:</b> 0182008700014607
												</td>
											</tr>
											<tr>
												<td style={{ fontWeight: "600", fontSize: "x-small" }}>
													<b>IFSC:</b> PUNB0018200
												</td>
											</tr>

											<tr>
												<td
													style={{
														textAlign: "center",
														fontWeight: "600",
														fontSize: "small",
														width: "100%"
													}}
												>
													<b>Or</b>
												</td>
											</tr>

											<tr>
												<td style={{ fontWeight: "600", fontSize: "x-small" }}>
													<b>GPay / PhonePe:</b> 9422551074
												</td>
											</tr>
											<tr>
												<td style={{ fontWeight: "600", fontSize: "x-small" }}>
													<b>UPI / VPA:</b> 9422551074@upi / 9422551074@ybl
												</td>
											</tr>
										</table>
									</td>
									<td colSpan={14}>
										<table style={{ width: "100%" }}>
											<tr>
												<td
													style={{
														fontWeight: "600",
														fontSize: "xx-small",
														textAlign: "left"
													}}
												>
													GST:
												</td>
											</tr>
											{gstValues.length
												? gstValues.map(a => (
														<tr>
															<td
																style={{
																	fontWeight: "600",
																	fontSize: "xx-small",
																	textAlign: "left"
																}}
															>
																{a.tex_amt}*{a.value}%={a.amount}
															</td>
														</tr>
												  ))
												: ""}
											{charges?.map(_charge => (
												<tr>
													<td
														style={{
															fontWeight: "600",
															fontSize: "xx-small",
															textAlign: "right"
														}}
													>
														{_charge.narration} : +{_charge.amt}
													</td>
												</tr>
											))}
											{deductions
												?.filter(i => +i[1])
												?.map(i => (
													<tr>
														<td
															style={{
																fontWeight: "600",
																fontSize: "xx-small",
																textAlign: "right"
															}}
														>
															{i[0]} : -{i[1]}
														</td>
													</tr>
												))}
											<tr>
												<td
													style={{
														fontSize: "x-large",
														fontWeight: "600",
														textAlign: "right"
													}}
												>
													Order Total: {order?.order_grandtotal || 0}
												</td>
											</tr>
										</table>
									</td>
								</tr>
								<tr>
									<th colSpan={28}>
										<hr
											style={{
												height: "3px",
												backgroundColor: "#000",
												width: "100%"
											}}
										/>
									</th>
								</tr>
								<tr>
									{deliveryMessage?.length ? (
										<td
											colSpan={28}
											style={{
												fontWeight: "600",
												fontSize: "xx-small",
												textAlign: "left"
											}}
										>
											{deliveryMessage.map((a, i) => (i === 0 ? a.mode_title : ", " + a.mode_title))} Allowed
										</td>
									) : (
										""
									)}
								</tr>
							</>
						) : (
							<tr>
								<td
									colSpan={28}
									style={{
										fontSize: "x-large",
										fontWeight: "600",
										textAlign: "right",
										width: "100%"
									}}
								>
									Order Total: {order?.order_grandtotal || 0}
								</td>
							</tr>
						)}
					</>
				) : (
					<tr>
						<td
							colSpan={28}
							style={{
								fontSize: "xx-large",
								fontWeight: "600er",
								textAlign: "center"
							}}
						>
							Continue...
						</td>
					</tr>
				)}
			</table>
		</div>
	)
}

export default OrderPrint