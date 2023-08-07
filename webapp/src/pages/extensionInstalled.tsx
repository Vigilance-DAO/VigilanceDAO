import {
	Flex,
	Heading,
	Button,
	Image,
	Text,
	Link,
	Box,
	Grid,
} from "@chakra-ui/react";

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
	return <Flex as="li" direction="column" background="#bfbfbf">
		<Box height="240px">
		<Image src={props.imageSrc} width="100%" height="auto" margin="auto"/>						
		</Box>
		<Text>{props.description}</Text>
	</Flex>
}

export default function ExtensionInstalled() {
	return (
		<>
			<Flex
				direction="column"
				align="center"
				style={{
					maxWidth: MAX_WIDTH,
					margin: "0 auto",
					padding: "80px 0 70px",
				}}
			>
				<Image src={logo} />
				<Heading
					as="h1"
					style={{
						maxWidth: "20ch",
						margin: "40px auto",
						fontSize: "3rem",
						textAlign: "center",
					}}
				>
					Thank you for installing our extension
				</Heading>
				<Flex
					gap="10px"
					maxWidth="90%"
					style={{
						flexWrap: "wrap",
						justifyContent: "center",
					}}
				>
					<Button
						variant="solid"
						as="a"
						href="https://chrome.google.com/webstore/detail/web3-vigilance-browser-se/olgmmbfdmfbnihhcfhalglddbjobgpli?hl=en"
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
						style={{
							boxShadow: "0px 4px 156px #8C00FB",
							width: "fit-content",
						}}
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
						style={{
							boxShadow: "0px 4px 156px rgba(140, 0, 251, 0.25)",
							color: "white",
						}}
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
			<Box
				style={{
					maxWidth: MAX_WIDTH,
					margin: "0 auto 100px auto"
				}}
			>
				<Heading as="h2" marginBottom="30px">Features</Heading>
				
				<Grid as="ul" listStyleType="none" gridTemplateColumns="repeat(auto-fit, minmax(250px, 1fr) )" gap="20px">
					<FeatureCard  imageSrc={featureAlerts} description="Get notified when you land on suspicious domains" />
					<FeatureCard  imageSrc={featureTransactionAnalysis} description="Get transaction analysis before you do a transaction" />
					<FeatureCard  imageSrc={featureReportAndEarn} description="Report scam sites and contracts and earn rewards for protecting the community." />
				</Grid>
			</Box>
		</>
	);
}
