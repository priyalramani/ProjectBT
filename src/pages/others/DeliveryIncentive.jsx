import React, { useState, useEffect, useMemo } from "react"
import Header from "../../components/Header"
import Sidebar from "../../components/Sidebar"
import "./style.css"
import { ChevronUpIcon, ChevronDownIcon, MenuAlt2Icon } from "@heroicons/react/solid"
import { v4 as uuid } from "uuid"
import axios from "axios"
import { Delete } from "@mui/icons-material"
import { Switch } from "@mui/material"
import { green } from "@mui/material/colors"
import { alpha, styled } from "@mui/material/styles"
const DEFAULT = {
	base_qty: "",
	add_qty: "",
	unit: "p",
}
const GreenSwitch = styled(Switch)(({ theme }) => ({
	"& .MuiSwitch-switchBase.Mui-checked": {
		color: green[500],
		"&:hover": {
			backgroundColor: alpha(green[500], theme.palette.action.hoverOpacity),
		},
	},
	"& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": {
		backgroundColor: green[500],
	},
}))
const DeliveryIncentive = () => {
	const [popupForm, setPopupForm] = useState(false)
	const [itemsData, setItemsData] = useState([])
	const [deletePopup, setDeletePopup] = useState(false)
	const getItemsData = async () => {
		const response = await axios({
			method: "get",
			url: "/incentive/getDeliveryIncentive",

			headers: {
				"Content-Type": "application/json",
			},
		})
		if (response.data.success) setItemsData(response.data.result)
	}
	useEffect(() => {
		getItemsData()
	}, [popupForm])
	const DeleteAutoAdd = async data => {
		const response = await axios({
			method: "delete",
			url: "/incentive/DeleteIncentive",
			data,
			headers: {
				"Content-Type": "application/json",
			},
		})
		console.log(response)
		if (response.data.success) {
			setDeletePopup(false)
			getItemsData()
		}
	}
	return (
		<>
			<Sidebar />
			<Header />
			<div className="item-sales-container orders-report-container">
				<div id="heading">
					<h2 style={{ width: "100%" }}>Delivery Incentive </h2>
				</div>
				<div id="item-sales-top">
					<div
						id="date-input-container"
						style={{
							overflow: "visible",
							display: "flex",
							alignItems: "center",
							justifyContent: "flex-end",
							width: "100%",
						}}>
						<button className="theme-btn" onClick={() => setPopupForm(true)}>
							Add
						</button>
					</div>
				</div>
				<div className="table-container-user item-sales-container">
					<Table
						itemsDetails={itemsData}
						setPopupForm={setPopupForm}
						setDeletePopup={setDeletePopup}
						getItemsData={getItemsData}
					/>
				</div>
			</div>
			{popupForm ? <NewUserForm onSave={() => setPopupForm(false)} popupForm={popupForm} /> : ""}
			{deletePopup ? (
				<div className="overlay">
					<div className="modal" style={{ height: "fit-content", width: "fit-content" }}>
						<div
							className="content"
							style={{
								height: "fit-content",
								paddingTop: "40px",
								width: "fit-content",
							}}>
							<div style={{ overflowY: "scroll" }}>Sure You Want to Delete</div>

							<div
								style={{
									width: "100%",
									display: "flex",
									alignItems: "center",
									justifyContent: "center",
								}}>
								<button className="fieldEditButton" onClick={() => DeleteAutoAdd(deletePopup)}>
									Confirm
								</button>
							</div>

							<button onClick={() => setDeletePopup(false)} className="closeButton">
								x
							</button>
						</div>
					</div>
				</div>
			) : (
				""
			)}
		</>
	)
}

