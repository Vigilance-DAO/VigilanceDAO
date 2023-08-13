import React from "react";
import {
  Button,
  Image,
  Stack,
  Text,
  ButtonGroup,
  Icon,
  Link,
  VStack,
} from "@chakra-ui/react";
import ArrowOutwardIcon from "@mui/icons-material/ArrowOutward";
import ellipse from "../../assets/ellipse-bottom-left.svg";
import gradient from "../../assets/gradient.png";
import { FaDiscord } from "react-icons/fa";
import TwitterIcon from "@mui/icons-material/Twitter";

function Hero() {
  return (
    <VStack
      justifyContent="center"
      minHeight="100vh"
      width="100%"
      position="relative"
    >
      {/* <Stack
        direction={{ base: "column", md: "row" }}
        // gap={{ base: "1rem", md: "0rem" }}
        justifyContent="center"
        alignItems="center"
        spacing={{ base: "1rem", md: "0.75rem" }}
        marginTop="5rem"
        zIndex="3"
      ></Stack> */}
      <Text
        lineHeight="120%"
        width={{ base: "90%", md: "80%", lg: "80%", xl: "65%" }}
        color="white"
        // fontSize={"6.5rem"}
        fontSize={{
          base: "1.8rem",
          md: "3.0rem",
          lg: "3.5rem",
          xl: "4rem",
          "2xl": "5.0rem",
        }}
        zIndex="3"
      >
        We are here to make
      </Text>
      <Text
        lineHeight="120%"
        width={{ base: "90%", md: "80%", lg: "80%", xl: "65%" }}
        color="white"
        // fontSize={"6.5rem"}
        fontSize={{
          base: "1.8rem",
          md: "3.0rem",
          lg: "3.5rem",
          xl: "4rem",
          "2xl": "5.0rem",
        }}
        zIndex="3"
      >
        web safe for everyone
      </Text>
      <Text
        zIndex="3"
        color="white"
        width={{ base: "100%", md: "50%", lg: "60%", xl: "60%", "2xl": "50%" }}
        fontWeight={300}
        fontSize={{
          md: "1.1rem",
          lg: "1.2rem",
          xl: "1.2rem",
          "2xl": "1.45rem",
        }}
        marginTop="1.5rem"
      >
        Decentralised Internet organisation
      </Text>
      <Text
        zIndex="3"
        color="white"
        width={{ base: "60%", md: "50%", lg: "60%", xl: "60%", "2xl": "50%" }}
        fontWeight={300}
        fontSize={{
          md: "1.1rem",
          lg: "1.2rem",
          xl: "1.2rem",
          "2xl": "1.45rem",
        }}
      >
        that protects you online
      </Text>

      <Stack
        direction={{ base: "column", md: "row" }}
        // gap={{ base: "1rem", md: "0rem" }}
        justifyContent="center"
        alignItems="center"
        spacing={{ base: "1rem", md: "0.75rem" }}
        marginTop="3rem"
        zIndex="3"
      >
        <Button
          variant="solid"
          as="a"
          href="https://chrome.google.com/webstore/detail/web3-vigilance-browser-se/olgmmbfdmfbnihhcfhalglddbjobgpli?hl=en&utm_source=landing&utm_medium=main_cta&utm_campaign=infinity"
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
          }}
        >
          Download Extension
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
      </Stack>
      <Stack style={{ marginTop: "50px" }}>
        <ButtonGroup gap="1" style={{ zIndex: 10000 }}>
          <Link href="https://twitter.com/VigilanceDao" isExternal>
            {/* <TwitterIcon color /> */}
            <Icon as={TwitterIcon} color="white" boxSize={6} />
          </Link>
          <Link href="https://discord.gg/xUSf2zdYmD" isExternal>
            <Icon as={FaDiscord} color="white" boxSize={6} />
          </Link>
        </ButtonGroup>
      </Stack>
      {/* <Stack
        direction={{ base: "row", md: "row" }}
        // gap={{ base: "1rem", md: "0rem" }}
        justifyContent="top"
        alignItems="top"
        spacing={{ base: "1rem", md: "0.75rem" }}
        marginTop="5rem"
        zIndex="3"
      >
        <Text
          zIndex="3"
          color="#b89fdf"
          width={{ base: "50%" }}
          fontWeight={300}
          fontSize={{
            md: "0.65rem",
            lg: "0.7rem",
            xl: "0.7rem",
            "2xl": "1.0rem",
          }}
          marginRight="1.5rem"
        >
          Powered by
          <Image src={polygon_blockchain_logo} height="50px" />
        </Text>
        <Text
          zIndex="3"
          color="#b89fdf"
          width={{ base: "50%" }}
          fontWeight={300}
          fontSize={{
            md: "0.65rem",
            lg: "0.7rem",
            xl: "0.7rem",
            "2xl": "1.0rem",
          }}
          marginLeft="1.5rem"
        >
          Backed by
          <Image
            src="https://grants.filecoin.io/vintage/images/filecoin-logo.png"
            height="35px"
            marginTop="7px"
          />
        </Text>
      </Stack> */}
      {/* <Stack
        direction={{ base: "column", md: "row" }}
        // gap={{ base: "1rem", md: "0rem" }}
        justifyContent="center"
        alignItems="center"
        spacing={{ base: "1rem", md: "0.75rem" }}
        marginTop="3rem"
        zIndex="3"
      ></Stack> */}

      <Image
        position="absolute"
        bottom="0"
        marginTop="auto"
        src={gradient}
        width="100%"
        zIndex="1"
      />
      <Image
        position="absolute"
        bottom="0"
        // left="0"
        marginTop="auto"
        src={ellipse}
        width={{ base: "100%" }}
        zIndex="2"
      />
    </VStack>
  );
}

export default Hero;
