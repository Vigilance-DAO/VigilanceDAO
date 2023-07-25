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
				<span>Analysing risk...</span>
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
						<h4>
							Popularity
							<abbr title="Transaction count of the contract">
								<span>
									<svg
										xmlns="http://www.w3.org/2000/svg"
										className="tip icon icon-tabler icon-tabler-info-circle"
										width="12"
										height="12"
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
							</abbr>
							
						</h4>
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
						<h4>Risk</h4>
						<span>
							<span className="value" data-priority>
								———{/* {"HIGH"} */}
							</span>
							<span className="feedback-icon">
								<svg
									xmlns="http://www.w3.org/2000/svg"
									className="icon icon-tabler icon-tabler-info-circle"
									width="12"
									height="12"
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

				<details className="feedback-container">
					<summary tabIndex={-1}>Risks</summary>
					<ul className="feedback-list"></ul>
				</details>

				<div className="bottom-container">
					<div className="credits">Powered by <a className="hero-link" href="https://vigilancedao.org">VigilanceDAO <span>Beta</span></a></div>

					<button id="proceed-btn" className="active-btn" autoFocus={true}>Proceed</button>
					<button id="report-btn">Report</button>
					<button id="close-btn">
						Cancel
					</button>
				</div>

				<form id="report-form" className="hidden">
					<h2>Report</h2>
					<div className="select-div">
						<label>Fraud type:</label>
						<select name="fraud-type" defaultValue="phishing">
							<option value="phishing">Phishing</option>
							<option value="financial-loss">Financial Loss</option>
						</select>
					</div>

					<div data-show-if="phishing" className="hidden">
						<label>
							Which legitimate project is being imitated by this contract? and
							How does it trick people?
						</label>
						<textarea
							name="phishing-info"
							rows={4}
							placeholder="Example: This address is trying to imitate uniswap.org. The owner of this address prompts users to connect wallet and then automatically triggers Approve transactions to drain users wallet."
						/>
					</div>
					<div data-show-if="financial-loss" className="hidden">
						<label htmlFor="">
							How does this contract lead to a financial loss?
						</label>
						<textarea
							name="financial-loss-info"
							rows={4}
							placeholder="The address tries to look like a legitimate NFT site and claims to drop free NFTs to users. Upon interaction with the site, the website automatically trigger Approve token transactions to drain connected wallet."
						/>
					</div>

					<div className="bottom-container">
						<div className="form-response-message"></div>
						<button className="submit active-btn">Submit</button>
					</div>
				</form>
			</div>
		</div>
	);
}
