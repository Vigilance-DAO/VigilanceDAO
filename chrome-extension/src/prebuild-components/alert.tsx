import React, { Fragment } from "react";

const styles = {
	container: {
		width: "100%",
		fontFamily: "Roboto, sans-serif",
	},
	header: {
		display: "grid",
		gridTemplateColumns: "auto 70px",
		gridTemplateRows: "repeat(3, auto)",
		gridTemplateAreas: `
		"status-message status-image"
		"status-description status-image"
		"credit ."
	`,
	},
	heading: {
		margin: "10px 0",
		fontSize: "20px",
		gridArea: "status-message",
	},
	statusDescription: {
		gridArea: "status-description",
		marginTop: "0px",
		marginBottom: "8px",
	},
	credits: {
		gridArea: "credit",
		opacity: "0.5",
		fontSize: "0.8rem",
	},
	statusImage: {
		gridArea: "status-image",
	},
	domainInfoContainer: {
		display: "flex",
		gap: "5px",
		flexDirection: "column",
		margin: "10px 0",
	},
	buttonContainer: {
		display: "flex",
		gap: "6px",
		justifyItems: "flex-end",
		margin: "15px 0 6px",
	},
	buttonNormal: {
		border: "1px solid white",
		background: "none",
		color: "white",
		borderRadius: "3px",
		padding: "5px 10px",
		fontWeight: "600",
		opacity: "0.5",
		cursor: "pointer",
	},
	buttonSpecial: {
		borderRadius: "3px",
		padding: "5px 10px",
		fontWeight: "600",
		cursor: "pointer",
		opacity: "1",
		marginRight: "auto",
		border: "#d9d9d9",
		background: "none",
		color: "#0f0f0f",
		backgroundColor: "#d9d9d9",
	},
	innerDiv: {
		width: "350px",
		padding: "9px 14px",
		fontWeight: "bold",
		color: "hsla(-1, 0%, 82%, 1)",
		fontSize: "15px",
		backgroundColor: "hsla(-1, 0%, 20%, 1)",
		borderRadius: "9px",
	},
} as const;

declare const psl: {
	parse: (...args: any[]) => any;
};
declare const _url: any;
declare const domain: any;

function getStorageKey(url: string) {
	return "vigil__".concat(url);
}

if (typeof window != "undefined") {
	window.onload = () => {
		console.log("hi from alert");
		let hostname = window.location.hostname;
		var parsed = psl.parse(_url.hostname);
		let url = parsed.domain;
		if (!url) {
			console.log("no url to show in alert iframe");
		}
		const key = getStorageKey(url);
		chrome.storage.sync.get([key], async (items) => {
			console.log(domain);
			document.getElementById("domainName")!.innerHTML = domain;
		});
	};
}

export const config = {
	skipTemplate: true,
};

export default function Alert() {
	return (
		// <html>
		// 	<head>
		// 		<script
		// 			src="https://cdnjs.cloudflare.com/ajax/libs/psl/1.9.0/psl.min.js"
		// 			integrity="sha512-YFdOE8bP/RIePsH38M35+7w1rSePTkneMePyR2FWrdecVbBeHw6bQp8WVxuDJiKjig9PTWDjFMGM4w0Z87tpFQ=="
		// 			crossOrigin="anonymous"
		// 			referrerPolicy="no-referrer"
		// 		></script>
		// 	</head>

		// 	<body>
		<Fragment>
			<div style={styles.container} id="internetVigilanceBackdrop">
				<div style={styles.innerDiv}>
					<div style={styles.header}>
						<h1 style={styles.heading}>Likely Dangerous website</h1>
						<p style={styles.statusDescription}>
							We have reports that this could be a fraudulent website
						</p>
						<span style={styles.credits}>Powered by Vigilance DAO</span>
						<img style={styles.statusImage} src="./../images/dangerous.png" />
					</div>

					<div style={styles.domainInfoContainer}>
						<span>
							Category: <span id="domain-name">Loading...</span>
						</span>
						<span>
							Registered on: <span id="domain-reg-date">Loading...</span>
						</span>
					</div>

					<div style={styles.buttonContainer}>
						<button id="close" style={styles.buttonSpecial}>
							Close
						</button>
						<button id="hide" style={styles.buttonNormal}>
							Hide
						</button>
						<button id="dont-show-again" style={styles.buttonNormal}>
							Don't show again
						</button>
					</div>
				</div>
			</div>
		</Fragment>
		// 	</body>
		// </html>
	);
}
