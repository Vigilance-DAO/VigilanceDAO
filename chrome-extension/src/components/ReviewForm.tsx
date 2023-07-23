import {
	Divider,
	Typography,
	Button,
	Tooltip,
	Input,
	Statistic,
	Form,
	Radio,
	Card,
	Alert,
	Collapse,
	Space,
	Select,
} from "antd";
import { UploadFile } from "antd/es/upload";
import React, { useContext, useEffect, useState } from "react";
import Evidence from "./Evidence";
import NetworkSelector from "./Network";
import type { RadioChangeEvent } from "antd";
import { ethers } from "ethers";
import AlertMessageType from "../interfaces/AlertMessageType";
import { Web3Storage } from "web3.storage";
// const createMetaMaskProvider = require('metamask-extension-provider');

import { abi, address } from "../constants/index";
import { Context, hooks, metamaskConnector } from "../App";
import { chainInfo } from "../services/web3.hook";
import InfoIcon from "../icons/info";

const { TextArea } = Input;

declare const window: any;
declare const chrome: any;

type FraudType = "phishing" | "financial-loss";
type FraudTypeSingleOption = {
	value: FraudType;
	label: string;
};
interface FraudInfo {
	type: FraudType | undefined;
	financialLossLinks: string;
	explanation: string;
}

const FraudTypeTooltipText = () => (
	<div>
		<span>
			Phishing: a type of online fraud where attackers impersonate legitimate
			websites or organizations to trick people into performing un-intended
			actions.
		</span>
		<br />
		<span>
			Financial Loss Attack: These websites don't impersonate legitimate
			websites but can lead to financial loss in ways that is different from the
			website's marketing copy.
		</span>
	</div>
);

