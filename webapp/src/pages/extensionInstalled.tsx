import {
	Flex,
	Heading,
	Button,
	Image,
	Text,
	Link,
	Box,
	Grid,
	OrderedList,
	ListItem
} from "@chakra-ui/react";

import { useMemo } from "react";
import { useLocation, Link as RouterLink } from "react-router-dom";

import logo from "../assets/icon128.png";

import featureAlerts from "../assets/feature-alerts.webp";
import featureReportAndEarn from "../assets/feature-report-and-earn.webp";
import featureTransactionAnalysis from "../assets/feature-transaction-analysis.webp";

const MAX_WIDTH = "min(92vw, 72rem)";

interface FeatureCardProps {
	imageSrc: string;
	description: string;
}

function FeatureCard(props: FeatureCardProps) {
	return (<Flex as="li" direction="column" background="#313479">
		<Box height="240px">
			<Image src={props.imageSrc} width="100%" height="240px" margin="auto" objectFit={"cover"}/>						
		</Box>
		<Text padding="10px">{props.description}</Text>
	</Flex>)
}

function CloseIcon() {
	return (
		<svg
			className="icon icon-tabler icon-tabler-x"
			width="24"
			height="24"
			viewBox="0 0 24 24"
			strokeWidth="2"
			stroke="currentColor"
			fill="none"
			strokeLinecap="round"
			strokeLinejoin="round"
			style={{
				marginTop: "6px"
			}}
		>
			<path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
			<path d="M18 6l-12 12"></path>
			<path d="M6 6l12 12"></path>
		</svg>
	);
}

export default function ExtensionInstalled() {
	const search = useLocation().search;
	const isOpenedOnExtensionInstallation = useMemo(() => {
		const reason = new URLSearchParams(search).get("reason");
		return reason == "install";
	}, [search]);

	return (
		<>
			<Flex
				direction="column"
				align="center"
				maxWidth={MAX_WIDTH}
				margin="0 auto"
				padding="80px 0 70px"
			>
				<Link href="https://vigilancedao.org"><Image src={logo} /></Link>
				<Heading
					as="h1"
					maxWidth="20ch"
					margin="40px auto"
					fontSize="3rem"
					textAlign="center"
				>
					Thank you for installing our extension
				</Heading>
				<Text marginBottom={10}>
					That's all Web3 Vigilants. The extension will notify you if you
					interact with fraudsters.
				</Text>
				<Flex
					gap="10px"
					maxWidth="90%"
					flexWrap="wrap"
					justifyContent="center"
				>
					<Button
						variant="solid"
						as="a"
						href="https://discord.gg/jEvsRffm"
						target="_blank"
						size={{ base: "md", md: "lg" }}
						bgColor="#5400CD"
						borderRadius="0.125rem"
						paddingInline={"1rem"}
						paddingY="0.75rem"
						color="white"
						lineHeight="120%"
						fontWeight={600}
						fontSize="1.125rem"
						_hover={{
							bgColor: "#3c0191",
						}}
						boxShadow="0px 4px 156px #8C00FB"
						width="fit-content"
					>
						Join Our Discord Server
					</Button>

					<Button
						variant="outline"
						size={{ base: "md", md: "lg" }}
						as="a"
						target="_blank"
						href="https://docs.vigilancedao.org/"
						borderColor="#5400CD"
						borderStyle="solid"
						borderWidth="0.1rem"
						paddingInline={"1rem"}
						paddingY="0.75rem"
						bgColor="rgba(84, 0, 205, 0.05)"
						borderRadius="0.125rem"
						_hover={{
							color: "whiteAlpha.600",
							bgColor: "#3c0191",
						}}
							boxShadow= "0px 4px 156px rgba(140, 0, 251, 0.25)"
							color= "white"
					>
						See how it works
					</Button>
				</Flex>
				<Flex marginTop="20px">
					<Text>
						Follow us on{" "}
						<Link
							href="https://twitter.com/VigilanceDao"
							textDecoration="underline"
						>
							Twitter/X
						</Link>
					</Text>
				</Flex>
			</Flex>
			{isOpenedOnExtensionInstallation ? (
				<Box
					position="absolute"
					top="10px"
					right="10px"
					backgroundColor="hsl(240 71% 29% / 1)"
					borderRadius="4px"
					padding="10px 18px"
				>
					<Flex justifyContent="space-between">
						<Heading
							as="h3"
							fontSize="1.6rem"
							maxWidth="20ch"
							marginBottom="18px"
						>
							Pin our extension
						</Heading>

						<RouterLink to="/extension-installed">
							<CloseIcon />
						</RouterLink>
					</Flex>
					<Text maxWidth="38ch" lineHeight="1.1em">
						And get instant feedback —including Domain Alerts & Contract
						Information— on various sites you visit.
					</Text>
					<Flex gap="4px" margin="10px 0 18px">
						<img src="/alert.png" />
						<img src="/verified.png" />
					</Flex>

					<OrderedList marginTop="10px" maxWidth="32ch" lineHeight="1.3em">
						<ListItem>
							Click{" "}
							<strong>
								<i>Extensions</i>{" "}
							</strong>{" "}
							<img
								src="/extensions.png"
								style={{
									verticalAlign: "middle",
									display: "inline",
								}}
							/>
							icon
						</ListItem>
						<ListItem>
							Find{" "}
							<strong>
								<i>Web3 Vigilance - Browser Security</i>
							</strong>{" "}
							& Click pin icon
							<img src="/pin-image.png" />
						</ListItem>
					</OrderedList>
				</Box>
			) : null}
		</>
	);
}
