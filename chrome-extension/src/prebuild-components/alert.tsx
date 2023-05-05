import React, { Fragment } from "react";

const styles: Record<string, React.CSSProperties> = {
	container: {
		width: "100%",
		fontFamily: "X_Roboto, sans-serif",
	},
	header: {
		display: "grid",
		gridTemplateColumns: "auto 76px",
		gridTemplateRows: "repeat(3, auto)",
		gridTemplateAreas: `
		"status-message status-image"
		"status-description status-image"
		"credit ."
	`,
	},
	heading: {
		margin: "10px 0",
		fontSize: "30px",
		gridArea: "status-message",
		lineHeight: "35px",
	},
	statusDescription: {
		gridArea: "status-description",
		marginTop: "0px",
		marginBottom: "8px",
		fontSize: "19px",
		lineHeight: "22.3px",
	},
	credits: {
		gridArea: "credit",
		opacity: "0.5",
		fontSize: "14px",
	},
	statusImage: {
		gridArea: "status-image",
		width: "100%",
	},
	domainInfoContainer: {
		display: "flex",
		gap: "5px",
		flexDirection: "column",
		margin: "10px 0",
	},
	domainInfoItem: {
		fontWeight: "700",
		fontSize: "26px",
	},
	domainInfoValue: {
		fontWeight: "400",
	},
	buttonContainer: {
		display: "flex",
		gap: "6px",
		justifyItems: "flex-end",
		margin: "15px 0 6px",
		fontSize: "16px",
		minHeight: "36px",
	},
	buttonBase: {
		borderRadius: "3px",
		padding: "5px 10px",
		fontWeight: "600",
		cursor: "pointer",
		fontSize: "16px",
		lineHeight: "19px",
	},
	buttonNormal: {
		border: "1px solid white",
		background: "none",
		color: "white",
		opacity: "0.5",
	},
	buttonSpecial: {
		opacity: "1",
		marginRight: "auto",
		border: "#d9d9d9",
		background: "none",
		color: "#0f0f0f",
		backgroundColor: "#d9d9d9",
	},
	innerDiv: {
		width: "560px",
		padding: "18px 24px",
		fontWeight: "bold",
		color: "hsla(-1, 0%, 82%, 1)",
		fontSize: "15px",
		backgroundColor: "hsla(-1, 0%, 20%, 1)",
		borderRadius: "9px",
		borderBottom: "6px solid var(--border-color, red)",
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
			<style id="fonts-to-load"></style>
			<div style={styles.container} id="internetVigilanceBackdrop">
				<div style={styles.innerDiv}>
					<div style={styles.header}>
						<h1 style={styles.heading} className="heading">
							Likely Dangerous website
						</h1>
						<p style={styles.statusDescription} className="description">
							We have reports that this could be a fraudulent website
						</p>
						<span style={styles.credits}>Powered by Vigilance DAO</span>
						<img
							style={styles.statusImage}
							className="status-image"
							src="./../images/dangerous.png"
						/>
					</div>

					<div style={styles.domainInfoContainer}>
						<span style={styles.domainInfoItem}>
							Category:{" "}
							<span style={styles.domainInfoValue} className="category">
								Loading...
							</span>
						</span>
						<span style={styles.domainInfoItem}>
							Domain registered on:{" "}
							<span style={styles.domainInfoValue} className="domain-reg-date">
								Loading...
							</span>
						</span>
					</div>

					<div style={styles.buttonContainer}>
						<button
							className="close-website"
							style={{ ...styles.buttonBase, ...styles.buttonSpecial }}
						>
							Close website
						</button>
						<button
							className="hide"
							style={{ ...styles.buttonBase, ...styles.buttonNormal }}
						>
							HclassNamee
						</button>
						<button
							className="dont-show-again"
							style={{ ...styles.buttonBase, ...styles.buttonNormal }}
						>
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
