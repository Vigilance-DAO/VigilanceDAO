import React, { useState } from "react";
import { CaretRightOutlined } from "@ant-design/icons";
import {
	Typography,
	Divider,
	Space,
	Card,
	Alert,
	Collapse,
	Button,
	List,
	Tabs,
} from "antd";
import { DomainHistory } from "../components/DomainHistory";
import NetworkSelector from "../components/Network";
import ReviewForm from "../components/ReviewForm";
import AlertMessageType from "../interfaces/AlertMessageType";
import History from "../components/History";
import { FOR_DEVELOPMENT } from "../services/web3.hook";
import DomainCard, { DomainCardInfo } from "../components/DomainCard";

import "../App.css";
import "antd/dist/antd.min.css";

const { Panel } = Collapse;

const links = [
	{
		heading: "How does it work?",
		link: "https://docs.vigilancedao.org/v1",
	},
	{
		heading: "How to report websites?",
		link: "https://docs.vigilancedao.org/v1/tutorial/how-to-report-and-protect-others",
	},
];

export const config = {
	jsFile: "../index.js",
};

function HomeTab(props: { domainCardInfo: DomainCardInfo }) {
	console.log("home tab", props);
	const [hasVoted, setVoted] = useState(false);

	return (
		<div className="tab--home">
			<DomainCard
				domainInfo={props.domainCardInfo}
				onVoted={(_v: "safe" | "unsafe") => {
					setVoted(true);
				}}
			/>
			{hasVoted ? (
				<>
					<p
						style={{
							color: "green",
							fontWeight: 500,
							lineHeight: "1.4em",
							maxWidth: "44ch",
							textAlign: "center",
							margin: "10px auto",
						}}
					>
						Thanks for sharing your feedback. You can now report on chain and
						earn 10+% yield for keeping our community safe.
					</p>
					<ol className="steps">
						<li>
							<div>
								<strong>Connect Wallet</strong>
								<br />
								<span>Base Network</span>
								<button>Connect</button>
							</div>
						</li>
						<li>
							<div>
								<strong>Buy votes</strong>
								<br />
								<span>One time</span>
								<button>Buy</button>
							</div>
						</li>
						<li>
							<div>
								<strong>Mark Projects</strong>
								<br />
								<span>Earn rewards</span>
								<button>Mark safe/unsafe</button>
							</div>
						</li>
					</ol>
				</>
			) : (
				<DomainHistory />
			)}
		</div>
	);
}
function LearnAndEarnTab() {
	return <div>Learn And Earn</div>;
}
function AccountTab() {
	return <div>Account</div>;
}

