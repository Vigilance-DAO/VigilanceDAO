import { Box, Image, Stack, Text, VStack, Button } from "@chakra-ui/react";
import React from "react";
import feature_1 from "../../assets/feature_1.png";
import feature_2 from "../../assets/feature_2.webp";
import feature_3 from "../../assets/feature_3.webp";
import { GraphIcon, MoneyIcon, ShieldIcon } from "Icons";
import ArrowOutwardIcon from "@mui/icons-material/ArrowOutward";

function Features() {
  return (
    <Stack
      direction="column"
      spacing={{ base: "4rem", md: "8rem", xl: "6rem" }}
      color="white"
      width="80%"
      minHeight="80vh"
    >
      <Text fontSize={{ base: "2rem", md: "4rem" }} marginTop="4rem">
        Road to Web3 Safety
      </Text>
      <Stack // stack 1
        direction={{ base: "column", md: "row" }}
        spacing={{ base: "2rem", md: "3rem", lg: "4rem", xl: "8rem" }}
        marginY="2rem"
        width="100%"
        justifyContent="space-between"
      >
        <Box
          width={{ base: "100%", md: "50%", lg: "50%" }}
          position="relative"
          display="flex"
          justifyContent="center"
          alignItems="center"
        >
          <Image borderRadius="1rem" width="100%" src={feature_1} />
          <ShieldIcon
            position="absolute"
            top={{ base: "-5", md: "-3", lg: "-6", xl: "-10" }}
            right={{ base: "-5", md: "-6", lg: "-6", xl: "-8" }}
            color="white"
            fontSize={{ base: "2.5rem", md: "3rem", lg: "3rem", xl: "4rem" }}
          />
        </Box>
        <VStack
          alignItems="left"
          justifyContent="center"
          width={{ base: "100%", md: "50%", lg: "50%" }}
        >
          <Text
            fontSize={{ base: "2rem", md: "4rem" }}
            align={{ base: "center", md: "left" }}
            opacity="70%"
            fontWeight="bold"
            lineHeight="100%"
            marginBottom={5}
          >
            Avoid Risky Websites
          </Text>
          <Text
            fontSize={{ base: "1rem", md: "1rem", lg: "1.1rem", xl: "1.2rem" }}
            align={{ base: "center", md: "left" }}
          >
            Guarding against risky websites is our priority. 
            We gather insights from diverse web3 security platforms and our own built-in 
            crowdsourcing system to ensure your safety online.
          </Text>
          <Button
            variant="solid"
            as="a"
            href="https://chrome.google.com/webstore/detail/web3-vigilance-browser-se/olgmmbfdmfbnihhcfhalglddbjobgpli?hl=en&utm_source=landing&utm_medium=feat1&utm_campaign=infinity"
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
            rightIcon={<ArrowOutwardIcon />}
            _hover={{
              bgColor: "#3c0191",
            }}
            style={{
              boxShadow: "0px 4px 156px #8C00FB",
              maxWidth: '220px',
              marginTop: '50px'
            }}
          >
            Turn on Protection
          </Button>
        </VStack>
      </Stack>
      <Stack // stack 2
        direction={{ base: "column-reverse", md: "row" }}
        spacing={{ base: "2rem", md: "3rem", lg: "4rem", xl: "8rem" }}
        marginY="2rem"
        width="100%"
        justifyContent="space-between"
      >
        <VStack
          alignItems="left"
          justifyContent="center"
          width={{ base: "100%", md: "50%", lg: "50%" }}
        >
          <Text
            fontSize={{ base: "2rem", md: "4rem" }}
            align={{ base: "center", md: "left" }}
            opacity="70%"
            fontWeight="bold"
            lineHeight="100%"
            marginBottom={5}

          >
            Pre-Transaction Analysis
          </Text>
          <Text
            fontSize={{ base: "1rem", md: "1rem", lg: "1.1rem", xl: "1.2rem" }}
            align={{ base: "center", md: "left" }}
          >
            Through transaction and contract analysis, we identify potential risk factors to show you before you do a transaction.
            Just install the extension and you should be able to see a popup the next time you do a transaction on Metamask.
          </Text>
          <Text
            fontSize={{ base: "1rem", md: "1rem", lg: "1.1rem", xl: "1.2rem" }}
            align={{ base: "center", md: "left" }}
          >
            We currently support Ethereum and Polygon chains only.
          </Text>
          <Button
            variant="solid"
            as="a"
            href="https://chrome.google.com/webstore/detail/web3-vigilance-browser-se/olgmmbfdmfbnihhcfhalglddbjobgpli?hl=en&utm_source=landing&utm_medium=feat2&utm_campaign=infinity"
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
            rightIcon={<ArrowOutwardIcon />}
            _hover={{
              bgColor: "#3c0191",
            }}
            style={{
              boxShadow: "0px 4px 156px #8C00FB",
              maxWidth: '200px',
              marginTop: '50px'
            }}
          >
            Turn on insights
          </Button>
        </VStack>
        <Box
          width={{ base: "100%", md: "50%", lg: "50%" }}
          position="relative"
          display="flex"
          justifyContent="center"
          alignItems="center"
        >
          {" "}
          <Image borderRadius="1rem" width="100%" src={feature_2} />
          <GraphIcon
            position="absolute"
            bottom={{ base: "-5", md: "2", lg: "-2", xl: "-8" }}
            right={{ base: "-5", md: "-6", lg: "-5", xl: "-8" }}
            color="white"
            fontSize={{ base: "2.5rem", md: "3rem", lg: "3rem", xl: "4rem" }}
          />
        </Box>
      </Stack>
      <Stack // stack 3
        direction={{ base: "column", md: "row" }}
        spacing={{ base: "2rem", md: "3rem", lg: "4rem", xl: "8rem" }}
        marginY="2rem"
        width="100%"
        justifyContent="space-between"
      >
        <Box
          width={{ base: "100%", md: "50%", lg: "50%" }}
          position="relative"
          display="flex"
          justifyContent="center"
          alignItems="center"
        >
          <Image borderRadius="1rem" width="100%" src={feature_3} />
          <MoneyIcon
            position="absolute"
            bottom={{ base: "-5", md: "0", lg: "-5", xl: "-8" }}
            right={{ base: "-5", md: "-5", lg: "-6", xl: "-8" }}
            color="white"
            fontSize={{ base: "2.5rem", md: "3rem", lg: "3rem", xl: "4rem" }}
          />
        </Box>
        <VStack
          alignItems="left"
          justifyContent="center"
          width={{ base: "100%", md: "50%", lg: "50%" }}
        >
          <Text
            fontSize={{ base: "2rem", md: "4rem" }}
            align={{ base: "center", md: "left" }}
            opacity="70%"
            fontWeight="bold"
            lineHeight="100%"
            marginBottom={5}
          >
            Report & Earn
          </Text>
          <Text
            fontSize={{ base: "1rem", md: "1rem", lg: "1.1rem", xl: "1.2rem" }}
            align={{ base: "center", md: "left" }}
          >
            Empower the community with our in-built reporting system, enabling you to report scammers and earn rewards as you contribute to community protection. 
          </Text>
          
          <Text
            fontSize={{ base: "1rem", md: "1rem", lg: "1.1rem", xl: "1.2rem" }}
            align={{ base: "center", md: "left" }}
          >
            Our on-chain infrastructure welcomes reports from anyone, initiating a thorough validation process. Through a carefully designed incentive mechanism, we prioritize the validation of accurate reports while appropriately addressing others, fostering a secure environment for all.
          </Text>
          <Button
            variant="outline"
            size={{ base: "md", md: "lg" }}
            as="a"
            target="_blank"
            href="https://docs.vigilancedao.org/v1/tutorial/how-to-report-and-protect-others"
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
              maxWidth: '200px',
              marginTop: '50px'
            }}
          >
            Learn more
          </Button>
        </VStack>
      </Stack>
    </Stack>
  );
}

export default Features;
