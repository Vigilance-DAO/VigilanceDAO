import "./financial-alert.css";

export const config = {
	skipTemplate: true,
};

export default function FinancialAlert() {
	return (
		<div className="container" data-is-loading="true">
			<div className="loading-screen">
				<svg
					xmlns="http://www.w3.org/2000/svg"
					className="icon icon-tabler icon-tabler-loader"
					width="24"
					height="24"
					viewBox="0 0 24 24"
					strokeWidth="2"
					stroke="currentColor"
					fill="none"
					strokeLinecap="round"
					strokeLinejoin="round"
				>
					<path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
					<path d="M12 6l0 -3"></path>
					<path d="M16.25 7.75l2.15 -2.15"></path>
					<path d="M18 12l3 0"></path>
					<path d="M16.25 16.25l2.15 2.15"></path>
					<path d="M12 18l0 3"></path>
					<path d="M7.75 16.25l-2.15 2.15"></path>
					<path d="M6 12l-3 0"></path>
					<path d="M7.75 7.75l-2.15 -2.15"></path>
				</svg>
				<span>Gathering data about receiver...</span>
			</div>
			<div className="data-screen">
				<div className="basic-info">
					<h2>You are about to interact with</h2>
					<span className="icon-container">
						<svg
							xmlns="http://www.w3.org/2000/svg"
							className="icon icon-tabler icon-tabler-shield-search"
							width="24"
							height="24"
							viewBox="0 0 24 24"
							strokeWidth="2"
							stroke="currentColor"
							fill="none"
							strokeLinecap="round"
							strokeLinejoin="round"
						>
							<path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
							<path d="M12 21a12 12 0 0 1 -8.5 -15a12 12 0 0 0 8.5 -3a12 12 0 0 0 8.5 3c.539 1.832 .627 3.747 .283 5.588"></path>
							<path d="M18 18m-3 0a3 3 0 1 0 6 0a3 3 0 1 0 -6 0"></path>
							<path d="M20.2 20.2l1.8 1.8"></path>
						</svg>
					</span>
					<p>
						<span>
							<b>Contract:</b>{" "}
							<span className="contract-info">
								Loading...
								{/* {"Uniswap V3 Router 0x00...34244 [>]"} */}
							</span>
						</span>
						<span className="contract-created-on-container">
							<b>Created on:</b>{" "}
							<span className="contract-created-on">
								Loading...
								{/* {"19 Now 2022"} */}
							</span>
						</span>
					</p>
				</div>

				<div className="financial-info">
					<div className="item transaction-info">
						<h4>Transactions</h4>
						<div className="transaction-info-item">
							<span className="transactions-in-day">0{/* {"101"} */}</span>
							<span>24 hours</span>
						</div>
						<svg
							xmlns="http://www.w3.org/2000/svg"
							className="seperator"
							width="2px"
							height="50px"
							viewBox="0 0 1 66"
							fill="none"
						>
							<line x1="0.5" x2="0.5" y2="66" stroke="#BFA7E4" />
						</svg>
						<div className="transaction-info-item">
							<span className="transactions-in-month">0{/* 15k */}</span>
							<span>30 days</span>
						</div>
					</div>
					<div className="item drained-info">
						<h4>Drained accounts</h4>
						<span>
							<span className="value" data-priority>
								———{/* {"HIGH"} */}
							</span>
							<span className="feedback-icon" data-tooltip-text>
								<svg
									xmlns="http://www.w3.org/2000/svg"
									className="icon icon-tabler icon-tabler-info-circle"
									width="24"
									height="24"
									viewBox="0 0 24 24"
									strokeWidth="2"
									stroke="currentColor"
									fill="none"
									strokeLinecap="round"
									strokeLinejoin="round"
								>
									<path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
									<path d="M3 12a9 9 0 1 0 18 0a9 9 0 0 0 -18 0"></path>
									<path d="M12 9h.01"></path>
									<path d="M11 12h1v4h1"></path>
								</svg>
							</span>
						</span>
					</div>
				</div>

				<div className="bottom-container">
					<div className="credits">Powered by VigialnceDAO</div>

					<button id="proceed-btn">Proceed</button>
					<button id="close-btn">Close</button>
				</div>
			</div>
		</div>
	);
}