export default DeliveryIncentive
function Table({ itemsDetails = [], setPopupForm, setDeletePopup, getItemsData }) {
	const [items, setItems] = useState("incentive_title")
	const [order, setOrder] = useState("asc")
	const updateStatus = async data => {
		const response = await axios({
			method: "put",
			url: "/incentive/UpdateIncentive",
			data,
			headers: {
				"Content-Type": "application/json",
			},
		})
		console.log(response)
		if (response.data.success) {
			getItemsData()
		}
	}

	return (
		<table className="user-table" style={{ maxWidth: "100vw", height: "fit-content", overflowX: "scroll" }}>
			<thead>
				<tr>
					<th>S.N</th>
					<th colSpan={2}>
						<div className="t-head-element">
							<span>Incentive Title</span>
							<div className="sort-buttons-container">
								<button
									onClick={() => {
										setItems("incentive_title")
										setOrder("asc")
									}}>
									<ChevronUpIcon className="sort-up sort-button" />
								</button>
								<button
									onClick={() => {
										setItems("incentive_title")
										setOrder("desc")
									}}>
									<ChevronDownIcon className="sort-down sort-button" />
								</button>
							</div>
						</div>
					</th>
					<th colSpan={2}></th>
				</tr>
			</thead>
			<tbody className="tbody">
				{itemsDetails
					.filter(a => a.incentive_uuid)
					.sort((a, b) =>
						order === "asc"
							? typeof a[items] === "string"
								? a[items].localeCompare(b[items])
								: a[items] - b[items]
							: typeof a[items] === "string"
							? b[items].localeCompare(a[items])
							: b[items] - a[items]
					)
					?.map((item, i) => (
						<tr key={item.item_uuid} style={{ height: "30px" }}>
							<td>{i + 1}</td>
							<td
								colSpan={2}
								onClick={e => {
									e.stopPropagation()
									setPopupForm({ type: "edit", data: item })
								}}>
								{item.incentive_title}
							</td>
							<td>
								<Delete
									onClick={e => {
										e.stopPropagation()
										setDeletePopup(item)
									}}
								/>
							</td>
							<td>
								<GreenSwitch
									checked={item?.status}
									onChange={e => {
										e.stopPropagation()
										updateStatus({ ...item, status: item.status ? 0 : 1 })
									}}
								/>
							</td>
						</tr>
					))}
			</tbody>
		</table>
	)
}