function InfoIconContainer(props: { disabled?: boolean }) {
	const _disabled = props.disabled || false;

	return (
		<span
			style={{
				cursor: _disabled ? "not-allowed" : "pointer",
				opacity: _disabled ? 0.4 : 1,
			}}
			{...props}
		>
			<InfoIcon />
		</span>
	);
}
export default function ReviewForm() {
	const { web3Hooks } = useContext(Context);
	const {
		connectWallet,
		submitReport,
		getStakeAmount,
		stakeETH,
		account,
		chainId,
		switchNetwork,
		reportTxInfo,
	} = web3Hooks;

	const [fraudInfo, setFraudInfo] = useState<FraudInfo>({
		explanation: "",
		financialLossLinks: "",
		type: undefined,
	});
	const [buttonTxt, setButtonTxt] = useState("Connect Wallet");
	const [buttonDisabled, setButtonDisabled] = useState(false);
	const [fileList, setFileList] = useState<UploadFile[]>([]);

	const [comments, setComments] = useState<string>("");
	const web3storage_key = process.env.REACT_APP_WEB3_STORAGE_KEY;

	const [txMessage, setTxMessage] = useState<AlertMessageType>({
		message: "",
		type: "info",
		description: "",
	});

	const onFraudInfoChange = function <K extends keyof FraudInfo>(
		key: K,
		value: FraudInfo[K]
	) {
		if (key == "type") {
			// reset fraudInfo.explanation value as well
			setFraudInfo({ ...fraudInfo, [key]: value, explanation: "" });
		} else {
			setFraudInfo({ ...fraudInfo, [key]: value });
		}
	};

	const uploadToIPFS = async () => {
		setButtonDisabled(true);
		setButtonTxt("Uploading...");
		const client = new Web3Storage({
			token: web3storage_key === undefined ? "" : web3storage_key,
		});
		let imageUrls: string[] = [];
		for (let i = 0; i < fileList.length; i++) {
			console.log("file", i, fileList[i]);
			const file = fileList[i].originFileObj;
			if (file !== undefined) {
				const cid = await client.put([file]);
				const img_url = "ipfs://" + cid + "/" + file.name;
				if (!imageUrls.includes(img_url)) {
					imageUrls.push(img_url);
				}
			}
		}
		return imageUrls;
	};

	const reportDomain = async () => {
		try {
			setButtonDisabled(true);
			const imageUrls = await uploadToIPFS();
			console.log(imageUrls);
			submitReport(
				true,
				imageUrls,
				[
					fraudInfo.type,
					fraudInfo.explanation,
					fraudInfo.financialLossLinks,
				].join("\n"),
				stakeETH.stakeETH
			);
		} catch (e) {
			alert(e);
		}
	};

	const CHAIN_ID = parseInt(process.env.REACT_APP_DEFAULT_NETWORK)

	useEffect(() => {
		console.log('connectingWallet triggered', account, stakeETH, account, stakeETH)
        if(chainId.chainId == CHAIN_ID) {
            if(account.loading) {
                setButtonTxt("Connecting...")
                setButtonDisabled(true)
            } else if(stakeETH.loading){
                setButtonTxt('loading...')
                setButtonDisabled(true)
            } else {
                setButtonDisabled(false)
                if(account.account && stakeETH.stakeETH == 0) {
                    setButtonTxt('loading...')
                    setButtonDisabled(true)
                    getStakeAmount()
                } else if(account.account && stakeETH.stakeETH != 0) {
                    setButtonTxt("Report")
                    setButtonDisabled(false)
                }
            }
        }

    }, [account, stakeETH])

	useEffect(() => {
		console.log('chainId triggered', chainId, CHAIN_ID, account)
        if(chainId.loading) {
            setButtonTxt("Switching...")
            setButtonDisabled(true)
        } else if(chainId.chainId != CHAIN_ID && account.account) {
            setButtonTxt("Switch Network")
        } else if(chainId.chainId == CHAIN_ID && account.account) {
            setButtonDisabled(false)
            setButtonTxt("Report")
        }
    }, [chainId, account])

	useEffect(() => {
		console.log("reportTxInfo", reportTxInfo);
		if (reportTxInfo.loading) {
			setButtonTxt("Submitting...");
			setButtonDisabled(true);
		} else if (account.account) {
			setButtonDisabled(false);
			setButtonTxt("Report");
		}
		function getSuccessMessage(txHash: string) {
			let network = chainInfo.find((item) => item.chainId == chainId.chainId);
			let url = `${network?.explorer}/tx/${txHash}`;
			return (
				<p>
					Successful <a href={url}>transaction</a>
				</p>
			);
		}

		setTxMessage({
			type: reportTxInfo.isSuccess ? "success" : "error",
			message: reportTxInfo.isSuccess
				? getSuccessMessage(reportTxInfo.txHash)
				: reportTxInfo.error || "",
			description: "",
		});
	}, [reportTxInfo]);

	async function handleButtonClick() {
		if (!account.account) {
			connectWallet();
		} else if(buttonTxt == 'Switch Network') {
            switchNetwork()
        } else if (buttonTxt == "Report") {
			reportDomain();
		} else {
			alert(`Setting not available: ${buttonTxt}`);
		}
	}

	return (
		<div>
			<Form
				layout="vertical"
				name="reviewDomain"
				initialValues={{ remember: true }}
				// onFinish={onFinish}
				// onFinishFailed={onFinishFailed}
				autoComplete="off"
			>
				<div
					style={{
						width: "100%",
						display: "flex",
						alignItems: "center",
						gap: "8px",
					}}
				>
					<Form.Item
						label={<b>Fraud type</b>}
						name="fraudType"
						rules={[{ required: true }]}
						style={{
							flex: 1,
						}}
					>
						<Select
							style={{
								borderRadius: "10px",
							}}
							onChange={(value) => onFraudInfoChange("type", value)}
							value={fraudInfo.type}
							options={[
								{
									value: "financial-loss",
									label: "Financial Loss Attack",
								},
								{
									value: "phishing",
									label: "Phishing",
								},
							]}
						/>
					</Form.Item>
					<Tooltip title={<FraudTypeTooltipText />} placement="topRight">
						<InfoIconContainer />
					</Tooltip>
				</div>

				{fraudInfo.type == "phishing" ? (
					<Form.Item
						label={
							<b>
								Which legitimate website is being imitated by this website? and
								How does it trick people?
							</b>
						}
						name="phishingInfo"
						rules={[{ required: true }]}
					>
						<TextArea
							style={{lineHeight: 1.3}}
							rows={5}
							value={fraudInfo.explanation}
							onChange={(event) =>
								onFraudInfoChange("explanation", event.target.value)
							}
							placeholder={[
								"This website is trying to imitate uniswap.org.",
								"How? This website uses original logos and similar design as Uniswap. It prompts users to connect wallet and then automatically triggers Approve transactions to drain users wallet.",
							].join("\n")}
						/>
						{/* <span>Use this template message</span> */}
					</Form.Item>
				) : null}

				{fraudInfo.type == "financial-loss" ? (
					<Form.Item
						name="financialLossInfo"
						label={<b>How does this website lead to a financial loss?</b>}
						required={true}
						rules={[
							{
								required: true,
							},
						]}
					>
						<TextArea
							rows={5}
							value={fraudInfo.explanation}
							onChange={(event) =>
								onFraudInfoChange("explanation", event.target.value)
							}
							placeholder="Example: The website tries to look like a legitimate NFT site and claims to drop free NFTs to users. Upon interaction with the site, the website automatically trigger Approve token transactions to drain connected wallet."
						/>
					</Form.Item>
				) : null}

				<Form.Item
					name="financialLossLinks"
					label={
						<b>
							If you have lost funds because of this website, include the
							transaction hash links
						</b>
					}
				>
					<TextArea
						name="financialLossLinks"
						rows={3}
						value={fraudInfo.financialLossLinks}
						onChange={(event) =>
							onFraudInfoChange("financialLossLinks", event.target.value)
						}
					/>
				</Form.Item>

				<Evidence fileList={fileList} setFileList={setFileList}></Evidence>
				<div style={{ display: "flex" }}>
					{chainId.chainId != CHAIN_ID && account.account?
						<div>
						<p style={{paddingRight: '25px', paddingBlock: '2px', color: 'red', fontWeight: '600', fontSize: '13px'}}>Incorrect Network</p>
						</div>
						:
						<div>
					{account.account ? (
						<Tooltip
							title="This is required to create a report. If deemed correct, you get your stake back along with additional rewards. If incorrect, entire stake is slashed."
							style={{ cursor: "pointer" }}
						>
							<Button
								disabled={true}
								style={{
									background: "white",
									color: "black",
									cursor: "pointer !important",
								}}
							>
								<b style={{ paddingRight: "5px" }}>STAKE:</b>{" "}
								{stakeETH.stakeETH} MATIC
							</Button>
						</Tooltip>
					) : (
						<></>
					)}
					</div>
                    }
					<Button
						type="primary"
						onClick={handleButtonClick}
						disabled={buttonDisabled}
					>
						{buttonTxt}
					</Button>
				</div>
				{txMessage.message ? (
					<Alert
						message={txMessage.message}
						type={txMessage.type}
						description={txMessage.description}
						showIcon
						style={{ marginTop: "10px" }}
					/>
				) : (
					<></>
				)}
			</Form>
		</div>
	);
}
