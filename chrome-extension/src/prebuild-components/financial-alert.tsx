import "./financial-alert.css";

export const config = {
	skipTemplate: true,
};

export default function FinancialAlert() {
	return (
		<div className="container">
			<div className="basic-info">
				<h2>You are about to interact with</h2>
				<span className="icon-container">
					<svg
						xmlns="http://www.w3.org/2000/svg"
						className="icon icon-tabler icon-tabler-shield-search"
						width="24"
						height="24"
						viewBox="0 0 24 24"
						stroke-width="2"
						stroke="currentColor"
						fill="none"
						stroke-linecap="round"
						stroke-linejoin="round"
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
					<span>
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
					<div className="value">———{/* {"HIGH"} */}</div>
				</div>
			</div>

			<div className="credits">Powered by VigialnceDAO</div>
		</div>
	);
}