function NewUserForm({ onSave, popupForm }) {
	const [objData, setObgData] = useState({
		type: "delivery-incentive",
		incentive_title: "",
		calculation: "amt",
		value: 0,
		users: [],

		counters: [],
		counter_groups: [],
	})
	console.log(popupForm)
	useEffect(() => {
		if (popupForm?.type === "edit") setObgData(popupForm.data)
	}, [])
	const [ui, setUi] = useState(1)

	const [users, setUsers] = useState([])
	const [counterGroup, setCounterGroup] = useState([])
	const [filterCounterGroupTitle, setFilterCounterGroupTitle] = useState("")

	const [filterUserTitle, setFilterUserTitle] = useState("")

	const [routesData, setRoutesData] = useState([])
	const [counter, setCounter] = useState([])
	const [filterCounterTitle, setFilterCounterTitle] = useState("")
	const [filterRoute, setFilterRoute] = useState("")

	const [filterCounterata, setFilterCounterData] = useState([])
	const [filterCounterGroupData, setFilterCounterGroupData] = useState([])
	const [filterUserData, setFilterUserData] = useState([])
	useEffect(() => {
		setFilterUserData(
			users.sort((a, b) => {
				let aLength = objData.users.filter(c => c === a.user_uuid)?.length

				let bLength = objData.users.filter(c => c === b.user_uuid)?.length
				if (aLength && bLength) {
					return a.user_title?.localeCompare(b.user_title)
				} else if (aLength) {
					return -1
				} else if (bLength) {
					return 1
				} else {
					return a.user_title?.localeCompare(b.user_title)
				}
			})
		)

		setFilterCounterGroupData(
			counterGroup.sort((a, b) => {
				let aLength = objData.counter_groups.filter(c => c === a.counter_group_uuid)?.length

				let bLength = objData.counter_groups.filter(c => c === b.counter_group_uuid)?.length
				if (aLength && bLength) {
					return a.counter_group_title?.localeCompare(b.counter_group_title)
				} else if (aLength) {
					return -1
				} else if (bLength) {
					return 1
				} else {
					return a.counter_group_title?.localeCompare(b.counter_group_title)
				}
			})
		)
		setFilterCounterData(
			counter.sort((a, b) => {
				let aLength = objData.counters.filter(c => c === a.counter_uuid)?.length
				let bLength = objData.counters.filter(c => c === b.counter_uuid)?.length
				if (aLength && bLength) {
					return a.counter_title?.localeCompare(b.counter_title)
				} else if (aLength) {
					return -1
				} else if (bLength) {
					return 1
				} else {
					return a.counter_title?.localeCompare(b.counter_title)
				}
			})
		)
	}, [ui, counter, counterGroup, users])

	const getRoutesData = async () => {
		const response = await axios({
			method: "get",
			url: "/routes/GetRouteList",

			headers: {
				"Content-Type": "application/json",
			},
		})
		if (response.data.success) setRoutesData(response.data.result)
	}

	const getCounter = async () => {
		const response = await axios({
			method: "get",
			url: "/counters/GetCounterList",

			headers: {
				"Content-Type": "application/json",
			},
		})
		if (response.data.success)
			setCounter(
				response.data.result.map(b => ({
					...b,
					route_title: routesData.find(a => a.route_uuid === b.route_uuid)?.route_title || "-",
				}))
			)
	}

	useEffect(() => {
		getCounter()
	}, [routesData])
	const getCounterGroup = async () => {
		const response = await axios({
			method: "get",
			url: "/counterGroup/GetCounterGroupList",

			headers: {
				"Content-Type": "application/json",
			},
		})
		if (response.data.success) setCounterGroup(response.data.result)
	}

	const getUsers = async () => {
		const response = await axios({
			method: "get",
			url: "/users/GetUserList",

			headers: {
				"Content-Type": "application/json",
			},
		})
		console.log("users", response)
		if (response.data.success) setUsers(response.data.result)
	}

	useEffect(() => {
		getCounterGroup()

		getRoutesData()
		getUsers()
	}, [])
	const submitHandler = async e => {
		e.preventDefault()

		let data = objData

		if (popupForm?.type === "edit") {
			const response = await axios({
				method: "put",
				url: "/incentive/UpdateIncentive",
				data,
				headers: {
					"Content-Type": "application/json",
				},
			})
			console.log(response)
			if (response.data.success) {
				onSave()
			}
		} else {
			const response = await axios({
				method: "post",
				url: "/incentive/CreateIncentive",
				data,
				headers: {
					"Content-Type": "application/json",
				},
			})
			console.log(response)
			if (response.data.success) {
				onSave()
			}
		}
	}

	return (
		<div className="overlay">
			<div className="modal" style={{ height: "fit-content", width: "fit-content" }}>
				<div
					className="content"
					style={{
						height: "fit-content",
						padding: "20px",
						width: "fit-content",
					}}>
					{+ui === 1 ? (
						<div style={{ overflowY: "scroll" }}>
							<table
								className="user-table"
								style={{
									width: "fit-content",

									overflow: "scroll",
								}}>
								<tbody>
									<tr>
										<td
											colSpan={2}
											style={{
												display: "flex",
												alignItems: "center",
												justifyContent: "flex-start",
											}}>
											<b>Incentive Title : </b>
											<input
												className="searchInput"
												style={{
													border: "none",
													borderBottom: "2px solid black",
													borderRadius: "0px",
												}}
												placeholder="Title"
												value={objData.incentive_title}
												onChange={e =>
													setObgData(prev => ({
														...prev,
														incentive_title: e.target.value,
													}))
												}
											/>
										</td>
									</tr>
									<tr>
										<td
											colSpan={2}
											style={{
												display: "flex",
												alignItems: "center",
												justifyContent: "flex-start",
											}}>
											<b>Calculation : </b>
											<select
												className="searchInput"
												style={{
													border: "none",
													borderBottom: "2px solid black",
													borderRadius: "0px",
												}}
												placeholder="Title"
												value={objData.calculation}
												onChange={e =>
													setObgData(prev => ({
														...prev,
														calculation: e.target.value,
													}))
												}>
												<option value="amt">On Amount</option>
												<option value="qty">Per Box</option>
											</select>
										</td>
									</tr>
									<tr>
										<td
											colSpan={2}
											style={{
												display: "flex",
												alignItems: "center",
												justifyContent: "flex-start",
											}}>
											<b>Value : </b>
											<input
												className="searchInput"
												style={{
													border: "none",
													borderBottom: "2px solid black",
													borderRadius: "0px",
												}}
												placeholder="Title"
												value={objData.value}
												onChange={e =>
													setObgData(prev => ({
														...prev,
														value: e.target.value,
													}))
												}
											/>
										</td>
									</tr>
								</tbody>
							</table>
						</div>
					) : +ui === 2 ? (
						<div
							style={{
								display: "flex",
								alignItems: "center",
								justifyContent: "center",
							}}>
							<div
								style={{
									overflowY: "scroll",
									height: "45vh",
								}}>
								<input
									type="text"
									onChange={e => setFilterCounterGroupTitle(e.target.value)}
									value={filterCounterGroupTitle}
									placeholder="Search Item Group Title..."
									className="searchInput"
								/>

								<table className="table">
									<thead>
										<tr>
											<th className="description" style={{ width: "50%" }}>
												Counter Group
											</th>
											<th style={{ width: "25%" }}>Action</th>
										</tr>
									</thead>
									<tbody>
										{filterCounterGroupData
											?.filter(a => a.counter_group_title)
											.filter(
												a =>
													!filterCounterGroupTitle ||
													a.counter_group_title
														.toLocaleLowerCase()
														.includes(filterCounterGroupTitle.toLocaleLowerCase())
											)

											.map((item, index) => {
												return (
													<tr key={item.item_uuid}>
														<td>{item.counter_group_title}</td>

														<td>
															<button
																type="button"
																className="noBgActionButton"
																style={{
																	backgroundColor: objData.counter_groups.filter(
																		a => a === item.counter_group_uuid
																	)?.length
																		? "red"
																		: "var(--mainColor)",
																	width: "150px",
																	fontSize: "large",
																}}
																onClick={event =>
																	setObgData(prev => ({
																		...objData,
																		counter_groups: prev.counter_groups.filter(
																			a => a === item.counter_group_uuid
																		).length
																			? prev.counter_groups.filter(
																					a => a !== item.counter_group_uuid
																			  )
																			: prev.counter_groups.length
																			? [
																					...prev.counter_groups,
																					item.counter_group_uuid,
																			  ]
																			: [item.counter_group_uuid],
																	}))
																}>
																{objData.counter_groups.filter(
																	a => a === item.counter_group_uuid
																)?.length
																	? "Remove"
																	: "Add"}
															</button>
														</td>
													</tr>
												)
											})}
									</tbody>
								</table>
							</div>
							<div
								style={{
									overflowY: "scroll",
									height: "45vh",
								}}>
								<input
									type="text"
									onChange={e => setFilterCounterTitle(e.target.value)}
									value={filterCounterTitle}
									placeholder="Search Counter Title..."
									className="searchInput"
								/>
								<input
									type="text"
									onChange={e => setFilterRoute(e.target.value)}
									value={filterRoute}
									placeholder="Search Route Title..."
									className="searchInput"
								/>

								<table className="table">
									<thead>
										<tr>
											<th className="description" style={{ width: "25%" }}>
												Counter
											</th>
											<th className="description" style={{ width: "25%" }}>
												Route
											</th>

											<th style={{ width: "25%" }}>Action</th>
										</tr>
									</thead>
									<tbody>
										{filterCounterata
											?.filter(a => a.counter_uuid)
											.filter(
												a =>
													!filterCounterTitle ||
													a.counter_title
														?.toLocaleLowerCase()
														.includes(filterCounterTitle.toLocaleLowerCase())
											)
											.filter(
												a =>
													!filterRoute ||
													a?.route_title
														?.toLocaleLowerCase()
														.includes(filterRoute.toLocaleLowerCase())
											)
											.map((item, index) => {
												return (
													<tr key={item.counter_uuid}>
														<td>{item.counter_title}</td>
														<td>{item.route_title}</td>

														<td>
															<button
																type="button"
																className="noBgActionButton"
																style={{
																	backgroundColor: objData.counters.filter(
																		a => a === item.counter_uuid
																	)?.length
																		? "red"
																		: "var(--mainColor)",
																	width: "150px",
																	fontSize: "large",
																}}
																onClick={event =>
																	setObgData(prev => ({
																		...objData,
																		counters: prev.counters.filter(
																			a => a === item.counter_uuid
																		).length
																			? prev.counters.filter(
																					a => a !== item.counter_uuid
																			  )
																			: prev.counters.length
																			? [...prev.counters, item.counter_uuid]
																			: [item.counter_uuid],
																	}))
																}>
																{objData.counters.filter(a => a === item.counter_uuid)
																	?.length
																	? "Remove"
																	: "Add"}
															</button>
														</td>
													</tr>
												)
											})}
									</tbody>
								</table>
							</div>
						</div>
					) : (
						<div
							style={{
								display: "flex",
								alignItems: "center",
								justifyContent: "center",
							}}>
							<div
								style={{
									overflowY: "scroll",
									height: "45vh",
								}}>
								<input
									type="text"
									onChange={e => setFilterUserTitle(e.target.value)}
									value={filterUserTitle}
									placeholder="Search User Title..."
									className="searchInput"
								/>

								<table className="table">
									<thead>
										<tr>
											<th className="description" style={{ width: "50%" }}>
												User Name
											</th>
											<th style={{ width: "25%" }}>Action</th>
										</tr>
									</thead>
									<tbody>
										{filterUserData
											?.filter(a => a.user_title)
											.filter(
												a =>
													!filterUserTitle ||
													a.user_title
														.toLocaleLowerCase()
														.includes(filterUserTitle.toLocaleLowerCase())
											)

											.map((item, index) => {
												return (
													<tr key={item.user_uuid}>
														<td>{item.user_title}</td>

														<td>
															<button
																type="button"
																className="noBgActionButton"
																style={{
																	backgroundColor: objData.users.filter(
																		a => a === item.user_uuid
																	)?.length
																		? "red"
																		: "var(--mainColor)",
																	width: "150px",
																	fontSize: "large",
																}}
																onClick={event =>
																	setObgData(prev => ({
																		...objData,
																		users: prev.users.filter(
																			a => a === item.user_uuid
																		).length
																			? prev.users.filter(
																					a => a !== item.user_uuid
																			  )
																			: prev.users.length
																			? [...prev.users, item.user_uuid]
																			: [item.user_uuid],
																	}))
																}>
																{objData.users.filter(a => a === item.user_uuid)?.length
																	? "Remove"
																	: "Add"}
															</button>
														</td>
													</tr>
												)
											})}
									</tbody>
								</table>
							</div>
						</div>
					)}
					{+ui === 1 ? (
						<div
							style={{
								width: "100%",
								display: "flex",
								alignItems: "center",
								justifyContent: "center",
							}}>
							<button className="fieldEditButton" onClick={() => setUi(prev => prev + 1)}>
								Next
							</button>
						</div>
					) : +ui === 2 ? (
						<div
							style={{
								width: "100%",
								display: "flex",
								alignItems: "center",
								justifyContent: "center",
							}}>
							<button className="fieldEditButton" onClick={() => setUi(prev => prev - 1)}>
								Back
							</button>
							<button className="fieldEditButton" onClick={() => setUi(prev => prev + 1)}>
								Next
							</button>
						</div>
					) : (
						<div
							style={{
								width: "100%",
								display: "flex",
								alignItems: "center",
								justifyContent: "center",
							}}>
							<button className="fieldEditButton" onClick={() => setUi(prev => prev - 1)}>
								Back
							</button>
							<button className="fieldEditButton" onClick={submitHandler}>
								{popupForm?.type === "edit" ? "Update" : "Save"}
							</button>
						</div>
					)}
					<button onClick={onSave} className="closeButton">
						x
					</button>
				</div>
			</div>
		</div>
	)
}
