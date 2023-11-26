import React from "react"
import Loader from "./Loader"

const Prompt = ({ message, heading, actions, classes, loading }) => {
	return (
		<div className="overlay-wrapper">
			<div className={"prompt " + (classes?.wrapper || "")}>
				{heading && <h2>{heading}</h2>}
				<p>{message}</p>
				<div className="prompt-actions">
					{actions?.map(i => (
						<button className={i.classname} onClick={i.action}>
							{i.label}
						</button>
					))}
				</div>
				{loading && (
					<div id="spinner-wrapper" className={classes?.wrapper}>
						<span className="loader white small" />
					</div>
				)}
			</div>
		</div>
	)
}

export default Prompt
