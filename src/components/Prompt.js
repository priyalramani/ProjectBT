import React from "react"

const Prompt = ({ message, actions }) => {
	return (
		<div className="overlay-wrapper">
			<div className="prompt">
				<p>{message}</p>
				<div className="prompt-actions">
					{actions?.map(i => (
						<button className={i.classname} onClick={i.action}>
							{i.label}
						</button>
					))}
				</div>
			</div>
		</div>
	)
}

export default Prompt