export default function Index(props?: {
	domainInfo?: {
		domain: string;
		registeredOn: number;
		status: AlertMessageType;
		loading: boolean;
	};
	account?: {
		loading: boolean;
		account: string;
	};
	connectWallet?: () => void;
}) {
	if (props == undefined) {
		props = {};
	}
	if (props.domainInfo == undefined) {
		props.domainInfo = FOR_DEVELOPMENT.domainInfo;
	}
	if (props.account == undefined) {
		props.account = FOR_DEVELOPMENT.account;
	}
	if (props.connectWallet == undefined) {
		props.connectWallet = () => {
			console.log("connect wallet mock");
		};
	}

	return (
		<div className="App">
			<div className="backdrop"></div>
			<header className="App-header">
				<Typography.Title
					className="title"
					level={1}
					style={{ color: "white", marginTop: "15px", marginBottom: "5px" }}
				>
					Web3 Security
				</Typography.Title>
				<Typography.Paragraph
					style={{ color: "white", fontSize: "12px", textAlign: "center" }}
				>
					Powered by Vigilance DAO
				</Typography.Paragraph>
				<Divider
					style={{
						margin: "0",
						borderTop: "1px solid rgb(255 255 255 / 20%)",
					}}
				/>
			</header>

			<Tabs
				centered
				items={[
					{
						key: "home",
						label: "Home",
						children: (
							<HomeTab
								domainCardInfo={{
									domain: props.domainInfo.domain,
									unsafeRating: 78,
									registeredOn: props.domainInfo.registeredOn,
								}}
							/>
						),
					},
					{
						key: "learn-earn",
						label: "Learn & Earn",
						children: <LearnAndEarnTab />,
					},
					{
						key: "account",
						label: "Account",
						children: <AccountTab />,
					},
				]}
				defaultActiveKey="home"
			/>

			{/* <Space
				direction="vertical"
				size="middle"
				style={{ display: "flex", width: "100%" }}
			>
				<Card style={{ width: "100%", textAlign: "left" }}>
					<table style={{ width: "100%" }}>
						<tbody>
							<tr>
								<td style={{ textAlign: "right", paddingBottom: "10px" }}>
									<NetworkSelector />
								</td>
							</tr>
							<tr>
								<td>
									<p>
										<b>Domain:</b> {props.domainInfo.domain}
									</p>
								</td>
							</tr>
						</tbody>
					</table>
					<p>
						<b>Registered on: </b>
						{props.domainInfo.registeredOn
							? new Date(props.domainInfo.registeredOn).toLocaleDateString()
							: "NA"}
					</p>
					<Alert
						message={<b>{props.domainInfo.status.message}</b>}
						type={props.domainInfo.status.type}
						description={props.domainInfo.status.description}
						showIcon
					/>
				</Card>

				<Collapse
					bordered={true}
					defaultActiveKey={["0"]}
					expandIcon={({ isActive }) => (
						<CaretRightOutlined rotate={isActive ? 90 : 0} />
					)}
					className="site-collapse-custom-collapse"
					style={{ width: "100%" }}
				>
					<Panel
						header={
							<div>
								<b style={{ fontSize: "15px" }}>Domain reports history</b>
							</div>
						}
						key="1"
						className="site-collapse-custom-panel"
					>
						<DomainHistory />
					</Panel>
				</Collapse>

				<Collapse
					bordered={true}
					defaultActiveKey={["0"]}
					expandIcon={({ isActive }) => (
						<CaretRightOutlined rotate={isActive ? 90 : 0} />
					)}
					className="site-collapse-custom-collapse"
					style={{ width: "100%" }}
				>
					<Panel
						header={
							<div>
								<b style={{ fontSize: "15px" }}>Review website</b>
								<p>Earn rewards 💰 by keeping the web safe</p>
							</div>
						}
						key="1"
						className="site-collapse-custom-panel"
					>
						<ReviewForm></ReviewForm>
					</Panel>
				</Collapse> */}
			{/* <Collapse
              bordered={true}
              defaultActiveKey={['0']}
              expandIcon={({ isActive }) => <CaretRightOutlined rotate={isActive ? 90 : 0} />}
              className="site-collapse-custom-collapse"
              style={{ width: '100%' }}
            >
              <Panel header={<div>
                <b style={{fontSize: '15px'}}>Your rewards 🏆</b>
              </div>} key="1" className="site-collapse-custom-panel">
                <Statistic title="Active Users" value={112893} style={{color: 'white'}} />
              </Panel>
            </Collapse> */}
			{/* <Collapse
					bordered={true}
					defaultActiveKey={["0"]}
					expandIcon={({ isActive }) => (
						<CaretRightOutlined rotate={isActive ? 90 : 0} />
					)}
					className="site-collapse-custom-collapse"
					style={{ width: "100%" }}
				>
					<Panel
						header={
							<div>
								<b style={{ fontSize: "15px" }}>My History</b>
							</div>
						}
						key="1"
						className="site-collapse-custom-panel"
					>
						{!props.account.account ? (
							// @ts-ignore
							<Button onClick={() => props.connectWallet()}>
								Connect Wallet
							</Button>
						) : (
							<History></History>
						)}
					</Panel>
				</Collapse>
				<Collapse
					bordered={true}
					defaultActiveKey={["0"]}
					expandIcon={({ isActive }) => (
						<CaretRightOutlined rotate={isActive ? 90 : 0} />
					)}
					className="site-collapse-custom-collapse"
					style={{ width: "100%" }}
				>
					<Panel
						header={
							<div>
								<b style={{ fontSize: "15px" }}>How does it work? 🤔</b>
							</div>
						}
						key="1"
						className="site-collapse-custom-panel"
					>
						<List
							bordered
							dataSource={links}
							renderItem={(item) => (
								<List.Item>
									<a href={item.link} target={"_blank"}>
										<img
											src="./assets/new_tab_link.png"
											style={{
												width: "15px",
												"marginRight": "10px",
												marginTop: "-3px",
											}}
										/>{" "}
										{item.heading}
									</a>
								</List.Item>
							)}
						/>
					</Panel>
				</Collapse> */}
			{/* <Collapse
						bordered={true}
						defaultActiveKey={["0"]}
						expandIcon={({ isActive }) => (
							<CaretRightOutlined rotate={isActive ? 90 : 0} />
						)}
						className="site-collapse-custom-collapse"
						style={{ width: "100%" }}
					>
						<Panel
							header={
								<div>
									<b style={{ fontSize: "15px" }}>Contact us</b>
								</div>
							}
							key="1"
							className="site-collapse-custom-panel"
						>
							<a
								href="https://discord.gg/wTvGsNBHek"
								target={"_blank"}
								style={{ marginRight: "10px" }}
							>
								<img src={"./assets/discord.png"} width="25px" />
							</a>
							<a
								href="https://vigilancedao.org"
								target={"_blank"}
								style={{ marginRight: "10px" }}
							>
								<img src={"./assets/website.png"} width="25px" />
							</a>
							<a
								href="mailto:hello@vigilancedao.org"
								target={"_blank"}
								style={{ marginRight: "10px" }}
							>
								<img src={"./assets/email.png"} width="25px" />
							</a>
						</Panel>
					</Collapse> */}
			{/* </Space> */}
		</div>
	);
}
