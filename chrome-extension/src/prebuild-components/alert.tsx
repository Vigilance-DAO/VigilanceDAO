import React from "react";

const componentStyles: Record<string, React.CSSProperties> = {
	internetVigilanceBackdrop: {
		backgroundColor: "rgb(0 0 0 / 45%)",
		width: "100%",
		minHeight: "100vh",
		position: "absolute",
		top: 0,
		left: 0,
		fontFamily: "sans-serif",
		lineHeight: "20px",
		zIndex: 1000000000000000,
	},
	heading: { margin: "10px 0", fontSize: 20 },
	innerDiv: {
		width: 350,
		border: "10px solid #0b182c",
		padding: 10,
		borderRadius: 10,
		backgroundColor: "#f3f6fb",
		fontWeight: "bold",
		position: "fixed",
		top: 10,
		right: 10,
		color: "black",
		fontSize: 16,
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
		<html>
			<head>
				<script
					src="https://cdnjs.cloudflare.com/ajax/libs/psl/1.9.0/psl.min.js"
					integrity="sha512-YFdOE8bP/RIePsH38M35+7w1rSePTkneMePyR2FWrdecVbBeHw6bQp8WVxuDJiKjig9PTWDjFMGM4w0Z87tpFQ=="
					crossOrigin="anonymous"
					referrerPolicy="no-referrer"
				></script>
			</head>

			<body>
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
						<h1 style={componentStyles.heading}>Internet Vigilance</h1>
						<hr />
						<p>
							Domain: <span id="domainName">Loading...</span>
						</p>
						<p>
							Registered on: <span id="domainRegDate">Loading...</span>
						</p>
						<p>
							Warning: This is a newly registered domain. While most newly built
							websites are safe, a few may be created for fraudulent purposes.
						</p>
						<p>
							Please do necessary research before perfoming any financial
							transactions or entering your passwords.
						</p>
						<button
							id="closeInternetVigilance"
							style={componentStyles.closeInternetVigilance}
						>
							Close
						</button>
						<button
							id="closeInternetVigilanceWithNoMoreShow"
							style={componentStyles.closeInternetVigilanceWithNoMoreShow}
						>
							Do not show for this website again.
						</button>
					</div>
				</div>
			</body>
		</html>
	);
}
