import { Space, Typography, Button } from "antd";

import "./domain-card.css";

type VoteValue = "safe" | "unsafe";

export interface DomainCardInfo {
	domain: string;
	unsafeRating: number;
	registeredOn: number;
}

interface Props {
	domainInfo: DomainCardInfo;
	onVoted?: (value: VoteValue) => void;
}

export default function DomainCard(props: Props) {
	const vote = (value: VoteValue) => {
		if (props.onVoted) {
			props.onVoted(value);
		}
	};

	return (
		<div className="domain-card">
			<div className="main">
				<Typography.Title level={3}>{props.domainInfo.domain}</Typography.Title>
				<div className="unsafe-rating">{props.domainInfo.unsafeRating}%</div>
				<Typography.Text>think this is unsafe</Typography.Text><br/>

				<Space
					size={12}
					align="center"
					direction="horizontal"
					style={{ marginTop: "16px" }}
				>
					<Button
						onClick={(e) => {
							vote("safe");
						}}
					>
						I think it's safe
					</Button>
					<Button
						onClick={(e) => {
							vote("unsafe");
						}}
					>
						I think it's unsafe
					</Button>
				</Space>
			</div>

			<p>
				<b>Registered on: </b>
				{props.domainInfo.registeredOn
					? new Date(props.domainInfo.registeredOn).toLocaleDateString()
					: "NA"}
			</p>
		</div>
	);
}
