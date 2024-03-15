import React, { useEffect, useState } from "react"
import Context from "./context"
import axios from "axios"

const State = props => {
	const [calculationPopup, setcalculationPopup] = useState(null)
	const [cashRegisterPopup, setCashRegisterPopup] = useState(null)
	const [isItemAvilableOpen, setIsItemAvilableOpen] = useState(false)
	const [bankStatementImport, setBankStatementImport] = useState(false)
	const [view, setView] = useState(sessionStorage.getItem("view") || 0)
	const [skipStages, setSkipStages] = useState(false);
	const [notification, setNotification] = useState(null)
	const [loading, setLoading] = useState(null)
	const [pageLoading, setPageLoading] = useState(null)
	const updateOrder = async (param = {}) => {
		let controller = new AbortController();
		if (loading) {
		  return;
		}
		setLoading(true);
		setTimeout(() => {
		  setNotification({
			message: "Error Processing Request",
			success: false,
		  });
		  controller.abort();
		  setLoading(false);
		}, 45000);
		try {
		  const { data , sendPaymentReminder } = param;
		  const orderUpdateData = data;
		  const maxState = Math.max(
			...orderUpdateData?.status?.map((s) => +s.stage)
		  );
	
		  if (+orderUpdateData?.payment_pending && maxState < 3.5) {
			orderUpdateData.status.push({
			  stage: 3.5,
			  time: Date.now(),
			  user_uuid: localStorage.getItem("user_uuid"),
			});
		  }
	
		  const response = await axios({
			method: "put",
			url: "/orders/putOrders",
			signal: controller.signal,
			data: [
			  {
				...data,
				item_details: data.item_details?.map((i) => ({
				  ...i,
				  price: +(+i.price).toFixed(3),
				})),
			  },
			],
			headers: {
			  "Content-Type": "application/json",
			},
		  });
		  if (response.data.success) {
			
			
			if (sendPaymentReminder)
			  sendPaymentReminders([data?.counter_uuid]);
		  }
		  setLoading(false);
		 
		} catch (err) {
		  setLoading(false);
		}
	  };
	const CalculateLines = async (days, type) => {
		setLoading(true)
		const response = await axios({
			method: "put",
			url: "/counters/CalculateLines",
			data: { days, type },
			headers: {
				"Content-Type": "application/json"
			}
		})
		if (response.data.success) {
			setLoading(false)
		}
	}
	const updateServerPdf = async data => {
		console.log(data)
	}

	const [promptState, setPromptState] = useState()

	const getSpecialPrice = (counters, item, counter_uuid) => {
		const data = counters
			?.find(i => i.counter_uuid === counter_uuid)
			?.item_special_price?.find(i => i.item_uuid === item.item_uuid)
		return data
	}
	useEffect(() => {
		if(notification){
			setTimeout(() => setNotification(null), 3000)
		}
	}
	, [notification])
	useEffect(() => {
		if(loading){
			setTimeout(() => setLoading(null), 10000)
		}
	}
	, [loading])
	useEffect(()=>{
		sessionStorage.setItem("view", view)
	},[view])

	const saveSpecialPrice = async (item, counter_uuid, setCounters, price) => {
		try {
			console.log({ item, counter_uuid, setCounters })
			const response = await axios({
				method: "patch",
				url: "/counters/item_special_price/" + counter_uuid,
				data: [{ item_uuid: item.item_uuid, price: price || item.p_price }],
				headers: { "Content-Type": "application/json" }
			})
			if (!response.data.success) return
			setCounters(list => list.map(i => (i.counter_uuid === counter_uuid ? response.data.counter : i)))
		} catch (error) {
			console.log(error)
		}
	}

	const deleteSpecialPrice = async (item, counter_uuid, setCounters) => {
		try {
			console.log({ item, counter_uuid, setCounters })
			setPromptState(null)
			const response = await axios({
				method: "patch",
				url: "/counters/delete_special_price",
				data: { item_uuid: item.item_uuid, counter_uuid: counter_uuid },
				headers: { "Content-Type": "application/json" }
			})
			if (!response.data.success) return
			setCounters(list => list.map(i => (i.counter_uuid === counter_uuid ? response.data.counter : i)))
		} catch (error) {
			console.log(error)
		}
	}

	const spcPricePrompt = (...params) => {
		setPromptState({
			active: true,
			message: "Item special price will be deleted. Do you wish to continue?",
			actions: [
				{ label: "Cancel", classname: "cancel", action: () => setPromptState(null) },
				{ label: "Confirm", classname: "confirm", action: () => deleteSpecialPrice(...params) }
			]
		})
	}

	const PAYMENT_REMINDER_NOTIFICATION = "7e65e044-9953-433b-a9d7-cced4730b189"
	const sendPaymentReminders = async counter_ids => {
		if (!counter_ids?.length) return
		const response = await axios.post("/whatsapp_notifications/send_payment_reminders", {
			notification_uuid: PAYMENT_REMINDER_NOTIFICATION,
			counter_ids
		})

		if (response?.data?.success)
			setNotification({
				success: true,
				message: "Messages sent successfully"
			})
		else
			setNotification({
				success: false,
				message: "Failed to send messages"
			})
		setTimeout(() => setNotification(null), 3000)
	} 

	  

	return (
		<Context.Provider
			value={{
				calculationPopup,
				setcalculationPopup,
				CalculateLines,
				loading,
				setLoading,
				notification,
				setNotification,
				updateServerPdf,
				cashRegisterPopup,
				setCashRegisterPopup,
				isItemAvilableOpen,
				setIsItemAvilableOpen,
				promptState,
				setPromptState,
				getSpecialPrice,
				saveSpecialPrice,
				deleteSpecialPrice,
				spcPricePrompt,
				pageLoading,
				setPageLoading,
				PAYMENT_REMINDER_NOTIFICATION,
				sendPaymentReminders,
				skipStages,
				setSkipStages,
				view,
				setView,
				bankStatementImport,
				setBankStatementImport,
				updateOrder,
			}}
		>
			{props.children}
		</Context.Provider>
	)
}

export default State
