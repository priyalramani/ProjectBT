import axios from "axios"
import React, { useEffect, useState } from "react"
import Header from "../../components/Header"
import Sidebar from "../../components/Sidebar"
import Select from "react-select"
import { ChevronUpIcon, ChevronDownIcon } from "@heroicons/react/solid"

const ItemDetails = () => {

	const [counterGroup, setCounterGroup] = useState([])
	const [itemGroupFilter, setItemGroupFilter] = useState("")
	const [itemGroup, setItemGroup] = useState([])
	const [counter, setCounter] = useState([])
	const [companies, setCompanies] = useState([])
	const [items, setItems] = useState([])
	const [searchData, setSearchData] = useState({
		startDate: "",
		endDate: "",
		company_uuid: "",
		counter_uuid: ""
	})

	const getCounter = async () => {
		const response = await axios({
			method: "post",
			url: "/counters/GetCounterData",
			data: ["counter_title", "counter_uuid"],
			headers: {
				"Content-Type": "application/json"
			}
		})
		if (response.data.success) setCounter(response.data.result)
	}

	
	const getItemGroup = async () => {
		const response = await axios({
			method: "get",
			url: "/itemGroup/GetItemGroupList",

			headers: {
				"Content-Type": "application/json"
			}
		})
		if (response.data.success) setItemGroup(response.data.result)
	}

	const getCounterGroup = async () => {
		const response = await axios({
			method: "get",
			url: "/counterGroup/GetCounterGroupList",

			headers: {
				"Content-Type": "application/json"
			}
		})
		if (response.data.success) setCounterGroup(response.data.result)
	}

	const getCompanies = async () => {
		const response = await axios({
			method: "get",
			url: "/companies/getCompanies",

			headers: {
				"Content-Type": "application/json"
			}
		})
		if (response.data.success) setCompanies(response.data.result)
	}

	const getActivityData = async () => {
		let startDate = new Date(searchData.startDate + " 00:00:00 AM")
		startDate = startDate.getTime()
		let endDate = new Date(searchData.endDate + " 00:00:00 AM")
		endDate = endDate.getTime()
		const response = await axios({
			method: "post",
			url: "/orders/getOrderItemReport",
			data: {
				company_uuid: searchData.company_uuid,
				startDate,
				endDate,
				counter_uuid: searchData.counter_uuid
			},
			headers: {
				"Content-Type": "application/json"
			}
		})
		console.log("activity", response)
		if (response.data.success) setItems(response.data.result)
	}

	useEffect(() => {
		let time = new Date()
		let curTime = "yy-mm-dd"
			.replace("mm", ("00" + (time?.getMonth() + 1).toString()).slice(-2))
			.replace("yy", ("0000" + time?.getFullYear().toString()).slice(-4))
			.replace("dd", ("00" + time?.getDate().toString()).slice(-2))
		setSearchData(prev => ({
			...prev,
			startDate: curTime,
			endDate: curTime
		}))
		getCompanies()
		getCounterGroup()
		getItemGroup()
		getCounter()
	}, [])

	return (
		<>
			<Sidebar />
			<Header />
			<div className="item-sales-container orders-report-container">
				<div id="heading">
					<h2>Item Report</h2>
				</div>
				<div id="item-sales-top">
					<div
						id="date-input-container"
						style={{
							overflow: "visible",
							display: "flex",
							alignItems: "center",
							justifyContent: "space-between",
							width: "100%"
						}}
					>
						<div className="inputGroup">
							<label htmlFor="Warehouse">Start</label>
							<input
								type="date"
								onChange={e =>
									setSearchData(prev => ({
										...prev,
										startDate: e.target.value
									}))
								}
								value={searchData.startDate}
								placeholder="Search Counter Title..."
								className="searchInput"
							/>
						</div>
						<div className="inputGroup">
							<label htmlFor="Warehouse">End</label>
							<input
								type="date"
								onChange={e =>
									setSearchData(prev => ({
										...prev,
										endDate: e.target.value
									}))
								}
								value={searchData.endDate}
								placeholder="Search Route Title..."
								className="searchInput"
							/>
						</div>
						<div className="inputGroup">
							<label htmlFor="Warehouse">Company</label>
							<select
								onChange={e =>
									setSearchData(prev => ({
										...prev,
										company_uuid: e.target.value
									}))
								}
								value={searchData.company_uuid}
							>
								<option value="">All</option>
								{companies.map(a => (
									<option value={a.company_uuid}>{a.company_title}</option>
								))}
							</select>
						</div>
						<div className="inputGroup">
							<label htmlFor="Warehouse">Counter Group</label>
							<select
								onChange={e =>
									setSearchData(prev => ({
										...prev,
										counter_group_uuid: e.target.value
									}))
								}
								value={searchData.counter_group_uuid}
							>
								<option value="">All</option>
								{counterGroup
									.filter(a => a.counter_group_uuid)
									.map(a => (
										<option value={a.counter_group_uuid}>{a.counter_group_title}</option>
									))}
							</select>
						</div>
						<div className="inputGroup">
							<label htmlFor="Warehouse">Item Group</label>
							<select onChange={e => setItemGroupFilter(prev => e.target.value)} value={itemGroupFilter}>
								<option value="">All</option>
								{itemGroup
									.filter(a => a.item_group_uuid)
									.map(a => (
										<option value={a.item_group_uuid}>{a.item_group_title}</option>
									))}
							</select>
						</div>
						<div className="inputGroup" style={{ width: "20%" }}>
							<label htmlFor="Warehouse">Counter</label>
							<Select
								options={[
									{
										value: "",
										label: "All"
									},
									...counter.map(a => ({
										value: a.counter_uuid,
										label: a.counter_title
									}))
								]}
								onChange={doc =>
									setSearchData(prev => ({
										...prev,
										counter_uuid: doc.value
									}))
								}
								value={
									searchData?.counter_uuid
										? {
												value: searchData?.counter_uuid,
												label: counter?.find(j => j.counter_uuid === searchData.counter_uuid)?.counter_title
										  }
										: {
												value: "",
												label: "All"
										  }
								}
								openMenuOnFocus={true}
								menuPosition="fixed"
								menuPlacement="auto"
								placeholder="Select"
							/>
						</div>
						<button className="theme-btn" onClick={() => getActivityData()}>
							Search
						</button>
					</div>
				</div>
				<div className="table-container-user item-sales-container">
					<Table
						itemsDetails={items.filter(a => !itemGroupFilter || a?.item_group_uuid?.filter(b => b === itemGroupFilter)?.length)}
					/>
				</div>
			</div>
		</>
	)
}

