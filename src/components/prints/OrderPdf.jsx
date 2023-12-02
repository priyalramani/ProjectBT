import axios from "axios"
import React, { useEffect, useState } from "react"
import { useParams } from "react-router-dom"
import OrderPrint from "./OrderPrint"

const OrderPdf = () => {
	const params = useParams()
	const [paymentModes, setPaymentModes] = useState([])
	const [counter, setCounter] = useState([])
	const [counters, setCounters] = useState([])
	const [order, setOrder] = useState(null)
	const [user, setUser] = useState({})
	const [reminderDate, setReminderDate] = useState()
	const [itemData, setItemsData] = useState([])

	const getCounters = async counters => {
		const response = await axios({
			method: "post",
			url: "/counters/GetCounterList",
			data: { counters },
			headers: {
				"Content-Type": "application/json"
			}
		})
		if (response.data.success) setCounters(response.data.result)
	}

	const getItemsData = async items => {
		const response = await axios({
			method: "post",
			url: "/items/GetItemList",
			data: { items },
			headers: {
				"Content-Type": "application/json"
			}
		})
		if (response.data.success) setItemsData(response.data.result)
	}

	const getCounter = async () => {
		const response = await axios({
			method: "get",
			url: "/counters/GetCounterData",
			headers: {
				"Content-Type": "application/json"
			}
		})
		if (response.data.success) setCounter(response.data.result)
	}

	const getUser = async () => {
		const response = await axios({
			method: "get",
			url: "/users/GetUser/" + order.status[0]?.user_uuid,
			headers: {
				"Content-Type": "application/json"
			}
		})
		if (response.data.success) setUser(response.data.result)
	}

	const GetPaymentModes = async () => {
		const response = await axios({
			method: "get",
			url: "/paymentModes/GetPaymentModesList",
			headers: {
				"Content-Type": "application/json"
			}
		})
		if (response.data.success) setPaymentModes(response.data.result)
	}

	const getItemsDataReminder = async () => {
		const response = await axios({
			method: "get",
			url: "/items/getNewItemReminder",
			headers: {
				"Content-Type": "application/json"
			}
		})
		if (response.data.success) setReminderDate(response.data.result)
	}

	const getOrder = async () => {
		const api_response = await axios.get("/orders/GetOrder/" + params.order_uuid)
		if (!api_response.data.success) return console.log("Failed to fetch order")
		setOrder(api_response.data.result)
		getItemsDataReminder()
		getItemsData(api_response.data.result.item_details.map(a => a.item_uuid))
		getCounter()
		getCounters([api_response.data.result?.counter_uuid])
		GetPaymentModes()
		getUser()
	}

	useEffect(() => {
		getOrder()
	}, [])

	return (
		<div id="item-container" style={{ backgroundColor: "#fff" }}>
			{order &&
				Array.from(Array(Math.ceil(order?.item_details?.length / 12)).keys())?.map((a, i) => (
					<OrderPrint
						counter={counter.find(a => a.counter_uuid === order?.counter_uuid)}
						reminderDate={reminderDate}
						order={order}
						date={new Date(order?.status?.[0]?.time)}
						user={user?.user_title || ""}
						itemData={itemData}
						item_details={order?.item_details?.slice(a * 12, 12 * (a + 1))}
						footer={!(order?.item_details?.length > 12 * (a + 1))}
						paymentModes={paymentModes}
						counters={counters}
						
					/>
				))}
		</div>
	)
}

export default OrderPdf
