import React, { Fragment } from "react";

const componentStyles: Record<string, React.CSSProperties> = {
	internetVigilanceBackdrop: {
		width: "100%",
		minHeight: "100vh",
		position: "absolute",
		top: 0,
		left: 0,
		fontFamily: "sans-serif",
		lineHeight: "20px",
		zIndex: 1000000000000000,
	},
	header: {
		display: "grid",
		gridTemplateColumns: "auto 70px",
		gridTemplateRows: "repeat(3, auto)",
		gridTemplateAreas: `
			'status-message status-image'
			'status-description status-image'
			'credit .'
		`,
	},
	heading: { margin: "10px 0", fontSize: 20, gridArea: "status-message" },
	statusDescription: {
		gridArea: "status-description",
		marginTop: 0,
		marginBottom: "8px",
	},
	credits: { gridArea: "credit", opacity: "0.5", fontSize: "0.8rem" },
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
	},
	buttonSpecial: {
		marginRight: "auto",
		border: "#D9D9D9",
		background: "none",
		color: "#0F0F0F",
		backgroundColor: "#D9D9D9",
		borderRadius: "3px",
		padding: "5px 10px",
		fontWeight: "600",
	},
	innerDiv: {
		width: 350,
		padding: "10px 14px",
		borderRadius: 10,
		fontWeight: "bold",
		position: "fixed",
		top: 10,
		right: 10,
		color: "hsla(0, 0%, 82%, 1)",
		fontSize: 16,
		backgroundColor: "hsla(0, 0%, 20%, 1)",
	},
	closeInternetVigilance: {
		background: "#5e542d",
		border: "none",
		padding: "5px 20px",
		marginBottom: 10,
		color: "white",
		fontSize: 13,
	},
	closeInternetVigilanceWithNoMoreShow: {
		background: "#5e542d",
		border: "none",
		padding: "5px 20px",
		marginBottom: 10,
		color: "white",
		fontSize: 13,
	},
} as const;

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
			<script
				dangerouslySetInnerHTML={{
					__html: `function getStorageKey(url) {
            return "vigil__".concat(url);
        }

        let hostname = window.location.hostname
        var parsed = psl.parse(_url.hostname);
        let url = parsed.domain
        if (!url) {
            console.log('no url to show in alert iframe')
        }
        const key = getStorageKey(url)
        chrome.storage.sync.get([key], async (items) => {
            document.getElementById('domainName').innerHTML = domain
        })`,
				}}
			></script>
			<div
				style={componentStyles.internetVigilanceBackdrop}
				id="internetVigilanceBackdrop"
			>
				<div style={componentStyles.innerDiv}>
					<div style={componentStyles.header}>
						<h1 style={componentStyles.heading}>Likely Dangerous website</h1>
						<p style={componentStyles.statusDescription}>
							We have reports that this could be a fraudulent website
						</p>
						<span style={componentStyles.credits}>
							Powered by Vigilance DAO
						</span>
						<img
							style={componentStyles.statusImage}
							src="./../images/dangerous.png"
							id="status"
						/>
					</div>

					<div style={componentStyles.domainInfoContainer}>
						<span>
							Category: <span id="domainName">Loading...</span>
						</span>
						<span>
							Registered on: <span id="domainRegDate">Loading...</span>
						</span>
					</div>

					<div style={componentStyles.buttonContainer}>
						<button style={componentStyles.buttonSpecial}>Close</button>
						<button style={componentStyles.buttonNormal}>Hide</button>
						<button style={componentStyles.buttonNormal}>
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