export default ItemDetails
function Table({ itemsDetails }) {
	const [items, setItems] = useState("sort_order")
	const [order, setOrder] = useState("")
	return (
		<table
			className="user-table"
			style={{
				maxWidth: "100vw",
				height: "fit-content",
				overflowX: "scroll",
				fontSize: "12px"
			}}
		>
			<thead>
				<tr>
					<th>S.N</th>
					<th colSpan={3}>
						<div className="t-head-element">
							<span>
								Item
								<br /> Name
							</span>
							<div className="sort-buttons-container">
								<button
									onClick={() => {
										setItems("item_title")
										setOrder("asc")
									}}
								>
									<ChevronUpIcon className="sort-up sort-button" />
								</button>
								<button
									onClick={() => {
										setItems("item_title")
										setOrder("desc")
									}}
								>
									<ChevronDownIcon className="sort-down sort-button" />
								</button>
							</div>
						</div>
					</th>
					<th colSpan={2}>
						<div className="t-head-element">
							<span>MRP</span>
							<div className="sort-buttons-container">
								<button
									onClick={() => {
										setItems("mrp")
										setOrder("asc")
									}}
								>
									<ChevronUpIcon className="sort-up sort-button" />
								</button>
								<button
									onClick={() => {
										setItems("mrp")
										setOrder("desc")
									}}
								>
									<ChevronDownIcon className="sort-down sort-button" />
								</button>
							</div>
						</div>
					</th>
					<th colSpan={2}>
						<div className="t-head-element">
							<span>Sales</span>
							<div className="sort-buttons-container">
								<button
									onClick={() => {
										setItems("sales")
										setOrder("asc")
									}}
								>
									<ChevronUpIcon className="sort-up sort-button" />
								</button>
								<button
									onClick={() => {
										setItems("sales")
										setOrder("desc")
									}}
								>
									<ChevronDownIcon className="sort-down sort-button" />
								</button>
							</div>
						</div>
					</th>
					<th colSpan={2}>
						<div className="t-head-element">
							<span>Amt</span>
							<div className="sort-buttons-container">
								<button
									onClick={() => {
										setItems("sales_amt")
										setOrder("asc")
									}}
								>
									<ChevronUpIcon className="sort-up sort-button" />
								</button>
								<button
									onClick={() => {
										setItems("sales_amt")
										setOrder("desc")
									}}
								>
									<ChevronDownIcon className="sort-down sort-button" />
								</button>
							</div>
						</div>
					</th>
					<th colSpan={2}>
						<div className="t-head-element">
							<span>
								Delivery <br />
								Return
							</span>
							<div className="sort-buttons-container">
								<button
									onClick={() => {
										setItems("deliver_return")
										setOrder("asc")
									}}
								>
									<ChevronUpIcon className="sort-up sort-button" />
								</button>
								<button
									onClick={() => {
										setItems("deliver_return")
										setOrder("desc")
									}}
								>
									<ChevronDownIcon className="sort-down sort-button" />
								</button>
							</div>
						</div>
					</th>
					<th colSpan={2}>
						<div className="t-head-element">
							<span> %</span>
							<div className="sort-buttons-container">
								<button
									onClick={() => {
										setItems("deliver_return_percentage")
										setOrder("asc")
									}}
								>
									<ChevronUpIcon className="sort-up sort-button" />
								</button>
								<button
									onClick={() => {
										setItems("deliver_return_percentage")
										setOrder("desc")
									}}
								>
									<ChevronDownIcon className="sort-down sort-button" />
								</button>
							</div>
						</div>
					</th>
					<th colSpan={2}>
						<div className="t-head-element">
							<span>Amt</span>
							<div className="sort-buttons-container">
								<button
									onClick={() => {
										setItems("deliver_return_amt")
										setOrder("asc")
									}}
								>
									<ChevronUpIcon className="sort-up sort-button" />
								</button>
								<button
									onClick={() => {
										setItems("deliver_return_amt")
										setOrder("desc")
									}}
								>
									<ChevronDownIcon className="sort-down sort-button" />
								</button>
							</div>
						</div>
					</th>
					<th colSpan={2}>
						<div className="t-head-element">
							<span>
								Processing
								<br /> Canceled
							</span>
							<div className="sort-buttons-container">
								<button
									onClick={() => {
										setItems("processing_canceled")
										setOrder("asc")
									}}
								>
									<ChevronUpIcon className="sort-up sort-button" />
								</button>
								<button
									onClick={() => {
										setItems("processing_canceled")
										setOrder("desc")
									}}
								>
									<ChevronDownIcon className="sort-down sort-button" />
								</button>
							</div>
						</div>
					</th>
					<th colSpan={2}>
						<div className="t-head-element">
							<span>%</span>
							<div className="sort-buttons-container">
								<button
									onClick={() => {
										setItems("auto_added")
										setOrder("asc")
									}}
								>
									<ChevronUpIcon className="sort-up sort-button" />
								</button>
								<button
									onClick={() => {
										setItems("auto_added")
										setOrder("desc")
									}}
								>
									<ChevronDownIcon className="sort-down sort-button" />
								</button>
							</div>
						</div>
					</th>
					<th colSpan={2}>
						<div className="t-head-element">
							<span>Amt</span>
							<div className="sort-buttons-container">
								<button
									onClick={() => {
										setItems("processing_canceled_amt")
										setOrder("asc")
									}}
								>
									<ChevronUpIcon className="sort-up sort-button" />
								</button>
								<button
									onClick={() => {
										setItems("processing_canceled_amt")
										setOrder("desc")
									}}
								>
									<ChevronDownIcon className="sort-down sort-button" />
								</button>
							</div>
						</div>
					</th>
					<th colSpan={2}>
						<div className="t-head-element">
							<span>
								Auto
								<br /> Add
							</span>
							<div className="sort-buttons-container">
								<button
									onClick={() => {
										setItems("auto_added")
										setOrder("asc")
									}}
								>
									<ChevronUpIcon className="sort-up sort-button" />
								</button>
								<button
									onClick={() => {
										setItems("auto_added")
										setOrder("desc")
									}}
								>
									<ChevronDownIcon className="sort-down sort-button" />
								</button>
							</div>
						</div>
					</th>
					<th colSpan={2}>
						<div className="t-head-element">
							<span>%</span>
							<div className="sort-buttons-container">
								<button
									onClick={() => {
										setItems("processing_canceled_percentage")
										setOrder("asc")
									}}
								>
									<ChevronUpIcon className="sort-up sort-button" />
								</button>
								<button
									onClick={() => {
										setItems("processing_canceled_percentage")
										setOrder("desc")
									}}
								>
									<ChevronDownIcon className="sort-down sort-button" />
								</button>
							</div>
						</div>
					</th>
					<th colSpan={2}>
						<div className="t-head-element">
							<span>Amt</span>
							<div className="sort-buttons-container">
								<button
									onClick={() => {
										setItems("auto_added_amt")
										setOrder("asc")
									}}
								>
									<ChevronUpIcon className="sort-up sort-button" />
								</button>
								<button
									onClick={() => {
										setItems("auto_added_amt")
										setOrder("desc")
									}}
								>
									<ChevronDownIcon className="sort-down sort-button" />
								</button>
							</div>
						</div>
					</th>
				</tr>
			</thead>
			<tbody className="tbody">
				{itemsDetails
					.sort((a, b) =>
						order === "asc"
							? typeof a[items] === "string"
								? a[items].localeCompare(b[items])
								: a[items] - b[items]
							: typeof a[items] === "string"
							? b[items].localeCompare(a[items])
							: b[items] - a[items]
					)
					?.map((item, i, array) => (
						<tr key={item.item_uuid} style={{ height: "30px" }}>
							<td>{i + 1}</td>
							<td colSpan={3}>{item.item_title}</td>
							<td colSpan={2}>{item.mrp}</td>
							<td colSpan={2}>{item.sales || ""}</td>
							<td colSpan={2}>{item.sales_amt || ""}</td>
							<td colSpan={2}>{item.deliver_return || ""}</td>
							<td colSpan={2}>{item.deliver_return_percentage || 0}</td>
							<td colSpan={2}>{item.deliver_return_amt || 0}</td>
							<td colSpan={2}>{item.processing_canceled || ""}</td>
							<td colSpan={2}>{item.processing_canceled_percentage || 0}</td>
							<td colSpan={2}>{item.processing_canceled_amt || 0}</td>
							<td colSpan={2}>{item.auto_added || ""}</td>
							<td colSpan={2}>{item.auto_added_percentage || 0}</td>
							<td colSpan={2}>{item.auto_added_amt || 0}</td>
						</tr>
					))}
			</tbody>
		</table>
	)
}
