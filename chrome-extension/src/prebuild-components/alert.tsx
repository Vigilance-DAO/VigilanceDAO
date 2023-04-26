import React, { Fragment } from "react";
import "./alert.css";

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
			<div className="container" id="internetVigilanceBackdrop">
				<div className="inner-div">
					<div className="header">
						<h1 className="heading">Likely Dangerous website</h1>
						<p className="status-description">
							We have reports that this could be a fraudulent website
						</p>
						<span className="credits">Powered by Vigilance DAO</span>
						<img
							className="status-image"
							src="./../images/dangerous.png"
							id="status"
						/>
					</div>

					<div className="domain-info-container">
						<span>
							Category: <span id="domainName">Loading...</span>
						</span>
						<span>
							Registered on: <span id="domainRegDate">Loading...</span>
						</span>
					</div>

					<div className="button-container">
						<button className="special">Close</button>
						<button>Hide</button>
						<button>Don't show again</button>
					</div>
				</div>
			</div>
		</Fragment>
		// 	</body>
		// </html>
	);
}
