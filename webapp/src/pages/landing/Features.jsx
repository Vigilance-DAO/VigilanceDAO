import { Box, Image, Stack, Text, VStack } from "@chakra-ui/react";
import React from "react";
import feature_1 from "../../assets/feature_1.png";
import feature_2 from "../../assets/feature_2.webp";
import feature_3 from "../../assets/feature_3.webp";
import { GraphIcon, MoneyIcon, ShieldIcon } from "Icons";

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
        Features
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
          >
            <Text
              as="span"
              fontSize={{ base: "1rem", md: "1.5rem", lg: "2rem" }}
            >
              #
            </Text>
            1: Feature 1
          </Text>
          <Text
            fontSize={{ base: "1rem", md: "1rem", lg: "1.1rem", xl: "1.2rem" }}
            align={{ base: "center", md: "left" }}
          >
            Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
            eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim
            ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut
            aliquip ex ea commodo consequat. Duis aute irure
          </Text>
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
          >
            <Text
              as="span"
              fontSize={{ base: "1rem", md: "1.5rem", lg: "2rem" }}
            >
              #
            </Text>
            2: Feature 2
          </Text>
          <Text
            fontSize={{ base: "1rem", md: "1rem", lg: "1.1rem", xl: "1.2rem" }}
            align={{ base: "center", md: "left" }}
          >
            Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
            eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim
            ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut
            aliquip ex ea commodo consequat. Duis aute irure
          </Text>
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
          >
            <Text
              as="span"
              fontSize={{ base: "1rem", md: "1.5rem", lg: "2rem" }}
            >
              #ert
            </Text>
            3: Feature 3
          </Text>
          <Text
            fontSize={{ base: "1rem", md: "1rem", lg: "1.1rem", xl: "1.2rem" }}
            align={{ base: "center", md: "left" }}
          >
            Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
            eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim
            ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut
            aliquip ex ea commodo consequat. Duis aute irure
          </Text>
        </VStack>
      </Stack>
    </Stack>
  );
}

export default Features;
