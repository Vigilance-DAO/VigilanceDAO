import React from "react";
// import "./App.css";
// import AppBar from '@mui/material/AppBar';
import { Button, Flex, HStack, Image, Stack, Text } from "@chakra-ui/react";
import ArrowOutwardIcon from "@mui/icons-material/ArrowOutward";
import ellipse from "./assets/ellipse1.svg";
import gradient from "./assets/gradient.png";

function App() {
  return (
    <Flex
      direction="column"
      alignItems="center"
      justifyContent="center"
      textAlign="center"
      minHeight="100vh"
      position="relative"
    >
      <Text
        lineHeight="120%"
        width={{ base: "90%", md: "80%", lg: "80%", xl: "65%" }}
        color="white"
        // fontSize={"6.5rem"}
        fontSize={{
          base: "2rem",
          md: "3.8rem",
          lg: "4rem",
          xl: "5rem",
          "2xl": "6.5rem",
        }}
        zIndex="3"
      >
        We are here to make web3 safe for everyone
      </Text>
      <Text
        zIndex="3"
        color="white"
        width={{ base: "60%", md: "50%", lg: "40%", xl: "25%", "2xl": "24%" }}
        fontWeight={300}
        fontSize={{
          md: "1.4rem",
          lg: "1.5rem",
          xl: "1.5rem",
          "2xl": "1.75rem",
        }}
        marginTop="1.5rem"
      >
        Find something phishy? Report it and we will take it down
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
          href="https://github.com/VenkatTeja/VigilanceDAO/releases/tag/beta"
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
          color="white"
          borderColor="#5400CD"
          borderStyle="solid"
          borderWidth="0.1rem"
          paddingInline={"1rem"}
          paddingY="0.75rem"
          bgColor="rgba(84, 0, 205, 0.05)"
          borderRadius="0.125rem"
          _hover={{
            color: "whiteAlpha.600",
          }}
          style={{
            boxShadow: "0px 4px 156px rgba(140, 0, 251, 0.25)",
          }}
        >
          See how it works
        </Button>
      </Stack>
      <Image
        src={ellipse}
        width={{ base: "40%", md: "40%", lg: "40%", xl: "40%", "2xl": "30%" }}
        zIndex="3"
        opacity="0%"
      />
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
        marginTop="auto"
        src={ellipse}
        width={{ base: "100%", xl: "80%", "2xl": "60%" }}
        zIndex="2"
      />
    </Flex>
  );
}

export default App;
