import React, { useEffect } from "react"

const PendingPaymentsSummary = ({ print, counterOrders, paymentsSummaryRef }) => {
	const itemsQuantity = items =>
		Object.values(
			items?.reduce(
				(quantities, i) => ({
					b: (quantities?.b || 0) + +i?.b,
					p: (quantities?.p || 0) + +i?.p
				}),
				{}
			)
		)?.join(":")

	useEffect(() => {
		print?.()
	}, [print])

	const getDate = i => {
		const date = new Date(i)
		return [date.getDate(), date.getMonth() + 1, date.getFullYear()].map(i => i.toString().padStart(2, "0")).join("/")
	}

	return (
		<div id="pending-payments-summary" ref={paymentsSummaryRef ?? null}>
				<h3>{new Date().toGMTString().slice(0, -4)}</h3>
				<div>
					{Object.keys(counterOrders)?.map(counter_uuid => (
						<div key={counter_uuid} className="counter-wrapper">
							<div>
								<h3>{counterOrders[counter_uuid]?.orders?.[0]?.counter_title}</h3>
								<span>{counterOrders[counter_uuid]?.numbers?.[0]}</span>
							</div>
							{/* <span className="numbers">9876543210, 9876543210, 9876543210</span> */}
							<table>
								<tbody>
									{counterOrders[counter_uuid]?.orders?.map(order => (
										<tr>
											<td>{getDate(+order?.time_1)}</td>
											<td>{(order?.order_type === "I" ? "" : "E") + order?.invoice_number}</td>
											<td>Rs.{order?.order_grandtotal}</td>
											<td>{itemsQuantity(order?.item_details)}</td>
											<td>[ {order?.notes?.join(", ")} ]</td>
										</tr>
									))}
									<tr>
										<td colSpan={5} style={{ textAlign: "right" }}>
											TOTAL: Rs.{counterOrders[counter_uuid]?.orders?.reduce((sum, i) => sum + +i?.order_grandtotal, 0)}
										</td>
									</tr>
								</tbody>
							</table>
						</div>
					))}
				</div>
			</div>
	)
}

export default PendingPaymentsSummary
