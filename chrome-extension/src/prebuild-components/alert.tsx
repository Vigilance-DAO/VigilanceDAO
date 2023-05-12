import React, { Fragment } from "react";
import "./alert.css";

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
			<div className="container" id="internetVigilanceBackdrop">
				<div className="inner-div">
					<div className="header">
						<h1 className="heading">Likely Dangerous website</h1>
						<p className="description">
							We have reports that this could be a fraudulent website
						</p>
						<span className="credits">Powered by Vigilance DAO</span>
						<img className="status-image" src="./../images/dangerous.png" />
					</div>

					<div className="domain-info-container">
						<span className="domain-info-item">
							Category:{" "}
							<span className="domain-info-value" id="category">
								Loading...
							</span>
						</span>
						<span className="domain-info-item">
							Domain registered on:{" "}
							<span className="domain-info-value" id="domain-reg-date">
								Loading...
							</span>
						</span>
					</div>

					<div className="button-container">
						<button id="close-website" className="special">
							Close website
						</button>
						<button id="hide" className="normal">
							Hide
						</button>
						<button id="dont-show-again" className="normal">
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
